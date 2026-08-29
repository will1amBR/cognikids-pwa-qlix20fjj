import pb from '@/lib/pocketbase/client'
import type {
  Child,
  GameSession,
  ModuleProgress,
  EvolutionSummary,
  ChildAchievement,
  BadgeDefinition,
  InviteRecord,
  SchoolAccessToken,
} from '@/types/cognikids'
import { COGNIKIDS_MODULES, COGNIKIDS_BADGES } from '@/types/cognikids'

// ================= CHILDREN ================= //

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
  class_group?: string
  avatarFile?: File | null
  daily_minutes?: number
  daily_activity_count?: number
  learning_languages?: string[]
  primary_language?: string
}): Promise<Child> {
  const formData = new FormData()
  formData.append('user_id', pb.authStore.record?.id || '')
  formData.append('name', data.name)
  formData.append('birth_date', data.birth_date)
  if (data.favorite_color) formData.append('favorite_color', data.favorite_color)
  if (data.class_group) formData.append('class_group', data.class_group)
  if (data.daily_minutes) formData.append('daily_minutes', String(data.daily_minutes))
  if (data.daily_activity_count)
    formData.append('daily_activity_count', String(data.daily_activity_count))
  if (data.learning_languages)
    formData.append('learning_languages', JSON.stringify(data.learning_languages))
  if (data.primary_language) formData.append('primary_language', data.primary_language)
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
    class_group?: string
    avatarFile?: File | null
    clearAvatar?: boolean
    daily_minutes?: number
    daily_activity_count?: number
    learning_languages?: string[]
    primary_language?: string
  },
): Promise<Child> {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('birth_date', data.birth_date)
  if (data.favorite_color) formData.append('favorite_color', data.favorite_color)
  if (data.class_group !== undefined) formData.append('class_group', data.class_group)
  if (data.daily_minutes !== undefined) formData.append('daily_minutes', String(data.daily_minutes))
  if (data.daily_activity_count !== undefined)
    formData.append('daily_activity_count', String(data.daily_activity_count))
  if (data.learning_languages !== undefined)
    formData.append('learning_languages', JSON.stringify(data.learning_languages))
  if (data.primary_language !== undefined)
    formData.append('primary_language', data.primary_language)
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

export function getChildAvatarUrl(child: Child): string | null {
  if (!child.avatar) return null
  return pb.files.getURL(child as any, child.avatar)
}

// ================= SESSIONS & PROGRESS ================= //

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

// ================= ACHIEVEMENTS / MEDALS ================= //

export async function fetchChildAchievements(childId: string): Promise<ChildAchievement[]> {
  if (!pb.authStore.isValid) return []
  try {
    const res = await pb.collection('child_achievements').getFullList<ChildAchievement>({
      filter: `child_id = '${childId}'`,
      sort: '-unlocked_at',
    })
    return res
  } catch (_) {
    return []
  }
}

/**
 * Checks and unlocks eligible medals for a child based on current sessions and mastery.
 * Can be called after any game session or when viewing the dashboard.
 */
export async function syncAndEvaluateAchievements(childId: string): Promise<ChildAchievement[]> {
  if (!pb.authStore.isValid || !pb.authStore.record?.id) return []
  const userId = pb.authStore.record.id

  const [existingAchievements, sessions, progressList] = await Promise.all([
    fetchChildAchievements(childId),
    fetchChildSessions(childId, 100),
    fetchChildModuleProgress(childId),
  ])

  const unlockedMap = new Set(existingAchievements.map((a) => a.badge_key))
  const progressByModule: Record<string, number> = {}
  progressList.forEach((p) => {
    progressByModule[p.module_id] = p.mastery_percentage
  })

  const sessionsByModule: Record<string, number> = {}
  sessions.forEach((s) => {
    sessionsByModule[s.module_id] = (sessionsByModule[s.module_id] || 0) + 1
  })

  const newUnlocks: ChildAchievement[] = []

  for (const badge of COGNIKIDS_BADGES) {
    if (unlockedMap.has(badge.key)) continue

    const modSessions = sessionsByModule[badge.moduleId] || 0
    const modMastery = progressByModule[badge.moduleId] || (modSessions > 0 ? 50 : 0)

    let isEligible = false
    if (badge.tier === 'bronze') {
      isEligible = modSessions >= 1
    } else if (badge.tier === 'silver') {
      isEligible = modSessions >= 2 || modMastery >= badge.requiredMastery
    } else if (badge.tier === 'gold') {
      isEligible = (modSessions >= 3 && modMastery >= 75) || modMastery >= badge.requiredMastery
    }

    if (isEligible) {
      try {
        const created = await pb.collection('child_achievements').create<ChildAchievement>({
          user_id: userId,
          child_id: childId,
          module_id: badge.moduleId,
          badge_key: badge.key,
          title: badge.title,
          description: badge.description,
          icon: badge.icon,
          tier: badge.tier,
          unlocked_at: new Date().toISOString(),
        })
        newUnlocks.push(created)
      } catch (err) {
        // May already exist due to race condition
        console.warn('Achievement create skipped', err)
      }
    }
  }

  return [...existingAchievements, ...newUnlocks]
}

// ================= INVITES & REFERRALS ================= //

export async function fetchUserInvites(): Promise<InviteRecord[]> {
  if (!pb.authStore.isValid) return []
  try {
    const res = await pb.collection('invites').getFullList<InviteRecord>({
      filter: `user_id = '${pb.authStore.record?.id}'`,
      sort: '-created',
    })
    return res
  } catch (_) {
    return []
  }
}

export async function createInviteCode(
  childId?: string,
  childName?: string,
): Promise<InviteRecord> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let randomCode = 'TICO-'
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  const record = await pb.collection('invites').create<InviteRecord>({
    user_id: pb.authStore.record?.id,
    child_id: childId || null,
    invite_code: randomCode,
    sender_child_name: childName || 'Amigo do Tico',
    status: 'active',
  })
  return record
}

export async function redeemInviteCode(
  code: string,
  newChildName?: string,
): Promise<{ success: boolean; message: string }> {
  if (!pb.authStore.isValid)
    return { success: false, message: 'Faça login para resgatar o convite.' }
  try {
    const formatted = code.trim().toUpperCase()
    const found = await pb.collection('invites').getList<InviteRecord>(1, 1, {
      filter: `invite_code = '${formatted}'`,
    })

    if (found.items.length === 0) {
      return { success: false, message: 'Código de convite não encontrado.' }
    }

    const invite = found.items[0]
    if (invite.status === 'used') {
      return { success: false, message: 'Este código de convite já foi utilizado.' }
    }

    // Update invite as used
    await pb.collection('invites').update(invite.id, {
      status: 'used',
      accepted_by_user_id: pb.authStore.record?.id,
      accepted_child_name: newChildName || 'Colega de turma',
      accepted_at: new Date().toISOString(),
    })

    return {
      success: true,
      message: `Parabéns! Convite de ${invite.sender_child_name || 'um colega'} aceito com sucesso! Vocês ganharam a medalha de Amigo do Tico! 🎉`,
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro ao resgatar convite.' }
  }
}

// ================= SCHOOL ACCESS TOKENS ================= //

export async function fetchSchoolAccessTokens(childId?: string): Promise<SchoolAccessToken[]> {
  if (!pb.authStore.isValid) return []
  try {
    const filter = childId
      ? `user_id = '${pb.authStore.record?.id}' && child_id = '${childId}'`
      : `user_id = '${pb.authStore.record?.id}'`
    const res = await pb.collection('school_access_tokens').getFullList<SchoolAccessToken>({
      filter,
      sort: '-created',
    })
    return res
  } catch (_) {
    return []
  }
}

export async function createSchoolAccessToken(data: {
  childId?: string
  schoolName: string
  teacherName?: string
  classGroup?: string
  note?: string
}): Promise<SchoolAccessToken> {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let code = 'ESCOLA-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  const record = await pb.collection('school_access_tokens').create<SchoolAccessToken>({
    user_id: pb.authStore.record?.id,
    child_id: data.childId || null,
    access_code: code,
    school_name: data.schoolName,
    teacher_name: data.teacherName || '',
    class_group: data.classGroup || '',
    note: data.note || '',
    is_active: true,
  })
  return record
}

export async function toggleSchoolAccessToken(
  tokenId: string,
  isActive: boolean,
): Promise<SchoolAccessToken> {
  const record = await pb.collection('school_access_tokens').update<SchoolAccessToken>(tokenId, {
    is_active: isActive,
  })
  return record
}

export async function deleteSchoolAccessToken(tokenId: string): Promise<boolean> {
  await pb.collection('school_access_tokens').delete(tokenId)
  return true
}

export interface SchoolPortalResult {
  primaryToken: SchoolAccessToken
  institutionTokens: SchoolAccessToken[]
  institutionName: string
  children: Child[]
  sessions: GameSession[]
  progress: ModuleProgress[]
}

/**
 * Public lookup for school portal by access code without guardian login.
 * If multiple school tokens belong to the same school name or guardian institution,
 * all associated tokens and children are retrieved to allow filtering by class group (turma) and access code.
 */
export async function getSchoolPortalData(accessCode: string): Promise<SchoolPortalResult | null> {
  try {
    const cleanCode = accessCode.trim().toUpperCase()
    const tokens = await pb.collection('school_access_tokens').getList<SchoolAccessToken>(1, 1, {
      filter: `access_code = '${cleanCode}' && is_active = true`,
    })

    if (tokens.items.length === 0) return null
    const primaryToken = tokens.items[0]

    // Find all active tokens linked to the same school institution (by school_name or user_id)
    let institutionTokens: SchoolAccessToken[] = [primaryToken]
    try {
      const schoolNameFilter = primaryToken.school_name
        ? `school_name = '${primaryToken.school_name.replace(/'/g, "\\'")}' && is_active = true`
        : `user_id = '${primaryToken.user_id}' && is_active = true`

      const relatedTokens = await pb
        .collection('school_access_tokens')
        .getFullList<SchoolAccessToken>({
          filter: schoolNameFilter,
          sort: '-created',
        })
      if (relatedTokens.length > 0) {
        institutionTokens = relatedTokens
      }
    } catch (_) {
      institutionTokens = [primaryToken]
    }

    // Collect all relevant child IDs across these institution tokens
    const targetChildIds = new Set<string>()
    let includeAllUserKids = false

    institutionTokens.forEach((tok) => {
      if (tok.child_id) {
        targetChildIds.add(tok.child_id)
      } else {
        includeAllUserKids = true
      }
    })

    let childrenList: Child[] = []
    if (includeAllUserKids || targetChildIds.size === 0) {
      const userIds = Array.from(new Set(institutionTokens.map((t) => t.user_id)))
      const userFilter = userIds.map((uid) => `user_id = '${uid}'`).join(' || ')
      try {
        childrenList = await pb.collection('children').getFullList<Child>({
          filter: userFilter,
          sort: 'name',
        })
      } catch (_) {
        childrenList = []
      }
    } else {
      const idsArray = Array.from(targetChildIds)
      const childFilter = idsArray.map((id) => `id = '${id}'`).join(' || ')
      try {
        childrenList = await pb.collection('children').getFullList<Child>({
          filter: childFilter,
          sort: 'name',
        })
      } catch (_) {
        childrenList = []
      }
    }

    const allChildIds = childrenList.map((c) => c.id)
    if (allChildIds.length === 0) {
      return {
        primaryToken,
        institutionTokens,
        institutionName: primaryToken.school_name || 'Instituição Escolar',
        children: [],
        sessions: [],
        progress: [],
      }
    }

    const filterExpr = allChildIds.map((id) => `child_id = '${id}'`).join(' || ')

    const [sessionsRes, progressRes] = await Promise.all([
      pb.collection('game_sessions').getFullList<GameSession>({
        filter: filterExpr,
        sort: '-created',
      }),
      pb.collection('module_progress').getFullList<ModuleProgress>({
        filter: filterExpr,
      }),
    ])

    return {
      primaryToken,
      institutionTokens,
      institutionName: primaryToken.school_name || 'Instituição Escolar',
      children: childrenList,
      sessions: sessionsRes,
      progress: progressRes,
    }
  } catch (err) {
    console.warn('Failed to load school portal data', err)
    return null
  }
}

// ================= EVOLUTION REPORTS ================= //

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

export async function fetchChildReportForPdf(childId: string, period: 'week' | 'month' = 'month') {
  const [kid, summary, achievements] = await Promise.all([
    fetchChildById(childId),
    calculateChildEvolution(childId, period),
    fetchChildAchievements(childId),
  ])
  return { kid, summary, achievements }
}
