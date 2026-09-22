import pb from '@/lib/pocketbase/client'
import type { TeacherNote, Child } from '@/types/cognikids'
import { teacherNotesService } from '@/services/teacherNotes'

export interface TeacherNoteNotification {
  id: string
  noteId: string
  childId: string
  childName: string
  schoolCode: string
  authorName: string
  lessonActivity: string
  observation: string
  tags: string[]
  noteDate: string
  created: string
  isRead: boolean
  isOfflineSync?: boolean
}

const READ_NOTES_STORAGE_PREFIX = 'cognikids_read_teacher_notes_'
const SHOWN_TOASTS_STORAGE_PREFIX = 'cognikids_shown_note_toasts_'

/**
 * TeacherNotificationService
 * Gerencia notificações de anotações do professor para os pais no CogniKids PWA:
 * - Detecta novas anotações para as crianças sob tutela do responsável conectado
 * - Suporta leitura em tempo real (PocketBase realtime)
 * - Suporta sincronização de volta do offline (quando o professor ou dispositivo sincroniza)
 * - Persiste anotações lidas por usuário/dispositivo no localStorage
 * - Emite eventos para badges, toasts, banners e listas
 */
class TeacherNotificationService {
  private listeners: Array<(notifications: TeacherNoteNotification[]) => void> = []
  private cachedNotifications: TeacherNoteNotification[] = []
  private isSubscribedToRealtime = false
  private currentUserId: string | null = null
  private childrenCache: Child[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      // Quando a rede volta, revalida anotações das crianças
      window.addEventListener('online', () => {
        this.syncAndCheckNotifications()
      })

      // Escuta mudanças na sincronização de anotações do professor
      teacherNotesService.onSyncChange(() => {
        this.syncAndCheckNotifications()
      })
    }
  }

  private getReadStorageKey(userId?: string): string {
    const uid = userId || this.currentUserId || pb.authStore.model?.id || 'anonymous'
    return `${READ_NOTES_STORAGE_PREFIX}${uid}`
  }

  private getShownToastStorageKey(userId?: string): string {
    const uid = userId || this.currentUserId || pb.authStore.model?.id || 'anonymous'
    return `${SHOWN_TOASTS_STORAGE_PREFIX}${uid}`
  }

  public getReadNoteIds(userId?: string): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = localStorage.getItem(this.getReadStorageKey(userId))
      if (!raw) return new Set()
      const arr: string[] = JSON.parse(raw)
      return new Set(arr)
    } catch {
      return new Set()
    }
  }

  public markAsRead(noteId: string, userId?: string) {
    if (typeof window === 'undefined') return
    try {
      const set = this.getReadNoteIds(userId)
      set.add(noteId)
      localStorage.setItem(this.getReadStorageKey(userId), JSON.stringify(Array.from(set)))

      // Atualiza cache em memória
      this.cachedNotifications = this.cachedNotifications.map((n) =>
        n.noteId === noteId ? { ...n, isRead: true } : n,
      )
      this.notifyListeners()
    } catch (err) {
      console.warn('Failed to persist read note', err)
    }
  }

  public markAllAsRead(userId?: string) {
    if (typeof window === 'undefined') return
    try {
      const set = this.getReadNoteIds(userId)
      this.cachedNotifications.forEach((n) => set.add(n.noteId))
      localStorage.setItem(this.getReadStorageKey(userId), JSON.stringify(Array.from(set)))

      this.cachedNotifications = this.cachedNotifications.map((n) => ({ ...n, isRead: true }))
      this.notifyListeners()
    } catch (err) {
      console.warn('Failed to mark all notes as read', err)
    }
  }

  public hasShownToast(noteId: string, userId?: string): boolean {
    if (typeof window === 'undefined') return false
    try {
      const raw = localStorage.getItem(this.getShownToastStorageKey(userId))
      if (!raw) return false
      const set: string[] = JSON.parse(raw)
      return set.includes(noteId)
    } catch {
      return false
    }
  }

  public markToastShown(noteId: string, userId?: string) {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(this.getShownToastStorageKey(userId))
      const arr: string[] = raw ? JSON.parse(raw) : []
      if (!arr.includes(noteId)) {
        arr.push(noteId)
        localStorage.setItem(this.getShownToastStorageKey(userId), JSON.stringify(arr))
      }
    } catch (err) {
      console.warn('Failed to mark toast shown', err)
    }
  }

  public subscribe(listener: (notifications: TeacherNoteNotification[]) => void) {
    this.listeners.push(listener)
    listener(this.cachedNotifications)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    const list = [...this.cachedNotifications]
    this.listeners.forEach((l) => l(list))
  }

  /**
   * Inicializa o rastreamento para uma lista de crianças do responsável logado
   */
  public async initForChildren(
    children: Child[],
    userId?: string,
  ): Promise<TeacherNoteNotification[]> {
    this.childrenCache = children
    if (userId) this.currentUserId = userId

    if (children.length === 0) {
      this.cachedNotifications = []
      this.notifyListeners()
      return []
    }

    return this.refreshNotifications()
  }

  /**
   * Recarrega todas as anotações das crianças vinculadas (PocketBase + fila local offline)
   */
  public async refreshNotifications(): Promise<TeacherNoteNotification[]> {
    if (this.childrenCache.length === 0) return []

    const childMap = new Map<string, Child>()
    this.childrenCache.forEach((c) => childMap.set(c.id, c))

    const childIds = this.childrenCache.map((c) => c.id)
    const readSet = this.getReadNoteIds()

    // 1. Busca anotações do backend
    let serverNotes: TeacherNote[] = []
    try {
      const filterConditions = childIds.map((id) => `child_id = '${id}'`).join(' || ')
      if (filterConditions) {
        const records = await pb.collection('teacher_notes').getFullList<TeacherNote>({
          filter: filterConditions,
          sort: '-note_date',
        })
        serverNotes = records.map((r) => ({ ...r, synced: true }))
      }
    } catch (err) {
      console.warn('Could not fetch server teacher notes for parent notifications', err)
    }

    // 2. Busca anotações pendentes da fila local (ex: criadas no modo offline pelo professor no mesmo dispositivo)
    const pendingNotes = teacherNotesService
      .getPendingQueue()
      .filter((n) => childIds.includes(n.child_id))

    // 3. Combina e desduplica
    const combinedNotes = [...pendingNotes, ...serverNotes]
    const noteMap = new Map<string, TeacherNote>()
    combinedNotes.forEach((n) => {
      if (!noteMap.has(n.id)) {
        noteMap.set(n.id, n)
      }
    })

    const notifications: TeacherNoteNotification[] = Array.from(noteMap.values())
      .map((note) => {
        const kid = childMap.get(note.child_id)
        const isRead = readSet.has(note.id)

        return {
          id: `notif_${note.id}`,
          noteId: note.id,
          childId: note.child_id,
          childName: kid?.name || 'Criança',
          schoolCode: note.school_code || 'ESCOLA',
          authorName: note.author_name || 'Professor(a)',
          lessonActivity: note.lesson_activity,
          observation: note.observation || '',
          tags: note.tags || [],
          noteDate: note.note_date || note.created,
          created: note.created,
          isRead,
          isOfflineSync: note.synced === false,
        }
      })
      .sort((a, b) => new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime())

    this.cachedNotifications = notifications
    this.notifyListeners()
    return notifications
  }

  /**
   * Processa uma anotação recebida em tempo real via PocketBase realtime
   */
  public handleRealtimeRecord(record: TeacherNote, action: 'create' | 'update' | 'delete') {
    const kid = this.childrenCache.find((c) => c.id === record.child_id)
    if (!kid) return // Não pertence às crianças deste responsável

    if (action === 'delete') {
      this.cachedNotifications = this.cachedNotifications.filter((n) => n.noteId !== record.id)
      this.notifyListeners()
      return
    }

    const readSet = this.getReadNoteIds()
    const isRead = readSet.has(record.id)

    const notifItem: TeacherNoteNotification = {
      id: `notif_${record.id}`,
      noteId: record.id,
      childId: record.child_id,
      childName: kid.name,
      schoolCode: record.school_code || 'ESCOLA',
      authorName: record.author_name || 'Professor(a)',
      lessonActivity: record.lesson_activity,
      observation: record.observation || '',
      tags: record.tags || [],
      noteDate: record.note_date || record.created,
      created: record.created,
      isRead,
      isOfflineSync: false,
    }

    const existingIndex = this.cachedNotifications.findIndex((n) => n.noteId === record.id)
    if (existingIndex >= 0) {
      this.cachedNotifications[existingIndex] = notifItem
    } else {
      this.cachedNotifications = [notifItem, ...this.cachedNotifications]
    }

    this.notifyListeners()
  }

  public async syncAndCheckNotifications() {
    await this.refreshNotifications()
  }
}

export const teacherNotificationService = new TeacherNotificationService()
