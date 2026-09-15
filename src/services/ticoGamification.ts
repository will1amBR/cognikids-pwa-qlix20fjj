import pb from '@/lib/pocketbase/client'

export type TicoItemCategory = 'hat' | 'glasses' | 'shoes' | 'accessory' | 'outfit'

export interface TicoStoreItem {
  id: string
  name: string
  category: TicoItemCategory
  price: number // in coins
  description: string
  icon: string
  previewColor: string
  isStarter?: boolean
  rarity?: 'comum' | 'raro' | 'lendário'
}

export interface ChildTicoEquipped {
  hat?: string
  glasses?: string
  shoes?: string
  accessory?: string
  outfit?: string
}

export interface ChildTicoGamificationState {
  childId: string
  coins: number
  totalEarned: number
  equipped: ChildTicoEquipped
  inventory: string[] // item ids owned
}

export const TICO_STORE_ITEMS: TicoStoreItem[] = [
  // Chapéus (Hats)
  {
    id: 'hat_cap_orange',
    name: 'Boné Laranja Estiloso',
    category: 'hat',
    price: 30,
    description: 'Um boné moderno virado para frente com a cor oficial do CogniKids.',
    icon: '🧢',
    previewColor: '#FF7A45',
    isStarter: true,
    rarity: 'comum',
  },
  {
    id: 'hat_crown_gold',
    name: 'Coroa Real de Ouro',
    category: 'hat',
    price: 80,
    description: 'Para o Tico reinar nos estudos com muito brilho e dedicação!',
    icon: '👑',
    previewColor: '#F59E0B',
    rarity: 'lendário',
  },
  {
    id: 'hat_party_cone',
    name: 'Chapéu Festivo de Festa',
    category: 'hat',
    price: 25,
    description: 'Cores vibrantes para comemorar cada nova palavra aprendida!',
    icon: '🎉',
    previewColor: '#EC4899',
    rarity: 'comum',
  },
  {
    id: 'hat_detective',
    name: 'Chapéu de Detetive',
    category: 'hat',
    price: 50,
    description: 'Para investigar mistérios na selva, dinossauros e quebra-cabeças.',
    icon: '🕵️',
    previewColor: '#78350F',
    rarity: 'raro',
  },
  {
    id: 'hat_chef',
    name: 'Chapéu de Mini Chef',
    category: 'hat',
    price: 45,
    description: 'Para quem adora os jogos de frutas, legumes e comidinhas!',
    icon: '👨‍🍳',
    previewColor: '#FFFFFF',
    rarity: 'raro',
  },

  // Óculos (Glasses)
  {
    id: 'glasses_star',
    name: 'Óculos Estrelinha Neon',
    category: 'glasses',
    price: 35,
    description: 'Armação em formato de estrela que brilha a cada vitória.',
    icon: '⭐',
    previewColor: '#F59E0B',
    isStarter: true,
    rarity: 'comum',
  },
  {
    id: 'glasses_sun_cool',
    name: 'Óculos Escuros Radical',
    category: 'glasses',
    price: 50,
    description: 'Protege o Tico do sol tropical enquanto ele canta e se diverte.',
    icon: '🕶️',
    previewColor: '#0F172A',
    rarity: 'raro',
  },
  {
    id: 'glasses_nerd_round',
    name: 'Óculos Redondo Sabichão',
    category: 'glasses',
    price: 40,
    description: 'Estilo clássico para ler muitas histórias e treinar vocabulário.',
    icon: '👓',
    previewColor: '#0284C7',
    rarity: 'comum',
  },
  {
    id: 'glasses_swimming',
    name: 'Óculos de Mergulho',
    category: 'glasses',
    price: 60,
    description: 'Pronto para mergulhar nas profundezas do conhecimento!',
    icon: '🤿',
    previewColor: '#06D6A0',
    rarity: 'raro',
  },

  // Tênis & Calçados (Shoes)
  {
    id: 'shoes_sneakers_blue',
    name: 'Tênis Veloz Azul',
    category: 'shoes',
    price: 30,
    description: 'Tênis leve para correr rápido entre os desafios do dia.',
    icon: '👟',
    previewColor: '#3B82F6',
    isStarter: true,
    rarity: 'comum',
  },
  {
    id: 'shoes_sneakers_red',
    name: 'Tênis Esportivo Vermelho',
    category: 'shoes',
    price: 45,
    description: 'Com amortecedor para pular de alegria nas partidas perfeitas.',
    icon: '👟',
    previewColor: '#EF4444',
    rarity: 'comum',
  },
  {
    id: 'shoes_golden_boots',
    name: 'Botinhas Douradas Mágicas',
    category: 'shoes',
    price: 90,
    description: 'Deixam um rastro brilhante quando o Tico pula de felicidade!',
    icon: '🥾',
    previewColor: '#FBBF24',
    rarity: 'lendário',
  },
  {
    id: 'shoes_rollers',
    name: 'Patins Velozes',
    category: 'shoes',
    price: 70,
    description: 'Rodinhas ultra rápidas para voar baixo nas brincadeiras!',
    icon: '🛼',
    previewColor: '#8B5CF6',
    rarity: 'raro',
  },

  // Acessórios de Pescoço / Ombros (Accessory)
  {
    id: 'acc_cape_super',
    name: 'Capa de Super-Herói',
    category: 'accessory',
    price: 85,
    description: 'O Tico voa alto como guardião do aprendizado infantil!',
    icon: '🦸',
    previewColor: '#EF4444',
    rarity: 'lendário',
  },
  {
    id: 'acc_bowtie_green',
    name: 'Gravata Borboleta Esmeralda',
    category: 'accessory',
    price: 35,
    description: 'Super elegante para dias de formatura e relatórios de evolução.',
    icon: '🎀',
    previewColor: '#10B981',
    rarity: 'comum',
  },
  {
    id: 'acc_medal_gold',
    name: 'Medalha Campeão CogniKids',
    category: 'accessory',
    price: 75,
    description: 'Símbolo dourado de dedicação e conquistas diárias!',
    icon: '🥇',
    previewColor: '#F59E0B',
    rarity: 'lendário',
  },
  {
    id: 'acc_scarf_winter',
    name: 'Cachecol Aconchegante',
    category: 'accessory',
    price: 40,
    description: 'Quentinho e macio para os dias frios de aprendizado.',
    icon: '🧣',
    previewColor: '#F97316',
    rarity: 'comum',
  },
]

const LOCAL_STORAGE_PREFIX = 'cognikids_tico_gamification_'

function getLocalState(childId: string): ChildTicoGamificationState {
  if (typeof window === 'undefined') {
    return {
      childId,
      coins: 50,
      totalEarned: 50,
      equipped: {},
      inventory: ['hat_cap_orange', 'glasses_star', 'shoes_sneakers_blue'],
    }
  }

  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${childId}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed
    }
  } catch {
    /* intentionally ignored */
  }

  // Defaults: give starter 60 coins and starter items so the kid can immediately experiment
  const defaultState: ChildTicoGamificationState = {
    childId,
    coins: 60,
    totalEarned: 60,
    equipped: {
      hat: 'hat_cap_orange',
      glasses: 'glasses_star',
      shoes: 'shoes_sneakers_blue',
    },
    inventory: ['hat_cap_orange', 'glasses_star', 'shoes_sneakers_blue'],
  }
  saveLocalState(defaultState)
  return defaultState
}

function saveLocalState(state: ChildTicoGamificationState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${state.childId}`, JSON.stringify(state))
    // Also dispatch a custom event so other components (e.g. Header, Mascot, Games) re-render immediately
    window.dispatchEvent(
      new CustomEvent('cognikids_tico_updated', {
        detail: { childId: state.childId, state },
      }),
    )
  } catch {
    /* intentionally ignored */
  }
}

export class TicoGamificationService {
  /**
   * Fetches gamification state for a child (local first, then syncing with backend if online)
   */
  public async getChildGamification(childId: string): Promise<ChildTicoGamificationState> {
    const local = getLocalState(childId)

    if (pb.authStore.isValid && pb.authStore.record?.id && navigator.onLine) {
      try {
        const records = await pb.collection('child_coins_balance').getList(1, 1, {
          filter: `child_id = '${childId}'`,
        })

        if (records.items.length > 0) {
          const rec = records.items[0]
          const backendCoins = (rec as any).coins ?? local.coins
          const backendTotal = (rec as any).total_earned ?? local.totalEarned
          const equipped: ChildTicoEquipped = {
            hat: (rec as any).equipped_hat || local.equipped.hat || '',
            glasses: (rec as any).equipped_glasses || local.equipped.glasses || '',
            shoes: (rec as any).equipped_shoes || local.equipped.shoes || '',
            accessory: (rec as any).equipped_accessory || local.equipped.accessory || '',
            outfit: (rec as any).equipped_outfit || local.equipped.outfit || '',
          }

          // Fetch inventory items from backend
          const invRecs = await pb.collection('child_tico_inventory').getFullList({
            filter: `child_id = '${childId}'`,
          })
          const backendInv = invRecs.map((i: any) => i.item_id)
          const mergedInv = Array.from(new Set([...local.inventory, ...backendInv]))

          const syncedState: ChildTicoGamificationState = {
            childId,
            coins: Math.max(local.coins, backendCoins),
            totalEarned: Math.max(local.totalEarned, backendTotal),
            equipped,
            inventory: mergedInv,
          }
          saveLocalState(syncedState)
          return syncedState
        } else {
          // If no remote record exists yet, create one
          try {
            await pb.collection('child_coins_balance').create({
              user_id: pb.authStore.record.id,
              child_id: childId,
              coins: local.coins,
              total_earned: local.totalEarned,
              equipped_hat: local.equipped.hat || '',
              equipped_glasses: local.equipped.glasses || '',
              equipped_shoes: local.equipped.shoes || '',
              equipped_accessory: local.equipped.accessory || '',
              equipped_outfit: local.equipped.outfit || '',
            })
            for (const itemId of local.inventory) {
              const itemDef = TICO_STORE_ITEMS.find((it) => it.id === itemId)
              if (itemDef) {
                await pb.collection('child_tico_inventory').create({
                  user_id: pb.authStore.record.id,
                  child_id: childId,
                  item_id: itemId,
                  item_category: itemDef.category,
                  item_name: itemDef.name,
                  price_paid: 0,
                  purchased_at: new Date().toISOString(),
                })
              }
            }
          } catch {
            /* intentionally ignored */
          }
        }
      } catch (err) {
        console.warn('Could not sync tico gamification with backend, using local state', err)
      }
    }

    return local
  }

  /**
   * Award coins to a child (e.g. game finished, daily session finished, bonus stars).
   * Persists immediately to local storage and syncs to PB if possible.
   */
  public async awardCoins(
    childId: string,
    amount: number,
    reason?: string,
  ): Promise<{ newCoins: number; added: number }> {
    if (amount <= 0) return { newCoins: 0, added: 0 }

    const state = getLocalState(childId)
    state.coins += amount
    state.totalEarned += amount
    saveLocalState(state)

    if (pb.authStore.isValid && pb.authStore.record?.id && navigator.onLine) {
      try {
        const records = await pb.collection('child_coins_balance').getList(1, 1, {
          filter: `child_id = '${childId}'`,
        })
        if (records.items.length > 0) {
          const rec = records.items[0]
          await pb.collection('child_coins_balance').update(rec.id, {
            coins: state.coins,
            total_earned: state.totalEarned,
          })
        } else {
          await pb.collection('child_coins_balance').create({
            user_id: pb.authStore.record.id,
            child_id: childId,
            coins: state.coins,
            total_earned: state.totalEarned,
            equipped_hat: state.equipped.hat || '',
            equipped_glasses: state.equipped.glasses || '',
            equipped_shoes: state.equipped.shoes || '',
            equipped_accessory: state.equipped.accessory || '',
          })
        }
      } catch (err) {
        console.warn('Failed saving coins to backend', err)
      }
    }

    return { newCoins: state.coins, added: amount }
  }

  /**
   * Purchase an item from the Tico store
   */
  public async purchaseItem(
    childId: string,
    itemId: string,
  ): Promise<{ success: boolean; message: string; remainingCoins?: number }> {
    const item = TICO_STORE_ITEMS.find((it) => it.id === itemId)
    if (!item) {
      return { success: false, message: 'Item não encontrado no catálogo.' }
    }

    const state = getLocalState(childId)
    if (state.inventory.includes(itemId)) {
      return { success: false, message: 'Você já possui este item no guarda-roupa!' }
    }

    if (state.coins < item.price) {
      const missing = item.price - state.coins
      return {
        success: false,
        message: `Moedas insuficientes! Faltam ${missing} moedas. Jogue mais para juntar!`,
      }
    }

    // Deduct coins & add to inventory
    state.coins -= item.price
    state.inventory.push(itemId)

    // Auto equip upon purchase for excitement
    state.equipped[item.category] = itemId
    saveLocalState(state)

    // Sync to PocketBase
    if (pb.authStore.isValid && pb.authStore.record?.id && navigator.onLine) {
      try {
        const records = await pb.collection('child_coins_balance').getList(1, 1, {
          filter: `child_id = '${childId}'`,
        })
        if (records.items.length > 0) {
          const rec = records.items[0]
          const updateData: any = { coins: state.coins }
          if (item.category === 'hat') updateData.equipped_hat = itemId
          if (item.category === 'glasses') updateData.equipped_glasses = itemId
          if (item.category === 'shoes') updateData.equipped_shoes = itemId
          if (item.category === 'accessory') updateData.equipped_accessory = itemId
          await pb.collection('child_coins_balance').update(rec.id, updateData)
        }

        await pb.collection('child_tico_inventory').create({
          user_id: pb.authStore.record.id,
          child_id: childId,
          item_id: itemId,
          item_category: item.category,
          item_name: item.name,
          price_paid: item.price,
          purchased_at: new Date().toISOString(),
        })
      } catch (err) {
        console.warn('Failed syncing purchase to PocketBase', err)
      }
    }

    return {
      success: true,
      message: `Oba! Você comprou ${item.name} e vestiu no Tico!`,
      remainingCoins: state.coins,
    }
  }

  /**
   * Equip or unequip an item in the wardrobe
   */
  public async setEquippedItem(
    childId: string,
    category: TicoItemCategory,
    itemId: string | null,
  ): Promise<ChildTicoEquipped> {
    const state = getLocalState(childId)
    if (itemId) {
      if (!state.inventory.includes(itemId)) {
        throw new Error('Item não está no inventário da criança.')
      }
      state.equipped[category] = itemId
    } else {
      delete state.equipped[category]
    }
    saveLocalState(state)

    if (pb.authStore.isValid && pb.authStore.record?.id && navigator.onLine) {
      try {
        const records = await pb.collection('child_coins_balance').getList(1, 1, {
          filter: `child_id = '${childId}'`,
        })
        if (records.items.length > 0) {
          const rec = records.items[0]
          const fieldMap: Record<TicoItemCategory, string> = {
            hat: 'equipped_hat',
            glasses: 'equipped_glasses',
            shoes: 'equipped_shoes',
            accessory: 'equipped_accessory',
            outfit: 'equipped_outfit',
          }
          await pb.collection('child_coins_balance').update(rec.id, {
            [fieldMap[category]]: itemId || '',
          })
        }
      } catch (err) {
        console.warn('Failed to update equipped item on backend', err)
      }
    }

    return state.equipped
  }

  /**
   * Synchronously get currently equipped items for quick mascot rendering
   */
  public getEquippedSync(childId?: string): ChildTicoEquipped {
    if (!childId) {
      if (typeof window !== 'undefined') {
        const activeId = localStorage.getItem('cognikids_selected_child_id')
        if (activeId) {
          return getLocalState(activeId).equipped
        }
      }
      return { hat: 'hat_cap_orange', glasses: 'glasses_star', shoes: 'shoes_sneakers_blue' }
    }
    return getLocalState(childId).equipped
  }

  /**
   * Synchronously get current coins balance for quick header display
   */
  public getCoinsSync(childId?: string): number {
    if (!childId) {
      if (typeof window !== 'undefined') {
        const activeId = localStorage.getItem('cognikids_selected_child_id')
        if (activeId) {
          return getLocalState(activeId).coins
        }
      }
      return 60
    }
    return getLocalState(childId).coins
  }
}

export const ticoGamificationService = new TicoGamificationService()
