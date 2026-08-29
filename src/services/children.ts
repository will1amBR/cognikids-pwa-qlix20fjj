import pb from '@/lib/pocketbase/client'
import type { Child, GameSession, ModuleProgress } from '@/types/cognikids'

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
