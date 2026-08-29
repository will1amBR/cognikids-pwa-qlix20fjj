import pb from '@/lib/pocketbase/client'
import type { Child, GameSession, ModuleProgress, EvolutionSummary } from '@/types/cognikids'
import { COGNIKIDS_MODULES } from '@/types/cognikids'

export async function fetchChildren(): Promise<Child[]> {
  if (!pb.authStore.isValid) return []
  const res = await pb.collection('children').getFullList<Child>({
    sort: '-created',
  })
  return res
}

export async function fetchChildById(id: string): Promise<Child | null> {
  if (!pb.authStore.isValid) return null
  try {
    const res = await pb.collection('children').getOne<Child>(id)
    return res
  } catch (_) {
    return null
  }
}

export async function createChild(data: {
  name: string
  birth_date: string
  favorite_color?: string
  avatarFile?: File | null
}): Promise<Child> {
  const formData = new FormData()
  formData.append('user_id', pb.authStore.record?.id || '')
  formData.append('name', data.name)
  formData.append('birth_date', data.birth_date)
  if (data.favorite_color) formData.append('favorite_color', data.favorite_color)
  if (data.avatarFile) formData.append('avatar', data.avatarFile)

  const res = await pb.collection('children').create<Child>(formData)
  return res
}

export async function updateChild(
  id: string,
  data: {
    name: string
    birth_date: string
    favorite_color?: string
    avatarFile?: File | null
    clearAvatar?: boolean
  },
): Promise<Child> {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('birth_date', data.birth_date)
  if (data.favorite_color) formData.append('favorite_color', data.favorite_color)
  if (data.avatarFile) {
    formData.append('avatar', data.avatarFile)
  } else if (data.clearAvatar) {
    formData.append('avatar', '')
  }

  const res = await pb.collection('children').update<Child>(id, formData)
  return res
}

export async function deleteChild(id: string): Promise<boolean> {
  await pb.collection('children').delete(id)
  return true
}

export async function fetchRecentSessions(limit: number = 5): Promise<GameSession[]> {
  if (!pb.authStore.isValid) return []
  try {
    const res = await pb.collection('game_sessions').getList<GameSession>(1, limit, {
      sort: '-created',
      expand: 'child_id',
    })
    return res.items
  } catch (_) {
    return []
  }
}

export async function fetchChildSessions(
  childId: string,
  limit: number = 50,
): Promise<GameSession[]> {
  if (!pb.authStore.isValid) return []
  try {
    const res = await pb.collection('game_sessions').getList<GameSession>(1, limit, {
      filter: `child_id = '${childId}'`,
      sort: '-created',
    })
    return res.items
  } catch (_) {
    return []
  }
}

export async function fetchChildModuleProgress(childId: string): Promise<ModuleProgress[]> {
  if (!pb.authStore.isValid) return []
  try {
    const res = await pb.collection('module_progress').getFullList<ModuleProgress>({
      filter: `child_id = '${childId}'`,
    })
    return res
  } catch (_) {
    return []
  }
}

export function getChildAvatarUrl(child: Child): string | null {
  if (!child.avatar) return null
  return pb.files.getURL(child as any, child.avatar)
}

/**
 * Computes period evolution summary comparing current window vs previous window.
 * Week = last 7 days vs previous 7 days
 * Month = last 30 days vs previous 30 days
 */
export async function calculateChildEvolution(
  childId: string,
  period: 'week' | 'month' = 'week',
): Promise<EvolutionSummary> {
  const allSessions = await fetchChildSessions(childId, 100)
  const currentProgress = await fetchChildModuleProgress(childId)

  const days = period === 'week' ? 7 : 30
  const now = new Date()
  const currentWindowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const previousWindowStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000)

  const currentWindowSessions = allSessions.filter((s) => {
    const d = new Date(s.created)
    return d >= currentWindowStart && d <= now
  })

  const previousWindowSessions = allSessions.filter((s) => {
    const d = new Date(s.created)
    return d >= previousWindowStart && d < currentWindowStart
  })

  const totalSessions = currentWindowSessions.length
  const previousTotalSessions = previousWindowSessions.length

  const totalStars = currentWindowSessions.reduce((acc, s) => acc + (s.stars || 1), 0)

  const averageAccuracy =
    totalSessions > 0
      ? Math.round(
          currentWindowSessions.reduce((acc, s) => acc + (s.accuracy || s.score || 80), 0) /
            totalSessions,
        )
      : 0

  const previousAverageAccuracy =
    previousTotalSessions > 0
      ? Math.round(
          previousWindowSessions.reduce((acc, s) => acc + (s.accuracy || s.score || 80), 0) /
            previousTotalSessions,
        )
      : 0

  const accuracyChange = averageAccuracy - previousAverageAccuracy
  const sessionsChange = totalSessions - previousTotalSessions

  const progMap: Record<string, number> = {}
  currentProgress.forEach((p) => {
    progMap[p.module_id] = p.mastery_percentage
  })

  const moduleBreakdown = COGNIKIDS_MODULES.map((mod) => {
    const modSessionsCurrent = currentWindowSessions.filter((s) => s.module_id === mod.id)
    const modSessionsPrev = previousWindowSessions.filter((s) => s.module_id === mod.id)

    const currentMastery = progMap[mod.id] ?? (modSessionsCurrent.length > 0 ? 80 : 45)

    // Calculate previous mastery approximation
    let prevMastery = currentMastery
    if (modSessionsPrev.length > 0) {
      const avgPrev = Math.round(
        modSessionsPrev.reduce((a, b) => a + (b.accuracy || 75), 0) / modSessionsPrev.length,
      )
      prevMastery = Math.round(avgPrev * 0.9)
    } else if (modSessionsCurrent.length > 0) {
      prevMastery = Math.max(20, currentMastery - 12)
    }

    const delta = currentMastery - prevMastery
    const trend: 'up' | 'stable' | 'down' = delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable'

    return {
      moduleId: mod.id,
      title: mod.title,
      color: mod.color,
      icon: mod.icon,
      currentMastery,
      previousMastery: prevMastery,
      delta,
      trend,
      sessionsCount: modSessionsCurrent.length,
    }
  })

  return {
    period,
    totalSessions,
    totalStars,
    averageAccuracy,
    previousTotalSessions,
    previousAverageAccuracy,
    accuracyChange,
    sessionsChange,
    moduleBreakdown,
  }
}
