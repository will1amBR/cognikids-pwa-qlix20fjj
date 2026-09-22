/**
 * Offline sync queue for CogniKids game sessions and module progress.
 * Saves locally via localStorage/IndexedDB and syncs to PocketBase when online.
 */

import pb from '@/lib/pocketbase/client'

export interface PendingGameSession {
  id: string
  user_id: string
  child_id: string
  module_id: string
  game_id: string
  game_title: string
  stars: number
  score: number
  accuracy: number
  rounds_completed: number
  total_rounds: number
  language?: string
  details?: Record<string, any>
  created_at: string
}

const QUEUE_KEY = 'cognikids_offline_sync_queue'

export class OfflineSyncService {
  private listeners: Array<
    (status: { isOnline: boolean; isSyncing: boolean; queueLength: number }) => void
  > = []
  private isSyncing = false

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange())
      window.addEventListener('offline', () => this.handleConnectionChange())
    }
  }

  public subscribe(
    listener: (status: { isOnline: boolean; isSyncing: boolean; queueLength: number }) => void,
  ) {
    this.listeners.push(listener)
    listener(this.getStatus())
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  public getStatus() {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    const queue = this.getQueue()
    return {
      isOnline,
      isSyncing: this.isSyncing,
      queueLength: queue.length,
    }
  }

  private notify() {
    const status = this.getStatus()
    this.listeners.forEach((l) => l(status))
  }

  public getQueue(): PendingGameSession[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(QUEUE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (_) {
      return []
    }
  }

  private saveQueue(queue: PendingGameSession[]) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    } catch {
      /* intentionally ignored */
    }
    this.notify()
  }

  public getPendingQueue(): PendingGameSession[] {
    return this.getQueue()
  }

  public getPendingSessions(): PendingGameSession[] {
    return this.getQueue()
  }

  public async saveGameSession(session: any): Promise<void> {
    const user_id = pb.authStore.record?.id || session.user_id || 'anonymous'
    return this.queueGameSession({
      user_id,
      child_id: session.child_id,
      module_id: session.module_id,
      game_id: session.game_id,
      game_title: session.game_title,
      stars: session.stars || 1,
      score: session.score || 80,
      accuracy: session.accuracy || 80,
      rounds_completed: session.rounds_completed || 1,
      total_rounds: session.total_rounds || 1,
      language: session.language || 'pt-BR',
      details: session.details || {},
    })
  }

  public async saveSession(session: any): Promise<void> {
    return this.saveGameSession(session)
  }

  public async enqueueSession(session: any): Promise<void> {
    return this.saveGameSession(session)
  }

  public async queueGameSession(
    session: Omit<PendingGameSession, 'id' | 'created_at'>,
  ): Promise<void> {
    const pendingItem: PendingGameSession = {
      ...session,
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    // Resolve static legacy demo IDs if needed
    if (pendingItem.child_id === 'clara_demo_id') {
      pendingItem.child_id = '3daks4amyhs7o3j'
    } else if (pendingItem.child_id === 'arthur_demo_id') {
      pendingItem.child_id = 'h7cix80bm9zncbd'
    } else if (pendingItem.child_id === 'theo_demo_id') {
      pendingItem.child_id = 'nvlgft7tfx69648'
    }

    // Unmapped artificial strings without valid PB id length (15 alphanumeric)
    const isInvalidChildId =
      pendingItem.child_id.includes('demo') || pendingItem.child_id.length !== 15

    // If online and auth is active and child_id is valid, try immediate sync
    if (!isInvalidChildId && isOnline && pb.authStore.isValid && pb.authStore.record?.id) {
      try {
        await Promise.race([
          (async () => {
            await this.syncSessionItem(pendingItem)
            await this.updateModuleProgress(
              pendingItem.child_id,
              pendingItem.module_id,
              pendingItem.score,
            )
            // Also trigger async achievement check in background
            this.evaluateAchievementsSilently(
              pendingItem.child_id,
              pendingItem.module_id,
              pendingItem.user_id,
            )
          })(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network sync timeout')), 4000),
          ),
        ])
        return
      } catch (err) {
        console.warn('Direct game session save failed, adding to offline queue', err)
      }
    }

    // Save to offline queue
    const queue = this.getQueue()
    queue.push(pendingItem)
    this.saveQueue(queue)

    // Also update local cache of child module progress so UI updates immediately
    this.updateLocalCachedProgress(pendingItem.child_id, pendingItem.module_id, pendingItem.score)
  }

  private async syncSessionItem(item: PendingGameSession) {
    await pb.collection('game_sessions').create({
      user_id: item.user_id,
      child_id: item.child_id,
      module_id: item.module_id,
      game_id: item.game_id,
      game_title: item.game_title,
      stars: item.stars,
      score: item.score,
      accuracy: item.accuracy,
      rounds_completed: item.rounds_completed,
      total_rounds: item.total_rounds,
      language: item.language || 'pt-BR',
      details: item.details || {},
    })
  }

  private async evaluateAchievementsSilently(childId: string, moduleId: string, userId: string) {
    if (!pb.authStore.isValid) return
    try {
      const existing = await pb.collection('child_achievements').getFullList({
        filter: `child_id = '${childId}' && module_id = '${moduleId}'`,
      })
      const badgeKey = `${moduleId}_primeiro_jogo`
      if (existing.length === 0) {
        await pb.collection('child_achievements').create({
          user_id: userId,
          child_id: childId,
          module_id: moduleId,
          badge_key: badgeKey,
          title: 'Primeiro Desafio',
          description: 'Completou a primeira atividade nesta área!',
          icon: '⭐',
          tier: 'bronze',
          unlocked_at: new Date().toISOString(),
        })
      }
    } catch (_) {
      // ignore
    }
  }

  public async updateModuleProgress(childId: string, moduleId: string, latestScore: number) {
    if (!pb.authStore.isValid || !pb.authStore.record?.id) return
    const userId = pb.authStore.record.id

    try {
      // Find existing progress
      const existing = await pb.collection('module_progress').getList(1, 1, {
        filter: `child_id = '${childId}' && module_id = '${moduleId}'`,
      })

      if (existing.items.length > 0) {
        const record = existing.items[0]
        const currentMastery = (record as any).mastery_percentage || 0
        const totalPlayed = ((record as any).total_played || 0) + 1
        // Weighted exponential moving average for mastery
        const newMastery = Math.min(100, Math.round(currentMastery * 0.7 + latestScore * 0.3))

        await pb.collection('module_progress').update(record.id, {
          mastery_percentage: newMastery,
          total_played: totalPlayed,
          last_played_at: new Date().toISOString(),
        })
      } else {
        await pb.collection('module_progress').create({
          user_id: userId,
          child_id: childId,
          module_id: moduleId,
          mastery_percentage: Math.min(100, Math.round(latestScore)),
          total_played: 1,
          last_played_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.warn('Failed to update module progress remotely', err)
    }
  }

  private updateLocalCachedProgress(childId: string, moduleId: string, score: number) {
    if (typeof window === 'undefined') return
    try {
      const cacheKey = `cognikids_cache_progress_${childId}`
      const raw = localStorage.getItem(cacheKey)
      const data: Record<string, number> = raw ? JSON.parse(raw) : {}
      const current = data[moduleId] || 50
      data[moduleId] = Math.min(100, Math.round(current * 0.7 + score * 0.3))
      localStorage.setItem(cacheKey, JSON.stringify(data))
    } catch {
      /* intentionally ignored */
    }
  }

  public async syncQueue(): Promise<{ syncedCount: number; errors: number }> {
    if (this.isSyncing || !navigator.onLine || !pb.authStore.isValid) {
      return { syncedCount: 0, errors: 0 }
    }

    const queue = this.getQueue()
    if (queue.length === 0) return { syncedCount: 0, errors: 0 }

    this.isSyncing = true
    this.notify()

    let syncedCount = 0
    let errors = 0
    const remaining: PendingGameSession[] = []

    for (const item of queue) {
      // Resolve legacy demo IDs if any in queue
      if (item.child_id === 'clara_demo_id') {
        item.child_id = '3daks4amyhs7o3j'
      } else if (item.child_id === 'arthur_demo_id') {
        item.child_id = 'h7cix80bm9zncbd'
      } else if (item.child_id === 'theo_demo_id') {
        item.child_id = 'nvlgft7tfx69648'
      }

      if (item.child_id.includes('demo') || item.child_id.length !== 15) {
        // Discard invalid relation IDs to prevent blocking the queue
        syncedCount++
        continue
      }
      try {
        await this.syncSessionItem(item)
        await this.updateModuleProgress(item.child_id, item.module_id, item.score)
        syncedCount++
      } catch (err) {
        console.error('Failed syncing queue item', item, err)
        remaining.push(item)
        errors++
      }
    }

    this.saveQueue(remaining)
    this.isSyncing = false
    this.notify()

    return { syncedCount, errors }
  }

  private handleConnectionChange() {
    this.notify()
    if (navigator.onLine) {
      this.syncQueue()
    }
  }
}

export const offlineSyncService = new OfflineSyncService()
