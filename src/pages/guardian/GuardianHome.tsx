import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import {
  fetchChildren,
  fetchRecentSessions,
  getChildAvatarUrl,
  fetchChildModuleProgress,
} from '@/services/children'
import type { Child, GameSession, ModuleProgress } from '@/types/cognikids'
import { formatChildAge, COGNIKIDS_MODULES } from '@/types/cognikids'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { BrainFlower } from '@/components/progress/BrainFlower'
import {
  Plus,
  Play,
  Sparkles,
  Star,
  Trophy,
  Clock,
  ChevronRight,
  UserPlus,
  Flame,
  TrendingUp,
  History,
} from 'lucide-react'
import { BilingualBadge } from '@/components/mascot/BilingualBadge'
import { VocabReviewQueueCard } from '@/components/reminders/VocabReviewQueueCard'
import { Button } from '@/components/ui/button'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner'
import { TicoWelcomeInviteModal } from '@/components/pwa/TicoWelcomeInviteModal'
import { Coins, Shirt, ShoppingBag } from 'lucide-react'
import { ticoGamificationService } from '@/services/ticoGamification'
import { TeacherNoteBanner } from '@/components/notifications/TeacherNoteBanner'
import { WeeklyBulletinBanner } from '@/components/notifications/WeeklyBulletinBanner'
import {
  teacherNotificationService,
  TeacherNoteNotification,
} from '@/services/teacherNotificationService'
import {
  getReminderConfig,
  isWeeklyBulletinTimeReached,
  hasSeenCurrentWeeklyBulletin,
  sendLocalNotification,
} from '@/services/reminders'
import { teacherNotesService } from '@/services/teacherNotes'

export const GuardianHome: React.FC = () => {
  const { user } = useAuth()
  const { playPop } = useSound()
  const navigate = useNavigate()

  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([])
  const [childrenProgress, setChildrenProgress] = useState<Record<string, Record<string, number>>>(
    {},
  )
  const [childrenCoins, setChildrenCoins] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [unreadNotes, setUnreadNotes] = useState<TeacherNoteNotification[]>([])
  const [showWeeklyBulletin, setShowWeeklyBulletin] = useState(false)
  const [allFamilyNotes, setAllFamilyNotes] = useState<any[]>([])

  const reloadData = async () => {
    setIsLoading(true)
    const [kids, sessions] = await Promise.all([fetchChildren(), fetchRecentSessions(5)])
    setChildrenList(kids)
    setRecentSessions(sessions)

    if (kids.length === 0) {
      setShowOnboarding(true)
    }

    const progMap: Record<string, Record<string, number>> = {}
    const coinsMap: Record<string, number> = {}
    for (const kid of kids) {
      const progList = await fetchChildModuleProgress(kid.id)
      const kidMods: Record<string, number> = {}
      progList.forEach((p) => {
        kidMods[p.module_id] = p.mastery_percentage
      })
      COGNIKIDS_MODULES.forEach((m) => {
        if (kidMods[m.id] === undefined) {
          kidMods[m.id] = 45
        }
      })
      progMap[kid.id] = kidMods
      coinsMap[kid.id] = ticoGamificationService.getCoinsSync(kid.id)
    }
    setChildrenCoins(coinsMap)
    setChildrenProgress(progMap)
    setIsLoading(false)

    // Atualiza lista de anotações não lidas
    const notifs = await teacherNotificationService.refreshNotifications()
    setUnreadNotes(notifs.filter((n) => !n.isRead))

    // Carrega anotações de todas as crianças para o Boletim Semanal
    const notesPromises = kids.map((k) => teacherNotesService.fetchNotesByChild(k.id))
    const notesArrays = await Promise.all(notesPromises)
    const combinedNotes = notesArrays.flat()
    setAllFamilyNotes(combinedNotes)

    // Avalia regra do Boletim Semanal com horário fixo
    const remConfig = await getReminderConfig()
    const isTime = isWeeklyBulletinTimeReached(remConfig)
    const alreadySeen = hasSeenCurrentWeeklyBulletin(user?.id)

    if (isTime && !alreadySeen && combinedNotes.length > 0) {
      setShowWeeklyBulletin(true)
      // Dispara notificação nativa do navegador se ainda não disparada
      sendLocalNotification(
        '📋 Boletim Semanal do Professor Disponível!',
        'O resumo pedagógico das atividades escolares já está em destaque na tela inicial do CogniKids.',
      )
    } else {
      setShowWeeklyBulletin(false)
    }
  }
  useEffect(() => {
    reloadData()

    const unsub = teacherNotificationService.subscribe((list) => {
      setUnreadNotes(list.filter((n) => !n.isRead))
    })
    return () => unsub()
  }, [])

  const handlePlayClick = (child: Child) => {
    playPop()
    localStorage.setItem('cognikids_selected_child_id', child.id)
    navigate(`/app/child/${child.id}`)
  }

  const handleDailySessionClick = (child: Child) => {
    playPop()
    localStorage.setItem('cognikids_selected_child_id', child.id)
    navigate(`/app/daily/${child.id}`)
  }

  const guardianName = user?.name ? user.name.split(' ')[0] : 'Responsável'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* First-login welcome modal for parents registered via invite coupon */}
      <TicoWelcomeInviteModal guardianName={guardianName} />

      {/* PWA Install Banner with Native Prompt & Offline Benefits */}
      <PwaInstallBanner />

      {/* Boletim Semanal em Horário Fixo (Destaque Especial de Fim de Semana) */}
      {showWeeklyBulletin && (
        <WeeklyBulletinBanner
          childrenList={childrenList}
          allNotes={allFamilyNotes}
          userId={user?.id}
          onDismiss={() => setShowWeeklyBulletin(false)}
        />
      )}

      {/* Teacher Note Banner para os Pais (Destaque da anotação não lida mais recente) */}
      {!showWeeklyBulletin && unreadNotes.length > 0 && (
        <TeacherNoteBanner
          notification={unreadNotes[0]}
          userId={user?.id}
          onDismiss={() => {
            setUnreadNotes((prev) => prev.slice(1))
          }}
        />
      )}

      {/* Guided Onboarding Wizard modal */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onChildCreated={async (newId) => {
          await reloadData()
        }}
      />
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Olá, {guardianName}! 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-0.5">
            Quem vai jogar e aprender hoje no CogniKids?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/app/wardrobe">
            <Button
              variant="outline"
              className="rounded-2xl border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs shadow-xs flex items-center gap-1.5"
            >
              <Shirt className="w-4 h-4 text-amber-600" />
              <span>Loja do Tico</span>
            </Button>
          </Link>

          <Link to="/app/themes-guide">
            <Button
              variant="outline"
              className="rounded-2xl border-orange-200 text-orange-700 hover:bg-orange-50 font-bold text-xs"
            >
              📖 Guia de Temas
            </Button>
          </Link>

          <Link to="/app/community">
            <Button
              variant="outline"
              className="rounded-2xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs"
            >
              🤝 Convites & Escola
            </Button>
          </Link>

          <Button
            onClick={() => setShowOnboarding(true)}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20 text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Adicionar criança
          </Button>
        </div>
      </div>

      {/* Children Grid */}
      {childrenList.length === 0 && !isLoading ? (
        /* Empty State */
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-orange-100 shadow-sm text-center flex flex-col items-center">
          <TicoMascot size="lg" mood="talking" />
          <h2 className="text-xl font-bold text-slate-800 mt-4">
            Vamos criar o primeiro perfil da sua criança!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
            Cadastre o nome e a idade para personalizarmos os jogos com reconhecimento de voz e
            fases certinhas para o cérebro dela.
          </p>
          <Button
            onClick={() => setShowOnboarding(true)}
            size="lg"
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 px-6"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Criar perfil com o Tico
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {childrenList.map((child) => {
            const ageText = formatChildAge(child.birth_date)
            const kidProg = childrenProgress[child.id] || {}
            const avatarUrl = getChildAvatarUrl(child)

            return (
              <div
                key={child.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Child Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md overflow-hidden group-hover:scale-105 group-hover:rotate-3 transition-transform"
                      style={{ backgroundColor: child.favorite_color || '#FF7A45' }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={child.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        child.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-lg font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                          {child.name}
                        </h3>
                        <BilingualBadge child={child} size="sm" />
                      </div>
                      <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 mt-1">
                        {ageText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini Brain Flower Radar */}
                <div className="my-5 flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl p-3 border border-slate-100">
                  <BrainFlower
                    progressMap={kidProg}
                    size={140}
                    showLabels={false}
                    onSelectModule={() => handlePlayClick(child)}
                  />
                  <span className="text-[11px] font-bold text-slate-400 mt-1">
                    Cérebro em flor • 5 áreas
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {/* Coins & Wardrobe Shortcut Strip for this child */}
                  <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 rounded-2xl text-xs">
                    <div className="flex items-center gap-1.5 font-black text-amber-950">
                      <Coins className="w-4 h-4 fill-amber-400 text-amber-600" />
                      <span>{childrenCoins[child.id] ?? 60} moedas</span>
                    </div>
                    <Link
                      to="/app/wardrobe"
                      onClick={() => {
                        localStorage.setItem('cognikids_selected_child_id', child.id)
                      }}
                      className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 hover:underline text-[11px]"
                    >
                      <Shirt className="w-3.5 h-3.5" />
                      <span>Vestir Tico</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleDailySessionClick(child)}
                      className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-4 h-4 fill-current" />
                      <span>Sessão Diária</span>
                    </Button>
                    <Button
                      onClick={() => handlePlayClick(child)}
                      variant="outline"
                      className="h-11 px-3 rounded-2xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      Jogos
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                    <Link
                      to={`/app/child/${child.id}`}
                      className="hover:text-orange-600 flex items-center gap-1 transition-colors"
                    >
                      <span>Cérebro em Flor</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/app/history/${child.id}`}
                        className="hover:text-orange-600 flex items-center gap-1 transition-colors text-slate-400 hover:text-orange-600"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Histórico</span>
                      </Link>
                      <Link
                        to={`/app/reports/${child.id}`}
                        className="hover:text-orange-600 flex items-center gap-1 transition-colors text-slate-400 hover:text-orange-600"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Relatório</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add Child Dashed Card */}
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="rounded-3xl border-2 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50/40 p-6 flex flex-col items-center justify-center text-center transition-all min-h-[280px] group"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-orange-100 text-slate-400 group-hover:text-orange-600 flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-bold text-base text-slate-700 group-hover:text-orange-600 transition-colors">
              Adicionar criança
            </h3>
            <p className="text-xs text-slate-400 max-w-[200px] mt-1">
              Cadastre outro filho com calibração guiada de idade
            </p>
          </button>
        </div>
      )}

      {/* Recent Activity Strip */}
      {recentSessions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <h2 className="text-base font-black text-slate-800">Atividades recentes</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">Últimas jogadas</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentSessions.map((s) => {
              const kid = childrenList.find((c) => c.id === s.child_id)
              const kidName = kid ? kid.name : 'Criança'
              const dateLabel = new Date(s.created).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div key={s.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                      🎮
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {kidName} • {s.game_title}
                      </p>
                      <p className="text-xs text-slate-400">{dateLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (s.stars || 1) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
