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
} from 'lucide-react'
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
import { Button } from '@/components/ui/button'

export const AppShell: React.FC = () => {
  const { user, logout, isValid } = useAuth()
  const { isMuted, toggleMute } = useSound()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const { toast } = useToast()

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
    }
    load()
  }, [isValid, navigate])

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
        const lang = (config.vocab_reminder_language as AppLanguage) || 'en'
        const tip = getRandomVocabTip(lang)

        toast({
          title: `🗣️ Revisão em ${tip.languageLabel} com ${kidName}! ${tip.flag}`,
          description: `Palavras de hoje: "${tip.wordNative}". Dica: ${tip.practicalHomeTip}`,
          action: selectedChild ? (
            <Button
              size="sm"
              onClick={() => navigate(`/app/game/${selectedChild.id}/fazenda_falante`)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl"
            >
              Praticar
            </Button>
          ) : undefined,
        })

        sendLocalNotification(
          `🗣️ Revisão em ${tip.languageLabel} com ${kidName}! ${tip.flag}`,
          `Palavras de hoje: "${tip.wordNative}" (${tip.wordTranslation}). Dica: ${tip.practicalHomeTip}`,
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
  }

  const navItems = [
    { label: t('nav.home'), path: '/app', icon: Home },
    { label: t('nav.children'), path: '/app/children', icon: Users },
    {
      label: t('nav.progress'),
      path: selectedChild ? `/app/child/${selectedChild.id}` : '/app/children',
      icon: BarChart3,
    },
    {
      label: t('nav.reports'),
      path: selectedChild ? `/app/reports/${selectedChild.id}` : '/app/reports',
      icon: TrendingUp,
    },
    { label: t('nav.themesGuide'), path: '/app/themes-guide', icon: BookOpen },
    { label: t('nav.community'), path: '/app/community', icon: Share2 },
    { label: t('nav.settings'), path: '/app/settings', icon: Settings },
  ]
  const guardianInitial = (user?.name || user?.email || 'R').charAt(0).toUpperCase()
  const currentLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 lg:pb-0">
      {/* Top Bar (64px) */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Left: Brand Wordmark */}
        <Link to="/app" className="flex items-center gap-2 group">
          <TicoMascot size="sm" mood="happy" animate={false} />
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 bg-clip-text text-transparent">
              CogniKids
            </span>
          </div>
        </Link>

        {/* Center: Current Child Switcher */}
        <div className="flex items-center">
          {childrenList.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden"
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
                  <span className="text-sm font-semibold text-slate-800 max-w-[100px] sm:max-w-[140px] truncate">
                    {selectedChild?.name || 'Selecionar'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
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
              className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar criança</span>
            </Link>
          )}
        </div>

        {/* Right: Language selector + Connectivity Pill + Sound toggle + Guardian Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Topbar Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition-all shadow-xs"
                title={t('nav.language')}
              >
                <span className="text-sm leading-none">{currentLangOption.flag}</span>
                <span className="hidden sm:inline uppercase text-[11px] font-black text-slate-700">
                  {currentLangOption.code.split('-')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
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
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title={isMuted ? 'Ativar som' : 'Desativar som'}
            aria-label="Controle de áudio"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-slate-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-orange-500" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm hover:ring-2 hover:ring-sky-300 transition-all">
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
            <div className="mt-8 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-orange-100 text-center">
              <div className="flex justify-center mb-2">
                <TicoMascot size="sm" mood="talking" />
              </div>
              <p className="text-xs font-bold text-slate-800">{selectedChild.name} está pronta!</p>
              <p className="text-[11px] text-slate-500 mb-3">Módulos adaptados à idade.</p>
              <Button
                size="sm"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm text-xs"
                onClick={() => navigate(`/app/child/${selectedChild.id}`)}
              >
                <Gamepad2 className="w-3.5 h-3.5 mr-1.5" />
                Abrir Jogos
              </Button>
            </div>
          )}
        </aside>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full">
          <Outlet context={{ selectedChild, childrenList, setSelectedChild }} />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (<1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex items-center justify-around px-2 shadow-lg">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/app' && location.pathname.startsWith(item.path))
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
                isActive ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] leading-none">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
