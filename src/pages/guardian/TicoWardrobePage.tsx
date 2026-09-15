import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSound } from '@/context/SoundContext'
import {
  TICO_STORE_ITEMS,
  TicoStoreItem,
  TicoItemCategory,
  ChildTicoGamificationState,
  ticoGamificationService,
} from '@/services/ticoGamification'
import type { Child } from '@/types/cognikids'
import {
  Coins,
  Shirt,
  ShoppingBag,
  Sparkles,
  Check,
  CheckCircle2,
  Lock,
  ArrowRight,
  Flame,
  Gamepad2,
  RefreshCw,
  Gift,
  HelpCircle,
} from 'lucide-react'

export const TicoWardrobePage: React.FC = () => {
  const { playPop, playStarPop, playVictory } = useSound()
  const navigate = useNavigate()
  const outletCtx = useOutletContext<{ selectedChild?: Child; childrenList?: Child[] }>()
  const selectedChild = outletCtx?.selectedChild || null

  const [activeTab, setActiveTab] = useState<'wardrobe' | 'store'>('wardrobe')
  const [selectedCategory, setSelectedCategory] = useState<TicoItemCategory | 'all'>('all')
  const [gamificationState, setGamificationState] = useState<ChildTicoGamificationState | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [purchaseModalItem, setPurchaseModalItem] = useState<TicoStoreItem | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

  const childId = selectedChild?.id || 'default_child'
  const childName = selectedChild?.name || 'sua criança'

  const loadData = async () => {
    setIsLoading(true)
    const state = await ticoGamificationService.getChildGamification(childId)
    setGamificationState(state)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [childId])

  // Listen to custom updates from anywhere
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (!e.detail?.childId || e.detail.childId === childId) {
        if (e.detail?.state) {
          setGamificationState(e.detail.state)
        } else {
          loadData()
        }
      }
    }
    window.addEventListener('cognikids_tico_updated', handleUpdate)
    return () => window.removeEventListener('cognikids_tico_updated', handleUpdate)
  }, [childId])

  const categories: { key: TicoItemCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Tudo', icon: '✨' },
    { key: 'hat', label: 'Chapéus & Bonés', icon: '🧢' },
    { key: 'glasses', label: 'Óculos', icon: '👓' },
    { key: 'shoes', label: 'Tênis & Botas', icon: '👟' },
    { key: 'accessory', label: 'Acessórios & Capas', icon: '🦸' },
  ]

  const filteredStoreItems = useMemo(() => {
    if (selectedCategory === 'all') return TICO_STORE_ITEMS
    return TICO_STORE_ITEMS.filter((i) => i.category === selectedCategory)
  }, [selectedCategory])

  const ownedItems = useMemo(() => {
    if (!gamificationState) return []
    const ownedSet = new Set(gamificationState.inventory)
    const items = TICO_STORE_ITEMS.filter((i) => ownedSet.has(i.id))
    if (selectedCategory === 'all') return items
    return items.filter((i) => i.category === selectedCategory)
  }, [gamificationState, selectedCategory])

  const handleEquip = async (item: TicoStoreItem) => {
    if (!gamificationState) return
    playPop()
    const isCurrentlyEquipped = gamificationState.equipped[item.category] === item.id
    try {
      const newEquipped = await ticoGamificationService.setEquippedItem(
        childId,
        item.category,
        isCurrentlyEquipped ? null : item.id,
      )
      setGamificationState((prev) => (prev ? { ...prev, equipped: newEquipped } : null))
      playStarPop(2)
      setFeedbackMessage({
        text: isCurrentlyEquipped
          ? `${item.name} foi guardado no armário.`
          : `Tico vestiu ${item.name}! Ficou incrível! 🪶✨`,
        type: 'success',
      })
      setTimeout(() => setFeedbackMessage(null), 3000)
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Erro ao vestir item', type: 'error' })
    }
  }

  const handlePurchase = async (item: TicoStoreItem) => {
    if (!gamificationState) return
    playPop()
    const result = await ticoGamificationService.purchaseItem(childId, item.id)
    if (result.success) {
      playVictory()
      setPurchaseModalItem(null)
      setFeedbackMessage({ text: result.message, type: 'success' })
      loadData()
      setTimeout(() => setFeedbackMessage(null), 4000)
    } else {
      setFeedbackMessage({ text: result.message, type: 'error' })
      setTimeout(() => setFeedbackMessage(null), 4000)
    }
  }

  const currentCoins = gamificationState?.coins ?? 0

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner / Hero with Active Mascot Preview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-sky-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-orange-400/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-black uppercase tracking-wider">
              <span>🪶</span>
              <span>Gamificação & Economia Infantil</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
              Loja & Guarda-Roupa do Tico
            </h1>

            <p className="text-xs sm:text-base text-amber-50 leading-relaxed font-medium">
              A cada jogo concluído, treino diário e acertos fonéticos, {childName} junta{' '}
              <strong>moedas de ouro</strong> para vestir o Tico com bonés, óculos e tênis!
            </p>

            {/* Educational pedagogical note on saving coins */}
            <div className="pt-1 flex items-center justify-center md:justify-start gap-2 text-xs text-amber-100 font-semibold">
              <Gift className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Educação financeira lúdica: incentive a criança a juntar moedas para conquistar
                itens raros!
              </span>
            </div>
          </div>

          {/* Large Live Interactive Mascot Preview */}
          <div className="bg-white/15 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/25 shadow-2xl flex flex-col items-center shrink-0">
            <div className="relative">
              <TicoMascot
                size="xl"
                mood="happy"
                childId={childId}
                equipped={gamificationState?.equipped}
              />
              <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md animate-pulse">
                Estiloso!
              </div>
            </div>

            <span className="text-xs font-black uppercase text-amber-200 mt-2">
              Tico de {childName}
            </span>

            {/* Balance Badge inside Mascot Box */}
            <div className="mt-2 flex items-center gap-2 bg-white text-slate-800 font-black text-sm px-4 py-1.5 rounded-full shadow-md">
              <Coins className="w-4 h-4 fill-amber-400 text-amber-600" />
              <span className="text-amber-900">{currentCoins} moedas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-md transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <HelpCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Tabs Navigation: Guarda-Roupa vs Loja */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => {
              playPop()
              setActiveTab('wardrobe')
            }}
            variant={activeTab === 'wardrobe' ? 'default' : 'outline'}
            className={`flex-1 sm:flex-initial rounded-2xl h-11 px-6 font-black text-sm flex items-center gap-2 ${
              activeTab === 'wardrobe'
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Guarda-Roupa ({ownedItems.length})</span>
          </Button>

          <Button
            onClick={() => {
              playPop()
              setActiveTab('store')
            }}
            variant={activeTab === 'store' ? 'default' : 'outline'}
            className={`flex-1 sm:flex-initial rounded-2xl h-11 px-6 font-black text-sm flex items-center gap-2 ${
              activeTab === 'store'
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Loja do Tico ({TICO_STORE_ITEMS.length})</span>
          </Button>
        </div>

        {/* Current Coins Counter with Quick Earn Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
            <Coins className="w-5 h-5 fill-amber-400 text-amber-600" />
            <div className="text-left">
              <span className="text-[10px] font-bold uppercase text-amber-700 block leading-tight">
                Saldo de Moedas
              </span>
              <span className="text-base font-black text-amber-950 leading-tight">
                {currentCoins}
              </span>
            </div>
          </div>

          <Link to={`/app/daily/${childId}`}>
            <Button
              size="sm"
              className="rounded-2xl h-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Ganhar Moedas</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => {
                playPop()
                setSelectedCategory(cat.key)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: GUARDA-ROUPA (VESTIR / TROCAR ITENS COMPRADOS) */}
      {activeTab === 'wardrobe' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-orange-500" />
                <span>Roupas e Acessórios de {childName}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Clique em um item para vestir ou tirar do Tico
              </p>
            </div>
          </div>

          {ownedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <TicoMascot size="lg" mood="talking" />
              <h3 className="text-base font-black text-slate-800">
                Nenhum item nesta categoria ainda!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Visite a Loja do Tico para comprar novos bonés, óculos e tênis com suas moedas.
              </p>
              <Button
                onClick={() => setActiveTab('store')}
                className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-10 px-6 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                <span>Ir para a Loja</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ownedItems.map((item) => {
                const isEquipped = gamificationState?.equipped[item.category] === item.id

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                      isEquipped
                        ? 'border-2 border-orange-500 ring-4 ring-orange-100 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            item.rarity === 'lendário'
                              ? 'bg-amber-100 text-amber-800'
                              : item.rarity === 'raro'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.rarity || 'comum'}
                        </span>

                        {isEquipped && (
                          <Badge className="bg-orange-500 text-white font-black text-[10px] px-2 py-0.5">
                            Vestido no Tico ✨
                          </Badge>
                        )}
                      </div>

                      {/* Icon Avatar Preview */}
                      <div
                        className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-3 transition-transform hover:scale-105"
                        style={{ backgroundColor: `${item.previewColor}18` }}
                      >
                        {item.icon}
                      </div>

                      <h3 className="font-black text-sm text-slate-800 text-center">{item.name}</h3>
                      <p className="text-[11px] text-slate-500 text-center mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={() => handleEquip(item)}
                        variant={isEquipped ? 'outline' : 'default'}
                        className={`w-full rounded-2xl h-10 font-black text-xs transition-all ${
                          isEquipped
                            ? 'border-orange-300 text-orange-700 bg-orange-50/50 hover:bg-orange-100'
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            <span>Tirar do Tico</span>
                          </>
                        ) : (
                          <>
                            <Shirt className="w-3.5 h-3.5 mr-1" />
                            <span>Vestir no Tico</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOJA DO TICO (COMPRAR COM MOEDAS) */}
      {activeTab === 'store' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <span>Catálogo da Loja do Tico</span>
              </h2>
              <p className="text-xs text-slate-500">
                Cada item custa moedas. Jogue e treine para acumular mais!
              </p>
            </div>

            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
              Seu saldo: <span className="font-black text-amber-600">{currentCoins} moedas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStoreItems.map((item) => {
              const isOwned = gamificationState?.inventory.includes(item.id)
              const isEquipped = gamificationState?.equipped[item.category] === item.id
              const canAfford = currentCoins >= item.price

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                    isOwned
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Rarity & Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          item.rarity === 'lendário'
                            ? 'bg-amber-100 text-amber-800'
                            : item.rarity === 'raro'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.rarity || 'comum'}
                      </span>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
                        <span className="text-xs font-black text-amber-950">{item.price}</span>
                      </div>
                    </div>

                    {/* Icon Preview */}
                    <div
                      className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-3 transition-transform hover:scale-105"
                      style={{ backgroundColor: `${item.previewColor}18` }}
                    >
                      {item.icon}
                    </div>

                    <h3 className="font-black text-sm text-slate-800 text-center">{item.name}</h3>
                    <p className="text-[11px] text-slate-500 text-center mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4">
                    {isOwned ? (
                      <Button
                        onClick={() => handleEquip(item)}
                        variant="outline"
                        className={`w-full rounded-2xl h-10 font-black text-xs ${
                          isEquipped
                            ? 'border-orange-300 text-orange-700 bg-orange-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {isEquipped ? 'Vestido no Tico ✨' : 'Já comprado • Vestir'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          playPop()
                          setPurchaseModalItem(item)
                        }}
                        disabled={!canAfford}
                        className={`w-full rounded-2xl h-10 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Comprar por {item.price}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Faltam {item.price - currentCoins} moedas</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal when Purchasing an Item */}
      {purchaseModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-amber-200">
            <div
              className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-inner"
              style={{ backgroundColor: `${purchaseModalItem.previewColor}20` }}
            >
              {purchaseModalItem.icon}
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800">{purchaseModalItem.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{purchaseModalItem.description}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5">
                <Coins className="w-5 h-5 fill-amber-400 text-amber-600" />
                <span className="text-lg font-black text-amber-950">
                  {purchaseModalItem.price} moedas
                </span>
              </div>
              <span className="text-xs text-amber-700">
                (Restarão {currentCoins - purchaseModalItem.price})
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setPurchaseModalItem(null)}
                className="flex-1 rounded-2xl h-11 font-bold text-xs border-slate-200"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handlePurchase(purchaseModalItem)}
                className="flex-1 rounded-2xl h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20"
              >
                Confirmar Compra
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Educational Footer on How to Earn Coins */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border border-sky-100 shadow-xs space-y-3">
        <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
          <span>💡</span>
          <span>Como a criança ganha mais moedas de ouro?</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/80 p-3 rounded-2xl border border-sky-200/60">
            <span className="font-black text-sky-800 block mb-1">🎮 Cada Partida Concluída</span>
            <span className="text-slate-600 leading-relaxed">
              Dá <strong>15 a 30 moedas</strong> conforme o número de acertos e estrelas!
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-indigo-200/60">
            <span className="font-black text-indigo-800 block mb-1">🔥 Sessão Diária Completa</span>
            <span className="text-slate-600 leading-relaxed">
              Bônus especial de <strong>+50 moedas</strong> ao completar os passos do dia!
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-purple-200/60">
            <span className="font-black text-purple-800 block mb-1">
              ⭐ Maestria Fonética 3 Estrelas
            </span>
            <span className="text-slate-600 leading-relaxed">
              Pronúncia excelente ou pontuação alta dá bônus extra de moedas!
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default TicoWardrobePage
