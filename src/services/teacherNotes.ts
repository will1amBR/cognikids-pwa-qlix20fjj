import pb from '@/lib/pocketbase/client'
import type { TeacherNote } from '@/types/cognikids'

const PENDING_NOTES_KEY = 'pending_teacher_notes'

export interface CreateTeacherNoteInput {
  school_code: string
  child_id: string
  class_group?: string
  lesson_activity: string
  author_name?: string
  note_date?: string
  observation?: string
  tags?: string[]
}

/**
 * TeacherNotesService
 * Gerencia anotações pedagógicas da escola com suporte offline híbrido (localStorage)
 * e sincronização transparente com o backend Skip Cloud/PocketBase.
 */
class TeacherNotesService {
  private syncListeners: Array<(count: number) => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncPendingNotes()
      })
    }
  }

  public onSyncChange(listener: (count: number) => void) {
    this.syncListeners.push(listener)
    listener(this.getPendingQueue().length)
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    const count = this.getPendingQueue().length
    this.syncListeners.forEach((l) => l(count))
  }

  public getPendingQueue(): TeacherNote[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(PENDING_NOTES_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  private savePendingQueue(queue: TeacherNote[]) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(PENDING_NOTES_KEY, JSON.stringify(queue))
    } catch (err) {
      console.warn('Failed to save pending teacher notes to localStorage', err)
    }
    this.notify()
  }

  /**
   * Salva uma anotação pedagógica. Se estiver online, tenta persistir diretamente no PocketBase;
   * em caso de falha de rede ou offline, enfileira localmente em pending_teacher_notes.
   */
  public async saveNote(input: CreateTeacherNoteInput): Promise<TeacherNote> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    const noteDate = input.note_date || new Date().toISOString()
    const nowIso = new Date().toISOString()

    const localItem: TeacherNote = {
      id: `local_note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      school_code: input.school_code.trim().toUpperCase(),
      child_id: input.child_id,
      class_group: input.class_group?.trim() || '',
      lesson_activity: input.lesson_activity.trim(),
      author_name: input.author_name?.trim() || 'Professor(a)',
      note_date: noteDate,
      observation: input.observation?.trim() || '',
      tags: input.tags || [],
      synced: false,
      created: nowIso,
      updated: nowIso,
    }

    if (isOnline) {
      try {
        const created = await pb.collection('teacher_notes').create<TeacherNote>({
          school_code: localItem.school_code,
          child_id: localItem.child_id,
          class_group: localItem.class_group,
          lesson_activity: localItem.lesson_activity,
          author_name: localItem.author_name,
          note_date: localItem.note_date,
          observation: localItem.observation,
          tags: localItem.tags,
          synced: true,
        })
        return {
          ...created,
          synced: true,
        }
      } catch (err) {
        console.warn('Direct teacher note creation failed, falling back to local queue', err)
      }
    }

    // Offline / Network fallback
    const queue = this.getPendingQueue()
    queue.unshift(localItem)
    this.savePendingQueue(queue)
    return localItem
  }

  /**
   * Sincroniza a fila de anotações pendentes para o PocketBase
   */
  public async syncPendingNotes(): Promise<{ synced: number; failed: number }> {
    const queue = this.getPendingQueue()
    if (queue.length === 0) return { synced: 0, failed: 0 }

    const remaining: TeacherNote[] = []
    let synced = 0
    let failed = 0

    for (const item of queue) {
      try {
        await pb.collection('teacher_notes').create({
          school_code: item.school_code,
          child_id: item.child_id,
          class_group: item.class_group,
          lesson_activity: item.lesson_activity,
          author_name: item.author_name,
          note_date: item.note_date,
          observation: item.observation,
          tags: item.tags,
          synced: true,
        })
        synced++
      } catch (err) {
        console.error('Error syncing teacher note to PocketBase', item, err)
        remaining.push(item)
        failed++
      }
    }

    this.savePendingQueue(remaining)
    return { synced, failed }
  }

  /**
   * Busca anotações por código da escola (combinando servidor e fila local)
   */
  public async fetchNotesBySchool(schoolCode: string): Promise<TeacherNote[]> {
    const formattedCode = schoolCode.trim().toUpperCase()
    let serverNotes: TeacherNote[] = []

    try {
      const records = await pb.collection('teacher_notes').getFullList<TeacherNote>({
        filter: `school_code = '${formattedCode}'`,
        sort: '-note_date',
        expand: 'child_id',
      })
      serverNotes = records.map((r) => ({ ...r, synced: true }))
    } catch (err) {
      console.warn('Could not fetch server teacher notes', err)
    }

    // Merge with unsynced local notes matching this school
    const localNotes = this.getPendingQueue().filter((n) => n.school_code === formattedCode)

    // Deduplicate and sort descending by note_date
    const combined = [...localNotes, ...serverNotes]
    const map = new Map<string, TeacherNote>()
    combined.forEach((note) => {
      map.set(note.id, note)
    })

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.note_date).getTime() - new Date(a.note_date).getTime(),
    )
  }

  /**
   * Busca anotações específicas de uma criança para visualização da família
   */
  public async fetchNotesByChild(childId: string): Promise<TeacherNote[]> {
    let serverNotes: TeacherNote[] = []

    try {
      const records = await pb.collection('teacher_notes').getFullList<TeacherNote>({
        filter: `child_id = '${childId}'`,
        sort: '-note_date',
      })
      serverNotes = records.map((r) => ({ ...r, synced: true }))
    } catch (err) {
      console.warn('Could not fetch child teacher notes', err)
    }

    const localNotes = this.getPendingQueue().filter((n) => n.child_id === childId)
    const combined = [...localNotes, ...serverNotes]
    const map = new Map<string, TeacherNote>()
    combined.forEach((note) => {
      map.set(note.id, note)
    })

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.note_date).getTime() - new Date(a.note_date).getTime(),
    )
  }
}

export const teacherNotesService = new TeacherNotesService()
