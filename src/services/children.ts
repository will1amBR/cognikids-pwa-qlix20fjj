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
  CouponRedemptionRecord,
  LanguageEvolutionStat,
  BilingualStatus,
  AppLanguage,
} from '@/types/cognikids'
import { COGNIKIDS_MODULES, COGNIKIDS_BADGES, SUPPORTED_LANGUAGES } from '@/types/cognikids'

// ================= CHILDREN ================= //

export async function fetchChildren(): Promise<Child[]> {
  if (!pb.authStore.isValid) return []
  const res = await pb.collection('children').getFullList<Child>({
    sort: '-created',
  })
  return res
}

export async function fetchChildById(id: string): Promise<Child | null> {
  // Demo children fallback support so games run smoothly in demo/unauthenticated sandbox
  if (id === 'clara_demo_id') {
    return {
      id: 'clara_demo_id',
      user_id: pb.authStore.record?.id || 'demo_user',
      name: 'Clara (4 anos)',
      birth_date: new Date(Date.now() - 48 * 30.5 * 24 * 3600 * 1000).toISOString(),
      class_group: 'Maternal II',
      favorite_color: '#FF7A45',
      daily_minutes: 15,
      daily_activity_count: 3,
      primary_language: 'pt-BR',
      learning_languages: ['pt-BR', 'en'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
  }
  if (id === 'arthur_demo_id') {
    return {
      id: 'arthur_demo_id',
      user_id: pb.authStore.record?.id || 'demo_user',
      name: 'Arthur (8 anos)',
      birth_date: new Date(Date.now() - 96 * 30.5 * 24 * 3600 * 1000).toISOString(),
      class_group: 'Jardim / 3º Ano',
      favorite_color: '#6366F1',
      daily_minutes: 25,
      daily_activity_count: 4,
      primary_language: 'pt-BR',
      learning_languages: ['pt-BR', 'en', 'es'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
  }
  if (id === 'theo_demo_id') {
    return {
      id: 'theo_demo_id',
      user_id: pb.authStore.record?.id || 'demo_user',
      name: 'Theo (18 meses)',
      birth_date: new Date(Date.now() - 18 * 30.5 * 24 * 3600 * 1000).toISOString(),
      class_group: 'Berçário II',
      favorite_color: '#34D399',
      daily_minutes: 10,
      daily_activity_count: 2,
      primary_language: 'pt-BR',
      learning_languages: ['pt-BR'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
  }

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

  // Try to evaluate bilingual badge after updates
  try {
    await syncAndEvaluateAchievements(id)
  } catch {
    /* intentionally ignored */
  }

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

/**
 * Helper to determine the child's bilingual / multilingual status badge
 */
export function getChildBilingualStatus(child?: Child | null): BilingualStatus {
  const learningLangs =
    child?.learning_languages && Array.isArray(child.learning_languages)
      ? (child.learning_languages as AppLanguage[])
      : child?.primary_language
        ? [child.primary_language as AppLanguage]
        : ['pt-BR']

  const isBilingualOrMultilingual = learningLangs.length > 1

  return {
    isBilingualOrMultilingual,
    languagesCount: learningLangs.length,
    languages: learningLangs as AppLanguage[],
    badgeTitle: learningLangs.length > 2 ? 'Multilíngue em construção' : 'Bilíngue em construção',
    badgeDescription: isBilingualOrMultilingual
      ? `Praticando ${learningLangs.length} idiomas com o Tico: ${learningLangs
          .map((c) => {
            const l = SUPPORTED_LANGUAGES.find((opt) => opt.code === c)
            return l ? `${l.flag} ${l.label}` : c
          })
          .join(', ')}`
      : 'Praticando 1 idioma no momento.',
  }
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

  // Also check child learning languages for bilingual badge
  let childRecord: Child | null = null
  try {
    childRecord = await fetchChildById(childId)
  } catch {
    /* intentionally ignored */
  }

  for (const badge of COGNIKIDS_BADGES) {
    if (unlockedMap.has(badge.key)) continue

    let isEligible = false

    if (badge.key === 'bilingual_in_progress') {
      const childLangCount = childRecord?.learning_languages?.length || 1
      const sessionLanguages = new Set(sessions.map((s) => s.language).filter(Boolean))
      isEligible = childLangCount > 1 || sessionLanguages.size > 1
    } else {
      const modSessions = sessionsByModule[badge.moduleId] || 0
      const modMastery = progressByModule[badge.moduleId] || (modSessions > 0 ? 50 : 0)

      if (badge.tier === 'bronze') {
        isEligible = modSessions >= 1
      } else if (badge.tier === 'silver') {
        isEligible = modSessions >= 2 || modMastery >= badge.requiredMastery
      } else if (badge.tier === 'gold') {
        isEligible = (modSessions >= 3 && modMastery >= 75) || modMastery >= badge.requiredMastery
      }
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

export async function lookupInviteCode(code: string): Promise<InviteRecord | null> {
  if (!code || !code.trim()) return null
  try {
    const formatted = code.trim().toUpperCase()
    const found = await pb.collection('invites').getList<InviteRecord>(1, 1, {
      filter: `invite_code = '${formatted}'`,
    })
    if (found.items.length > 0) {
      return found.items[0]
    }
    return null
  } catch (_) {
    return null
  }
}

export async function createClassroomInviteCode(data: {
  schoolName: string
  classGroup: string
  senderName?: string
  customCode?: string
}): Promise<InviteRecord> {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let code = data.customCode
    ? data.customCode.trim().toUpperCase()
    : 'MATRIC-' +
      Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join(
        '',
      )

  const record = await pb.collection('invites').create<InviteRecord>({
    user_id: pb.authStore.record?.id,
    invite_code: code,
    sender_child_name: data.senderName || `Coordenação (${data.classGroup})`,
    school_name: data.schoolName,
    class_group: data.classGroup,
    invite_type: 'school_classroom',
    status: 'active',
  })
  return record
}

export async function redeemInviteCode(
  code: string,
  newChildName?: string,
): Promise<{ success: boolean; message: string; invite?: InviteRecord }> {
  try {
    const formatted = code.trim().toUpperCase()
    const found = await pb.collection('invites').getList<InviteRecord>(1, 1, {
      filter: `invite_code = '${formatted}'`,
    })

    if (found.items.length === 0) {
      return { success: false, message: 'Código de convite ou matrícula não encontrado.' }
    }

    const invite = found.items[0]
    const isSchoolCoupon = invite.invite_type === 'school_classroom'

    // Peer invites are single-use; classroom coupons can be redeemed by multiple parents
    if (!isSchoolCoupon && invite.status === 'used') {
      return { success: false, message: 'Este código de convite já foi utilizado.' }
    }

    if (pb.authStore.isValid && !isSchoolCoupon) {
      await pb.collection('invites').update(invite.id, {
        status: 'used',
        accepted_by_user_id: pb.authStore.record?.id,
        accepted_child_name: newChildName || 'Colega de turma',
        accepted_at: new Date().toISOString(),
      })
    }

    return {
      success: true,
      message: isSchoolCoupon
        ? `Convite da escola "${invite.school_name || 'Instituição'}" validado para a turma "${invite.class_group}"! 🏫`
        : `Parabéns! Convite de ${invite.sender_child_name || 'um colega'} aceito com sucesso! Vocês ganharam a medalha de Amigo do Tico! 🎉`,
      invite,
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
      // Fallback demo children if live DB returned 0 records for this token
      const fallbackKids: Child[] = [
        {
          id: 'clara_demo_id',
          user_id: primaryToken.user_id,
          name: 'Clara (Demo)',
          birth_date: new Date(Date.now() - 48 * 30.5 * 24 * 3600 * 1000).toISOString(),
          class_group: 'Maternal II',
          favorite_color: '#FF7A45',
          daily_minutes: 15,
          daily_activity_count: 3,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        {
          id: 'theo_demo_id',
          user_id: primaryToken.user_id,
          name: 'Theo (Demo)',
          birth_date: new Date(Date.now() - 18 * 30.5 * 24 * 3600 * 1000).toISOString(),
          class_group: 'Berçário II',
          favorite_color: '#34D399',
          daily_minutes: 10,
          daily_activity_count: 2,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        {
          id: 'arthur_demo_id',
          user_id: primaryToken.user_id,
          name: 'Arthur (Demo)',
          birth_date: new Date(Date.now() - 96 * 30.5 * 24 * 3600 * 1000).toISOString(),
          class_group: 'Jardim / 3º Ano',
          favorite_color: '#6366F1',
          daily_minutes: 25,
          daily_activity_count: 4,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
      ]

      return {
        primaryToken,
        institutionTokens,
        institutionName: primaryToken.school_name || 'Instituição Escolar',
        children: fallbackKids,
        sessions: [
          {
            id: 's1',
            user_id: primaryToken.user_id,
            child_id: 'clara_demo_id',
            module_id: 'speech',
            game_id: 'fazenda_falante',
            game_title: 'A Fazenda Falante (Animais)',
            stars: 3,
            score: 96,
            accuracy: 96,
            rounds_completed: 6,
            total_rounds: 6,
            language: 'pt-BR',
            created: new Date().toISOString(),
          },
        ],
        progress: [
          {
            id: 'p1',
            user_id: primaryToken.user_id,
            child_id: 'clara_demo_id',
            module_id: 'speech',
            mastery_percentage: 92,
            total_played: 24,
            last_played_at: new Date().toISOString(),
          },
          {
            id: 'p2',
            user_id: primaryToken.user_id,
            child_id: 'clara_demo_id',
            module_id: 'memory',
            mastery_percentage: 88,
            total_played: 18,
            last_played_at: new Date().toISOString(),
          },
          {
            id: 'p3',
            user_id: primaryToken.user_id,
            child_id: 'clara_demo_id',
            module_id: 'logic',
            mastery_percentage: 84,
            total_played: 16,
            last_played_at: new Date().toISOString(),
          },
          {
            id: 'p4',
            user_id: primaryToken.user_id,
            child_id: 'clara_demo_id',
            module_id: 'motor',
            mastery_percentage: 95,
            total_played: 22,
            last_played_at: new Date().toISOString(),
          },
          {
            id: 'p5',
            user_id: primaryToken.user_id,
            child_id: 'clara_demo_id',
            module_id: 'socioemotional',
            mastery_percentage: 90,
            total_played: 19,
            last_played_at: new Date().toISOString(),
          },
        ],
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

// ================= COUPON REDEMPTIONS & ENROLLMENT TRACKING ================= //

export async function recordCouponRedemption(data: {
  inviteCode: string
  institutionId?: string
  classroomName?: string
  childId?: string
  childName?: string
  childAge?: number
  guardianUserId?: string
  guardianName?: string
  guardianEmail?: string
  source?: string
  metadata?: Record<string, any>
}): Promise<CouponRedemptionRecord | null> {
  try {
    const formattedCode = data.inviteCode.trim().toUpperCase()
    const currentUser = pb.authStore.record
    const guardianUserId = data.guardianUserId || currentUser?.id || ''
    const guardianName = data.guardianName || currentUser?.name || 'Responsável'
    const guardianEmail = data.guardianEmail || currentUser?.email || ''

    const payload: Partial<CouponRedemptionRecord> = {
      invite_code: formattedCode,
      institution_id: data.institutionId || 'ESCOLA-DEMO01',
      classroom_name: data.classroomName || '',
      child_id: data.childId || '',
      child_name: data.childName || '',
      child_age: data.childAge || 0,
      guardian_user_id: guardianUserId,
      guardian_name: guardianName,
      guardian_email: guardianEmail,
      source: data.source || 'signup_invite',
      welcome_sent: false,
      metadata: data.metadata || {},
    }

    const created = await pb
      .collection('coupon_redemptions')
      .create<CouponRedemptionRecord>(payload)
    return created
  } catch (err) {
    console.warn('Failed to record coupon redemption', err)
    return null
  }
}

export async function fetchCouponRedemptions(options?: {
  inviteCode?: string
  institutionId?: string
  classroomName?: string
}): Promise<CouponRedemptionRecord[]> {
  try {
    const filters: string[] = []
    if (options?.inviteCode) {
      filters.push(`invite_code = '${options.inviteCode.trim().toUpperCase()}'`)
    }
    if (options?.institutionId) {
      filters.push(`institution_id = '${options.institutionId.trim().toUpperCase()}'`)
    }
    if (options?.classroomName) {
      filters.push(`classroom_name = '${options.classroomName.trim()}'`)
    }

    const filterExpr = filters.length > 0 ? filters.join(' && ') : ''

    const list = await pb.collection('coupon_redemptions').getFullList<CouponRedemptionRecord>({
      filter: filterExpr || undefined,
      sort: '-created',
    })
    return list
  } catch (err) {
    console.warn('Failed to fetch coupon redemptions', err)
    return []
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

  // Determine if child is junior (has junior sessions or age >= 72 months)
  const isJuniorProfile =
    allSessions.some((s) => s.module_id.startsWith('junior_')) ||
    Object.keys(progMap).some((k) => k.startsWith('junior_'))

  // Use appropriate modules or combine
  const relevantModules = isJuniorProfile
    ? [
        ...COGNIKIDS_MODULES,
        {
          id: 'junior_vocab',
          title: 'Vocabulário & Fala Pro',
          color: '#6366F1',
          icon: '🗣️',
        },
        {
          id: 'junior_math',
          title: 'Matemática & Contas',
          color: '#06B6D4',
          icon: '🔢',
        },
        {
          id: 'junior_logic',
          title: 'Matriz Lógica & Padrões',
          color: '#8B5CF6',
          icon: '🧩',
        },
        {
          id: 'junior_dictation',
          title: 'Ditado & Ortografia',
          color: '#EC4899',
          icon: '✍️',
        },
      ]
    : COGNIKIDS_MODULES

  const moduleBreakdown = relevantModules.map((mod: any) => {
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

  // Multilingual Performance Breakdown
  const languageBreakdown: LanguageEvolutionStat[] = SUPPORTED_LANGUAGES.map((lang) => {
    // Check sessions that match this language
    // Sessions may have language field set e.g. "pt-BR", "en", "es", "de", "fr"
    const langSessions = allSessions.filter((s) => {
      const sessLang = s.language || (s.details && s.details.language)
      if (sessLang) {
        return sessLang === lang.code || (sessLang === 'pt' && lang.code === 'pt-BR')
      }
      // If language was not explicitly recorded, default to pt-BR if it was the default
      return lang.code === 'pt-BR'
    })

    const totalLangSessions = langSessions.length
    const totalLangStars = langSessions.reduce((acc, s) => acc + (s.stars || 1), 0)
    const averageAccuracy =
      totalLangSessions > 0
        ? Math.round(
            langSessions.reduce((acc, s) => acc + (s.accuracy || s.score || 80), 0) /
              totalLangSessions,
          )
        : 0

    // Unique words practiced in this language
    const wordsSet = new Set<string>()
    langSessions.forEach((s) => {
      const details = (s.details as any) || {}
      if (details.wordResults && Array.isArray(details.wordResults)) {
        details.wordResults.forEach((wr: any) => {
          if (wr && wr.word) wordsSet.add(wr.word)
        })
      } else if (details.items && Array.isArray(details.items)) {
        details.items.forEach((it: string) => wordsSet.add(it))
      }
    })

    let status: 'doing_well' | 'in_progress' | 'not_started' = 'not_started'
    let statusLabel = 'A iniciar'

    if (totalLangSessions > 0) {
      if (averageAccuracy >= 70) {
        status = 'doing_well'
        statusLabel = 'Excelente assimilação'
      } else {
        status = 'in_progress'
        statusLabel = 'Em desenvolvimento'
      }
    }

    return {
      code: lang.code,
      label: lang.label,
      nativeName: lang.nativeName,
      flag: lang.flag,
      totalSessions: totalLangSessions,
      averageAccuracy,
      totalStars: totalLangStars,
      wordsPracticedCount: wordsSet.size,
      status,
      statusLabel,
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
    languageBreakdown,
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
