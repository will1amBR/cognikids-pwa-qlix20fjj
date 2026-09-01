import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  fetchChildById,
  fetchChildModuleProgress,
  fetchChildAchievements,
  syncAndEvaluateAchievements,
  getChildAvatarUrl,
} from '@/services/children'
import type { Child, ChildAchievement, BadgeDefinition } from '@/types/cognikids'
import { COGNIKIDS_MODULES, COGNIKIDS_BADGES, formatChildAge } from '@/types/cognikids'
import { BrainFlower } from '@/components/progress/BrainFlower'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { computeChildDevelopmentDiagnostic } from '@/lib/developmentDiagnostic'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Trophy,
  Star,
  Award,
  Lock,
  Flame,
  CheckCircle2,
  Play,
  Share2,
  School,
  Clock,
  History,
} from 'lucide-react'
import { BilingualBadge } from '@/components/mascot/BilingualBadge'
import { VocabReviewQueueCard } from '@/components/reminders/VocabReviewQueueCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSound } from '@/context/SoundContext'

export const ChildDashboardPage: React.FC = () => {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { playPop } = useSound()
  const { language, t } = useLanguage()

  const [child, setChild] = useState<Child | null>(null)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [achievements, setAchievements] = useState<ChildAchievement[]>([])
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<BadgeDefinition | null>(null)
  const [selectedBadgeUnlocked, setSelectedBadgeUnlocked] = useState<ChildAchievement | null>(null)
  const [showGamePicker, setShowGamePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'flower' | 'badges'>('flower')

  useEffect(() => {
    if (!childId) return
    const load = async () => {
      setIsLoading(true)
      const kid = await fetchChildById(childId)
      setChild(kid)

      if (kid) {
        const [progList, achList] = await Promise.all([
          fetchChildModuleProgress(kid.id),
          syncAndEvaluateAchievements(kid.id),
        ])

        const map: Record<string, number> = {}
        progList.forEach((p) => {
          map[p.module_id] = p.mastery_percentage
        })
        COGNIKIDS_MODULES.forEach((m) => {
          if (map[m.id] === undefined) {
            map[m.id] = 40
          }
        })
        setProgressMap(map)
        setAchievements(achList)
      }
      setIsLoading(false)
    }
    load()
  }, [childId])

  if (isLoading || !child) {
    return (
      <div className="py-20 flex justify-center">
        <TicoMascot size="lg" mood="talking" />
      </div>
    )
  }

  // Calculate overall assimilation average
  const moduleValues = Object.values(progressMap)
  const overallAssimilation = moduleValues.length
    ? Math.round(moduleValues.reduce((a, b) => a + b, 0) / moduleValues.length)
    : 50

  const unlockedBadgeKeys = new Set(achievements.map((a) => a.badge_key))
  const unlockedCount = COGNIKIDS_BADGES.filter((b) => unlockedBadgeKeys.has(b.key)).length
  const totalBadges = COGNIKIDS_BADGES.length

  const handleOpenBadgeDetails = (badge: BadgeDefinition) => {
    playPop()
    const unlocked = achievements.find((a) => a.badge_key === badge.key) || null
    setSelectedBadgeModal(badge)
    setSelectedBadgeUnlocked(unlocked)
  }

  const handleSelectActivity = (activityId: string) => {
    playPop()
    setShowGamePicker(false)
    navigate(`/app/game/${child.id}/${activityId}`)
  }

  const avatarUrl = getChildAvatarUrl(child)
  const diagnostic = computeChildDevelopmentDiagnostic(progressMap, language)

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md relative overflow-hidden">
        {/* Decorative background accent */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: child.favorite_color || '#FF7A45' }}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Child Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden shrink-0 ring-4 ring-orange-100"
              style={{ backgroundColor: child.favorite_color || '#FF7A45' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={child.name} className="w-full h-full object-cover" />
              ) : (
                child.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">{child.name}</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                  {formatChildAge(child.birth_date, language)}
                </span>
                <BilingualBadge child={child} showLanguages size="sm" />
                {child.daily_minutes && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>{child.daily_minutes} min/dia</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Jornada lúdica de desenvolvimento em 5 áreas essenciais com o mascote Tico.
              </p>
            </div>{' '}
          </div>

          {/* Medals Count + Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Medals Pill */}
            <div
              onClick={() => setActiveTab('badges')}
              className="flex items-center gap-3 bg-amber-50 hover:bg-amber-100/70 p-3 rounded-2xl border border-amber-200 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-2xl shadow-sm">
                <Award className="w-6 h-6 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase text-amber-700">Conquistas</p>
                <p className="text-sm font-black text-amber-950">
                  {unlockedCount} / {totalBadges} medalhas
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => {
                  playPop()
                  navigate(`/app/daily/${child.id}`)
                }}
                className="h-14 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2"
              >
                <Flame className="w-5 h-5 fill-current" />
                <span>Sessão Diária</span>
              </Button>

              <Button
                onClick={() => setShowGamePicker(true)}
                variant="outline"
                className="h-14 px-5 rounded-2xl border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-sm flex items-center gap-2"
              >
                <Gamepad2 className="w-5 h-5 text-orange-500" />
                <span>Todos os Jogos</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Status de Desenvolvimento: "Indo Bem" vs "Precisa Melhorar" */}
      <div
        className={`rounded-3xl p-6 border transition-all ${
          diagnostic.overallStatus === 'doing_well'
            ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-teal-50/50 border-emerald-200'
            : 'bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-50/50 border-amber-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm ${
                diagnostic.overallStatus === 'doing_well'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {diagnostic.overallStatus === 'doing_well' ? '🌟' : '🎯'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-800">
                  {diagnostic.statusLabel}
                </h2>
                <span
                  className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${
                    diagnostic.overallStatus === 'doing_well'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {diagnostic.overallScore}% de Assimilação Geral
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                {diagnostic.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/app/history/${child.id}`}>
              <Button
                variant="outline"
                className="rounded-2xl border-orange-200 text-orange-700 hover:bg-orange-50 text-xs font-bold shrink-0 flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                <span>Histórico por Idioma</span>
              </Button>
            </Link>
            <Link to={`/app/reports/${child.id}`}>
              <Button
                variant="outline"
                className="rounded-2xl border-slate-300 hover:bg-white text-xs font-bold shrink-0"
              >
                Relatório de Evolução
              </Button>
            </Link>
          </div>
        </div>

        {/* Diagnóstico e Como Subir de Nível por Área */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-slate-200/60">
          {diagnostic.areas.map((area) => (
            <div
              key={area.moduleId}
              className={`p-4 rounded-2xl border bg-white/95 shadow-xs flex flex-col justify-between ${
                area.status === 'doing_well' ? 'border-emerald-200' : 'border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>{area.statusIcon}</span>
                    <span>{area.moduleName}</span>
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      area.status === 'doing_well'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {area.score}%
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">{area.summary}</p>

                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    💡 Reforço em casa:
                  </p>
                  <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                    {area.levelUpTips.homeReinforcement}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {area.status === 'doing_well' ? '✓ No ritmo esperado' : '⚠️ Foco de estímulo'}
                </span>
                <button
                  onClick={() => {
                    const mod = COGNIKIDS_MODULES.find((m) => m.id === area.moduleId)
                    if (mod && mod.activities[0]) {
                      handleSelectActivity(mod.activities[0].id)
                    }
                  }}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Jogar agora →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Tabs: Cérebro em Flor & Módulos vs Medalhas & Conquistas */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="bg-slate-200/70 p-1.5 rounded-2xl h-13 mb-6 w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger
            value="flower"
            className="rounded-xl font-extrabold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
          >
            🌸 Cérebro em Flor & Módulos
          </TabsTrigger>
          <TabsTrigger
            value="badges"
            className="rounded-xl font-extrabold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm flex items-center gap-1.5 justify-center"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Medalhas ({unlockedCount})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Cérebro em Flor & Modules */}
        <TabsContent value="flower" className="space-y-6">
          {/* Fila de Revisão de Vocabulário da Criança */}
          <VocabReviewQueueCard
            child={child}
            compact
            onSelectWordToPractice={(word, lang) => {
              navigate(`/app/game/${child.id}/fazenda_falante`)
            }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Flower Chart */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-800">Cérebro em Flor</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6 max-w-xs">
                Cada pétala cresce conforme {child.name} assimila novas palavras, reflexos e
                padrões.
              </p>

              <BrainFlower
                progressMap={progressMap}
                size={240}
                onSelectModule={(modId) => {
                  const mod = COGNIKIDS_MODULES.find((m) => m.id === modId)
                  if (mod && mod.activities[0]) {
                    handleSelectActivity(mod.activities[0].id)
                  }
                }}
              />
            </div>

            {/* 5 Development Modules Cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">Módulos de Aprendizagem</h2>
                <span className="text-xs font-semibold text-slate-400">Clique para jogar</span>
              </div>

              <div className="space-y-3">
                {COGNIKIDS_MODULES.map((mod) => {
                  const mastery = progressMap[mod.id] || 40
                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: mod.lightColor }}
                          >
                            {mod.icon}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-base text-slate-800">{mod.title}</h3>
                              <span
                                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: mod.color }}
                              >
                                {mastery}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {mod.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Activities inside this module */}
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mod.activities.map((act) => (
                          <button
                            key={act.id}
                            onClick={() => handleSelectActivity(act.id)}
                            className="p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200/60 hover:border-orange-200 transition-colors flex items-center justify-between text-left group/btn"
                          >
                            <div className="truncate mr-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-xs font-black text-slate-800 group-hover/btn:text-orange-600 truncate">
                                  {act.title}
                                </span>
                                {act.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full shrink-0">
                                    {act.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{act.ageRange}</p>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/btn:text-orange-600 group-hover/btn:bg-orange-500 group-hover/btn:text-white transition-colors shrink-0">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Medalhas & Conquistas por Área */}
        <TabsContent value="badges" className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Galeria de Medalhas por Área</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conquistas que motivam o progresso nas 5 áreas do desenvolvimento infantil.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>
                  {unlockedCount} de {totalBadges} conquistadas!
                </span>
              </div>
            </div>

            {/* Badges grouped by 5 modules */}
            <div className="mt-6 space-y-8">
              {COGNIKIDS_MODULES.map((mod) => {
                const moduleBadges = COGNIKIDS_BADGES.filter((b) => b.moduleId === mod.id)
                return (
                  <div key={mod.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mod.icon}</span>
                      <h3 className="text-sm font-black text-slate-800">{mod.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        • {mod.subtitle}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {moduleBadges.map((b) => {
                        const isUnlocked = unlockedBadgeKeys.has(b.key)
                        const unlockedData = achievements.find((a) => a.badge_key === b.key)

                        return (
                          <div
                            key={b.key}
                            onClick={() => handleOpenBadgeDetails(b)}
                            className={`p-4 rounded-3xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex items-start gap-3.5 relative overflow-hidden ${
                              isUnlocked
                                ? 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/50 border-amber-300 shadow-sm hover:shadow-md'
                                : 'bg-slate-50/80 border-slate-200/80 opacity-70 hover:opacity-90'
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${
                                isUnlocked
                                  ? 'bg-amber-400 text-white shadow-amber-200 ring-2 ring-amber-300'
                                  : 'bg-slate-200 text-slate-400 grayscale'
                              }`}
                            >
                              {isUnlocked ? b.icon : <Lock className="w-5 h-5 text-slate-400" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4
                                  className={`text-xs font-black truncate ${
                                    isUnlocked ? 'text-slate-800' : 'text-slate-500'
                                  }`}
                                >
                                  {b.title}
                                </h4>
                                {isUnlocked && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                                    Ganha
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {isUnlocked ? b.description : b.requirementText}
                              </p>
                              {isUnlocked && unlockedData?.unlocked_at && (
                                <p className="text-[9px] font-semibold text-amber-700 mt-1">
                                  Conquistada em{' '}
                                  {new Date(unlockedData.unlocked_at).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Badge Details Dialog */}
      <Dialog
        open={Boolean(selectedBadgeModal)}
        onOpenChange={(open) => !open && setSelectedBadgeModal(null)}
      >
        <DialogContent className="rounded-3xl max-w-sm p-6 text-center">
          {selectedBadgeModal && (
            <div>
              <div className="flex justify-center mb-3">
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg ${
                    selectedBadgeUnlocked
                      ? 'bg-amber-400 text-white ring-4 ring-amber-200'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {selectedBadgeUnlocked ? (
                    selectedBadgeModal.icon
                  ) : (
                    <Lock className="w-8 h-8 text-slate-400" />
                  )}
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {selectedBadgeModal.tier.toUpperCase()}
              </span>

              <h3 className="text-xl font-black text-slate-800 mt-2">{selectedBadgeModal.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedBadgeModal.description}</p>

              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  {selectedBadgeUnlocked ? 'Status da Conquista' : 'Como Desbloquear'}
                </p>
                <p className="text-xs font-extrabold text-slate-800">
                  {selectedBadgeModal.requirementText}
                </p>
                {selectedBadgeUnlocked?.unlocked_at && (
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    ✓ Conquistada em{' '}
                    {new Date(selectedBadgeUnlocked.unlocked_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              <Button
                onClick={() => {
                  setSelectedBadgeModal(null)
                  const mod = COGNIKIDS_MODULES.find((m) => m.id === selectedBadgeModal.moduleId)
                  if (mod && mod.activities[0]) {
                    handleSelectActivity(mod.activities[0].id)
                  }
                }}
                className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold mt-5"
              >
                Jogar nesta área
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Game Picker Modal */}
      <Dialog open={showGamePicker} onOpenChange={setShowGamePicker}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader>
            <div className="flex justify-center mb-1">
              <TicoMascot size="sm" mood="talking" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-800">
              Escolha uma atividade para {child.name}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Jogos adaptados com reconhecimento de fala e estímulo cognitivo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-1">
            {COGNIKIDS_MODULES.flatMap((m) =>
              m.activities.map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleSelectActivity(act.id)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 transition-all flex items-center gap-3 text-left group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: m.lightColor }}
                  >
                    {m.icon}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-orange-600 truncate">
                        {act.title}
                      </p>
                      {act.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded-full shrink-0">
                          {act.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {m.title} • {act.ageRange}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors shrink-0" />
                </button>
              )),
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
