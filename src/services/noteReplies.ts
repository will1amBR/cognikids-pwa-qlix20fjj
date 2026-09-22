import pb from '@/lib/pocketbase/client'
import type { NoteReply } from '@/types/cognikids'

const PENDING_REPLIES_KEY = 'pending_note_replies'

export interface CreateNoteReplyInput {
  note_id: string
  author_role: 'parent' | 'teacher'
  author_name?: string
  message: string
}

class NoteRepliesService {
  private syncListeners: Array<(count: number) => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncPendingReplies()
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

  public getPendingQueue(): NoteReply[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(PENDING_REPLIES_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  private savePendingQueue(queue: NoteReply[]) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(PENDING_REPLIES_KEY, JSON.stringify(queue))
    } catch (err) {
      console.warn('Failed to save pending note replies to localStorage', err)
    }
    this.notify()
  }

  /**
   * Salva um comentário/resposta em uma anotação pedagógica
   */
  public async addReply(input: CreateNoteReplyInput): Promise<NoteReply> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    const nowIso = new Date().toISOString()

    const localItem: NoteReply = {
      id: `local_reply_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      note_id: input.note_id,
      author_role: input.author_role,
      author_name:
        input.author_name?.trim() || (input.author_role === 'parent' ? 'Família' : 'Professor(a)'),
      message: input.message.trim(),
      synced: false,
      created: nowIso,
      updated: nowIso,
    }

    if (isOnline) {
      try {
        const created = await pb.collection('note_replies').create<NoteReply>({
          note_id: localItem.note_id,
          author_role: localItem.author_role,
          author_name: localItem.author_name,
          message: localItem.message,
          synced: true,
        })
        return {
          ...created,
          synced: true,
        }
      } catch (err) {
        console.warn('Direct reply creation failed, falling back to local queue', err)
      }
    }

    // Offline fallback
    const queue = this.getPendingQueue()
    queue.push(localItem)
    this.savePendingQueue(queue)
    return localItem
  }

  /**
   * Sincroniza a fila de respostas pendentes para o PocketBase
   */
  public async syncPendingReplies(): Promise<{ synced: number; failed: number }> {
    const queue = this.getPendingQueue()
    if (queue.length === 0) return { synced: 0, failed: 0 }

    const remaining: NoteReply[] = []
    let synced = 0
    let failed = 0

    for (const item of queue) {
      try {
        await pb.collection('note_replies').create({
          note_id: item.note_id,
          author_role: item.author_role,
          author_name: item.author_name,
          message: item.message,
          synced: true,
        })
        synced++
      } catch (err) {
        console.error('Error syncing note reply to PocketBase', item, err)
        remaining.push(item)
        failed++
      }
    }

    this.savePendingQueue(remaining)
    return { synced, failed }
  }

  /**
   * Busca respostas de uma anotação específica (servidor + local)
   */
  public async fetchRepliesByNote(noteId: string): Promise<NoteReply[]> {
    let serverReplies: NoteReply[] = []
    try {
      const records = await pb.collection('note_replies').getFullList<NoteReply>({
        filter: `note_id = '${noteId}'`,
        sort: 'created',
      })
      serverReplies = records.map((r) => ({ ...r, synced: true }))
    } catch (err) {
      console.warn('Could not fetch server note replies', err)
    }

    const localReplies = this.getPendingQueue().filter((r) => r.note_id === noteId)
    const combined = [...serverReplies, ...localReplies]
    const map = new Map<string, NoteReply>()
    combined.forEach((rep) => map.set(rep.id, rep))

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
    )
  }

  /**
   * Busca respostas para múltiplas anotações de uma vez (para agilizar contadores e indicadores)
   */
  public async fetchRepliesForNotes(noteIds: string[]): Promise<Record<string, NoteReply[]>> {
    if (noteIds.length === 0) return {}

    const result: Record<string, NoteReply[]> = {}
    noteIds.forEach((id) => (result[id] = []))

    try {
      const filterExpr = noteIds.map((id) => `note_id = '${id}'`).join(' || ')
      const records = await pb.collection('note_replies').getFullList<NoteReply>({
        filter: filterExpr,
        sort: 'created',
      })
      records.forEach((r) => {
        if (!result[r.note_id]) result[r.note_id] = []
        result[r.note_id].push({ ...r, synced: true })
      })
    } catch (err) {
      console.warn('Could not batch fetch replies for notes', err)
    }

    // Merge offline pending
    const localQueue = this.getPendingQueue().filter((r) => noteIds.includes(r.note_id))
    localQueue.forEach((r) => {
      if (!result[r.note_id]) result[r.note_id] = []
      result[r.note_id].push(r)
    })

    // Sort each group
    Object.keys(result).forEach((k) => {
      const map = new Map<string, NoteReply>()
      result[k].forEach((rep) => map.set(rep.id, rep))
      result[k] = Array.from(map.values()).sort(
        (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
      )
    })

    return result
  }
}

export const noteRepliesService = new NoteRepliesService()
