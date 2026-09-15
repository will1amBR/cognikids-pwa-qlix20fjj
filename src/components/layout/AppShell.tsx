import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import { useLanguage } from '@/context/LanguageContext'
import { fetchChildren, getChildAvatarUrl } from '@/services/children'
import type { Child } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { ConnectivityPill } from './ConnectivityPill'
import { GuidedTourOverlay, useGuidedTour } from '@/components/tour/GuidedTourOverlay'
import {
  getReminderConfig,
  checkShouldTriggerReminder,
  markReminderTriggeredToday,
  checkShouldTriggerVocabReminder,
  markVocabReminderTriggeredToday,
  getRandomVocabTip,
  sendLocalNotification,
} from '@/services/reminders'
import type { AppLanguage } from '@/types/cognikids'
import { useToast } from '@/hooks/use-toast'
import {
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  Gamepad2,
  BookOpen,
  Share2,
  TrendingUp,
  History,
  Coins,
  Shirt,
} from 'lucide-react'
import { ticoGamificationService } from '@/services/ticoGamification'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export const AppShell: React.FC = () => {
  const { user, logout, isValid } = useAuth()
  const { isMuted, toggleMute } = useSound()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [childCoins, setChildCoins] = useState<number>(60)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toast } = useToast()
  const { isOpen: isTourOpen, closeTour } = useGuidedTour()

  useEffect(() => {
    if (!isValid) {
      navigate('/login')
      return
    }

    const load = async () => {
      const list = await fetchChildren()
      setChildrenList(list)

      // Restore active child from storage or default to first
      const storedChildId = localStorage.getItem('cognikids_selected_child_id')
      const found = list.find((c) => c.id === storedChildId) || list[0] || null
      setSelectedChild(found)
      if (found) {
        setChildCoins(ticoGamificationService.getCoinsSync(found.id))
      }
    }
    load()
  }, [isValid, navigate])

  // Keep coins in sync with custom events
  useEffect(() => {
    const handleCoinsUpdate = (e: any) => {
      if (!selectedChild || e.detail?.childId === selectedChild.id) {
        if (e.detail?.state?.coins !== undefined) {
          setChildCoins(e.detail.state.coins)
        } else if (selectedChild) {
          setChildCoins(ticoGamificationService.getCoinsSync(selectedChild.id))
        }
      }
    }
    window.addEventListener('cognikids_tico_updated', handleCoinsUpdate)
    return () => window.removeEventListener('cognikids_tico_updated', handleCoinsUpdate)
  }, [selectedChild])

  // In-app and browser reminder background check
  useEffect(() => {
    if (!isValid) return

    const checkReminder = async () => {
      const config = await getReminderConfig()
      const kidName = selectedChild ? selectedChild.name : 'seu filho(a)'

      // 1. Routine daily session reminder
      if (checkShouldTriggerReminder(config)) {
        markReminderTriggeredToday()

        toast({
          title: `⏰ Hora da Sessão Diária de ${kidName}!`,
          description: `O Tico preparou joguinhos rápidos para hoje. Vamos brincar?`,
          action: selectedChild ? (
            <Button
              size="sm"
              onClick={() => navigate(`/app/daily/${selectedChild.id}`)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              Iniciar
            </Button>
          ) : undefined,
        })

        sendLocalNotification(
          `⏰ Hora da Sessão Diária de ${kidName}!`,
          'O Tico preparou joguinhos rápidos para hoje. Vamos brincar no CogniKids?',
        )
      }

      // 2. Vocabulary practice reminder
      if (checkShouldTriggerVocabReminder(config)) {
        markVocabReminderTriggeredToday()
        const lang = (config.vocab_reminder_language as AppLanguage) || 'pt-BR'
        const tip = getRandomVocabTip(lang)

        toast({
          title: `🗣️ Fila de Revisão (${tip.languageLabel}) com ${kidName}! ${tip.flag}`,
          description: `Vocábulo prioritário: "${tip.wordNative}" (${tip.wordTranslation}). ${tip.practicalHomeTip}`,
          action: selectedChild ? (
            <Button
              size="sm"
              onClick={() => navigate(`/app/history/${selectedChild.id}`)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl"
            >
              Ver Fila
            </Button>
          ) : undefined,
        })

        sendLocalNotification(
          `🗣️ Fila de Revisão (${tip.languageLabel}) com ${kidName}! ${tip.flag}`,
          `Vocábulo prioritário: "${tip.wordNative}" (${tip.wordTranslation}). Dica: ${tip.practicalHomeTip}`,
        )
      }
    }

    // Check immediately on mount
    checkReminder()

    // And check periodically every 30 seconds while app is open
    const interval = setInterval(checkReminder, 30000)
    return () => clearInterval(interval)
  }, [isValid, selectedChild, navigate, toast])

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child)
    localStorage.setItem('cognikids_selected_child_id', child.id)
    setChildCoins(ticoGamificationService.getCoinsSync(child.id))
  }

  const isJuniorRoute = location.pathname.startsWith('/junior')
  const isSelectedChildJunior = selectedChild?.birth_date
    ? (new Date().getFullYear() - new Date(selectedChild.birth_date).getFullYear()) * 12 +
        (new Date().getMonth() - new Date(selectedChild.birth_date).getMonth()) >=
      72
    : false

  const navItems = isJuniorRoute
    ? [
        {
          label: 'Junior Início',
          path: '/junior',
          icon: Home,
        },
        {
          label: 'Painel & Progresso',
          path: '/junior/progress',
          icon: BarChart3,
        },
        {
          label: 'CogniKids Infantil (0-5a)',
          path: '/app',
          icon: Sparkles,
        },
        { label: t('nav.children'), path: '/app/children', icon: Users },
        {
          label: 'Histórico Geral',
          path: selectedChild ? `/app/history/${selectedChild.id}` : '/app/history',
          icon: History,
        },
        {
          label: t('nav.reports'),
          path: selectedChild ? `/app/reports/${selectedChild.id}` : '/app/reports',
          icon: BarChart3,
        },
        { label: t('nav.settings'), path: '/app/settings', icon: Settings },
      ]
    : [
        {
          label: t('nav.home'),
          path: '/app',
          icon: Home,
        },
        {
          label: 'CogniKids Junior (6-10a)',
          path: '/junior',
          icon: Sparkles,
          highlight: true,
        },
        { label: t('nav.children'), path: '/app/children', icon: Users },
        {
          label: t('nav.progress'),
          path: selectedChild ? `/app/child/${selectedChild.id}` : '/app/children',
          icon: BarChart3,
        },
        {
          label: t('nav.reports'),
          path: selectedChild ? `/app/reports/${selectedChild.id}` : '/app/reports',
          icon: BarChart3,
        },
        {
          label: 'Guarda-Roupa do Tico',
          path: '/app/wardrobe',
          icon: Shirt,
        },
        {
          label: 'Histórico',
          path: selectedChild ? `/app/history/${selectedChild.id}` : '/app/history',
          icon: History,
        },
        { label: 'Guia Temático', path: '/app/themes-guide', icon: BookOpen },
        { label: t('nav.community'), path: '/app/community', icon: Share2 },
        { label: t('nav.settings'), path: '/app/settings', icon: Settings },
      ]

  // Clean, focused 4-item bottom bar for mobile screens (<1024px)
  const mobilePrimaryTabs = isJuniorRoute
    ? [
        { label: 'Início', path: '/junior', icon: Home },
        { label: 'Tico Roupa', path: '/app/wardrobe', icon: Shirt },
        { label: 'Progresso', path: '/junior/progress', icon: BarChart3 },
        { label: 'Infantil', path: '/app', icon: Sparkles },
      ]
    : [
        { label: 'Início', path: '/app', icon: Home },
        { label: 'Tico Roupa', path: '/app/wardrobe', icon: Shirt },
        {
          label: 'Progresso',
          path: selectedChild ? `/app/child/${selectedChild.id}` : '/app/children',
          icon: BarChart3,
        },
        { label: 'Junior', path: '/junior', icon: Sparkles },
      ]

  // Remaining items accessible inside the "Menu" bottom sheet on mobile
  const mobileMenuExtraItems = isJuniorRoute
    ? [
        {
          label: 'Loja & Guarda-Roupa do Tico',
          path: '/app/wardrobe',
          icon: Shirt,
          desc: 'Compre chapéus, óculos e tênis com moedas',
        },
        {
          label: 'Perfis das Crianças',
          path: '/app/children',
          icon: Users,
          desc: 'Cadastre e gerencie perfis infantis',
        },
        {
          label: 'Histórico de Atividades',
          path: selectedChild ? `/app/history/${selectedChild.id}` : '/app/history',
          icon: History,
          desc: 'Partidas jogadas, estrelas e palavras treinadas',
        },
        {
          label: 'Relatórios de Evolução',
          path: selectedChild ? `/app/reports/${selectedChild.id}` : '/app/reports',
          icon: TrendingUp,
          desc: 'PDFs e gráficos diagnósticos clínicos/pedagógicos',
        },
        {
          label: 'Portal da Escola & Convites',
          path: '/app/community',
          icon: Share2,
          desc: 'Convide amigos ou acesse códigos escolares',
        },
        {
          label: 'Configurações & Lembretes',
          path: '/app/settings',
          icon: Settings,
          desc: 'Lembretes diários de treino e notificações',
        },
      ]
    : [
        {
          label: 'Loja & Guarda-Roupa do Tico',
          path: '/app/wardrobe',
          icon: Shirt,
          desc: 'Compre chapéus, óculos e tênis com moedas',
        },
        {
          label: 'Perfis das Crianças',
          path: '/app/children',
          icon: Users,
          desc: 'Cadastre e gerencie perfis infantis',
        },
        {
          label: 'Histórico de Atividades',
          path: selectedChild ? `/app/history/${selectedChild.id}` : '/app/history',
          icon: History,
          desc: 'Partidas jogadas, estrelas e palavras treinadas',
        },
        {
          label: 'Relatórios de Evolução',
          path: selectedChild ? `/app/reports/${selectedChild.id}` : '/app/reports',
          icon: TrendingUp,
          desc: 'PDFs e gráficos diagnósticos clínicos/pedagógicos',
        },
        {
          label: 'Guia Temático',
          path: '/app/themes-guide',
          icon: BookOpen,
          desc: 'BNCC e sugestões de estímulo em casa',
        },
        {
          label: 'Convites & Escola',
          path: '/app/community',
          icon: Share2,
          desc: 'Convide amigos ou acesse códigos escolares',
        },
        {
          label: 'Configurações & Lembretes',
          path: '/app/settings',
          icon: Settings,
          desc: 'Lembretes diários de treino e notificações',
        },
      ]

  const guardianInitial = (user?.name || user?.email || 'R').charAt(0).toUpperCase()
  const currentLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 lg:pb-0">
      {/* Junior Banner if in Junior Mode */}
      {isJuniorRoute && (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between border-b border-indigo-700/50">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">🚀 CogniKids Junior Ativo</span>
            <span className="hidden sm:inline opacity-80 text-[11px]">
              • Modo avançado para 6 a 10 anos
            </span>
          </div>
          <Link to="/app" className="text-[11px] underline text-indigo-200 hover:text-white">
            Voltar ao Infantil (0-5 anos) →
          </Link>
        </div>
      )}
      {/* Top Bar (64px) — Responsivo, sem overflow ou cortes na borda direita */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-2.5 sm:px-6 flex items-center justify-between shadow-xs gap-2">
        {/* Left: Brand Wordmark & Mode Switch */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          <Link
            to={isJuniorRoute ? '/junior' : '/app'}
            className="flex items-center gap-1.5 group shrink-0"
          >
            <TicoMascot size="sm" mood="happy" animate={false} />
            <div className="flex flex-col">
              <span
                className={`font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r ${
                  isJuniorRoute
                    ? 'from-indigo-600 to-purple-600'
                    : 'from-orange-500 via-amber-500 to-sky-600'
                } bg-clip-text text-transparent`}
              >
                CogniKids{isJuniorRoute ? ' Jr' : ''}
              </span>
            </div>
          </Link>

          {/* Quick Switch Button */}
          <Link
            to={isJuniorRoute ? '/app' : '/junior'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
              isJuniorRoute
                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isJuniorRoute ? 'Infantil (0-5a)' : 'Junior (6-10a)'}</span>
          </Link>
        </div>

        {/* Center: Current Child Switcher */}
        <div className="flex items-center min-w-0 flex-1 justify-center max-w-[150px] sm:max-w-[220px]">
          {childrenList.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors max-w-full">
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-[11px] sm:text-xs font-bold shadow-xs overflow-hidden shrink-0"
                    style={{ backgroundColor: selectedChild?.favorite_color || '#FF7A45' }}
                  >
                    {selectedChild?.avatar ? (
                      <img
                        src={getChildAvatarUrl(selectedChild) || ''}
                        alt={selectedChild.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (selectedChild?.name || 'C').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {selectedChild?.name || 'Selecionar'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 p-2 rounded-2xl shadow-xl">
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Crianças cadastradas
                </DropdownMenuLabel>
                {childrenList.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => handleSelectChild(c)}
                    className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: c.favorite_color || '#FF7A45' }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col flex-1 truncate">
                      <span className="text-sm font-medium text-slate-800 truncate">{c.name}</span>
                    </div>
                    {selectedChild?.id === c.id && (
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/app/children/new')}
                  className="flex items-center gap-2 p-2 rounded-xl text-orange-600 font-semibold cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar nova criança</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/app/children/new"
              className="text-[11px] sm:text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2 sm:px-3 py-1 rounded-full border border-orange-200 transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="truncate">Criança</span>
            </Link>
          )}
        </div>

        {/* Right: Coins Counter + Language selector + Connectivity Pill + Sound toggle + Guardian Menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Topbar Coins Pill */}
          <Link
            to="/app/wardrobe"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-black transition-all shadow-xs"
            title="Loja & Guarda-Roupa do Tico"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-600" />
            <span>{childCoins}</span>
          </Link>

          {/* Topbar Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-all shadow-xs"
                title={t('nav.language')}
              >
                <span className="text-sm leading-none">{currentLangOption.flag}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl shadow-xl">
              <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                {t('nav.language')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(val) => setLanguage(val as any)}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <DropdownMenuRadioItem
                    key={l.code}
                    value={l.code}
                    className="text-xs font-bold py-2 rounded-xl cursor-pointer"
                  >
                    <span className="mr-2 text-base">{l.flag}</span>
                    <span>{l.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConnectivityPill />

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title={isMuted ? 'Ativar som' : 'Desativar som'}
            aria-label="Controle de áudio"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs hover:ring-2 hover:ring-sky-300 transition-all">
                {guardianInitial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl">
              <div className="px-3 py-2">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user?.name || 'Responsável'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/app/settings')}
                className="flex items-center gap-2 p-2 rounded-xl cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Meus dados</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/app/settings')}
                className="flex items-center gap-2 p-2 rounded-xl cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="flex items-center gap-2 p-2 rounded-xl text-rose-600 font-semibold cursor-pointer hover:bg-rose-50 focus:bg-rose-50"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Container with Desktop Sidebar */}
      <div className="flex-1 max-w-[1280px] w-full mx-auto flex">
        {/* Desktop Sidebar (>=1024px) */}
        <aside className="hidden lg:flex flex-col w-60 p-6 gap-2 border-r border-slate-200/80 bg-white/50 shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navegação
          </div>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/app' && location.pathname.startsWith(item.path))
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {selectedChild && (
            <div
              className={`mt-8 p-4 rounded-2xl border text-center ${
                isJuniorRoute || isSelectedChildJunior
                  ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-100'
              }`}
            >
              <div className="flex justify-center mb-2">
                <TicoMascot size="sm" mood="talking" />
              </div>
              <p className="text-xs font-bold text-slate-800">{selectedChild.name} está pronta!</p>
              <p className="text-[11px] text-slate-500 mb-3">
                {isSelectedChildJunior
                  ? 'Perfil Junior (6 a 10 anos)'
                  : 'Módulos adaptados à idade.'}
              </p>
              <Button
                size="sm"
                className={`w-full text-white font-bold rounded-xl shadow-sm text-xs ${
                  isJuniorRoute || isSelectedChildJunior
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
                onClick={() => {
                  if (isSelectedChildJunior) {
                    navigate('/junior')
                  } else {
                    navigate(`/app/child/${selectedChild.id}`)
                  }
                }}
              >
                <Gamepad2 className="w-3.5 h-3.5 mr-1.5" />
                {isSelectedChildJunior ? 'Abrir Missões Junior' : 'Abrir Jogos'}
              </Button>
            </div>
          )}
        </aside>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full">
          <Outlet context={{ selectedChild, childrenList, setSelectedChild }} />
        </main>
      </div>

      {/* Interactive Guided Tour for Guardians */}
      <GuidedTourOverlay
        isOpen={isTourOpen}
        hasJuniorChild={isSelectedChildJunior}
        onDismiss={closeTour}
        onComplete={closeTour}
      />

      {/* Mobile Bottom Tab Bar (<1024px) — Máximo 5 itens (4 abas essenciais + 1 botão Menu com Sheet) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around px-1 shadow-lg">
        {mobilePrimaryTabs.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/app' &&
              item.path !== '/junior' &&
              location.pathname.startsWith(item.path))
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors min-w-0 ${
                isActive ? 'text-orange-500 font-extrabold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] sm:text-[11px] font-bold leading-tight mt-1 truncate max-w-[64px] text-center">
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* 5th Mobile Item: Menu bottom sheet for secondary navigation */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors min-w-0 ${
                mobileMenuExtraItems.some((it) => location.pathname.startsWith(it.path))
                  ? 'text-orange-500 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Abrir menu de recursos"
            >
              <Menu className="w-5 h-5 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold leading-tight mt-1 truncate max-w-[64px] text-center">
                Menu
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
            <SheetHeader className="text-left pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TicoMascot size="sm" mood="happy" />
                <div>
                  <SheetTitle className="text-lg font-black text-slate-800">
                    Menu CogniKids
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500">
                    Acesso rápido a todos os recursos e relatórios
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="py-4 space-y-2">
              {mobileMenuExtraItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  location.pathname === item.path || location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-orange-50 border-orange-200 text-orange-900 font-bold'
                        : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white text-slate-600 shadow-xs'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </Link>
                )
              })}

              {/* Mode switch helper in bottom sheet */}
              <div className="pt-2">
                <Link
                  to={isJuniorRoute ? '/app' : '/junior'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl font-bold text-xs border ${
                    isJuniorRoute
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-950'
                      : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>
                      {isJuniorRoute
                        ? 'Mudar para CogniKids Infantil (0-5a)'
                        : 'Mudar para CogniKids Junior (6-10a)'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 opacity-60" />
                </Link>
              </div>

              {/* School teacher portal link */}
              <div className="pt-1">
                <Link
                  to="/escola"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl font-bold text-xs border bg-slate-50 border-slate-200 text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Portal Pedagógico da Escola (/escola)</span>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 opacity-60" />
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}
