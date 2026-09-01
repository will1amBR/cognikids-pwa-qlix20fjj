import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BrainFlower } from '@/components/progress/BrainFlower'
import { LanguageEvolutionTimeline } from '@/components/progress/LanguageEvolutionTimeline'
import { WeeklyWordsRanking } from '@/components/progress/WeeklyWordsRanking'
import { BilingualBadge } from '@/components/mascot/BilingualBadge'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import {
  fetchChildren,
  fetchChildSessions,
  fetchChildModuleProgress,
  getChildAvatarUrl,
} from '@/services/children'
import { computeWeeklyWordsRanking } from '@/services/reminders'
import { offlineSyncService } from '@/lib/offlineSync'
import { Child, GameSession, ModuleProgress, JUNIOR_MODULES } from '@/types/cognikids'
import {
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Users,
  ChevronLeft,
} from 'lucide-react'

export const JuniorProgressPage: React.FC = () => {
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const list = await fetchChildren()
      setChildren(list)

      const juniorKids = list.filter((c) => (c.age_months || 0) >= 72)
      const active = juniorKids.length > 0 ? juniorKids[0] : list[0] || null
      setSelectedChild(active)

      if (active) {
        await loadDetails(active.id)
      }
    } catch (err) {
      console.warn('Error loading junior progress:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadDetails = async (childId: string) => {
    try {
      const [fetchedSessions, fetchedProg] = await Promise.all([
        fetchChildSessions(childId, 100),
        fetchChildModuleProgress(childId),
      ])

      const pending = offlineSyncService.getPendingSessions().filter((p) => p.child_id === childId)
      const formattedPending: GameSession[] = pending.map((p, idx) => ({
        id: `pending_${idx}`,
        user_id: p.user_id,
        child_id: p.child_id,
        module_id: p.module_id,
        game_id: p.game_id,
        game_title: p.game_title,
        stars: p.stars,
        score: p.score,
        accuracy: p.accuracy,
        rounds_completed: p.rounds_completed,
        total_rounds: p.total_rounds,
        language: p.language || 'pt-BR',
        details: p.details,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }))

      const combinedSessions = [...formattedPending, ...fetchedSessions].sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
      )

      setSessions(combinedSessions)
      setModuleProgress(fetchedProg)
    } catch (err) {
      console.warn('Error loading progress details:', err)
    }
  }

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child)
    loadDetails(child.id)
  }

  // Filter junior sessions
  const juniorSessions = sessions.filter(
    (s) =>
      s.module_id.startsWith('junior_') ||
      s.game_id.startsWith('junior_') ||
      Boolean(s.details?.isJunior),
  )

  const totalJuniorStars = juniorSessions.reduce((acc, s) => acc + (s.stars || 0), 0)
  const avgAccuracy =
    juniorSessions.length > 0
      ? Math.round(
          juniorSessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / juniorSessions.length,
        )
      : 0

  const weeklyRanking = computeWeeklyWordsRanking(sessions, 6)

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/junior')}
                className="text-indigo-200 hover:text-white hover:bg-white/10 -ml-2 rounded-xl text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                CogniKids Junior
              </Button>
              <Badge className="bg-indigo-500/80 text-white border-0 text-[10px] uppercase font-black">
                Relatório de Evolução
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Painel de Desempenho Junior
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/80">
              Acompanhamento detalhado de vocabulário avançado, matemática, raciocínio lógico e
              escrita nos 5 idiomas para crianças de 6 a 10 anos.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-3xl border border-white/15">
            <TicoMascot emotion="happy" size="md" />
            <div className="text-left">
              <div className="text-xl font-black text-amber-300">{totalJuniorStars} ⭐</div>
              <p className="text-[10px] font-bold uppercase text-indigo-200">Estrelas Junior</p>
            </div>
          </div>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Perfil:</span>
          {children.map((c) => {
            const isSelected = selectedChild?.id === c.id
            const ageMonths = c.age_months || 0
            return (
              <button
                key={c.id}
                onClick={() => handleSelectChild(c)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Avatar className="w-5 h-5">
                  <AvatarImage src={getChildAvatarUrl(c)} />
                  <AvatarFallback className="text-[10px]">{c.name[0]}</AvatarFallback>
                </Avatar>
                <span>{c.name}</span>
                {ageMonths >= 72 && (
                  <span className="text-[9px] opacity-80 uppercase">
                    ({Math.floor(ageMonths / 12)}a)
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-slate-200 bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Missões Realizadas</span>
          <p className="text-2xl font-black text-slate-900">{juniorSessions.length}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">Total concluídas</span>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Precisão Média</span>
          <p className="text-2xl font-black text-emerald-600">{avgAccuracy}%</p>
          <span className="text-[10px] text-slate-500 font-semibold">Geral nos desafios</span>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Estrelas Junior</span>
          <p className="text-2xl font-black text-amber-500">{totalJuniorStars} ⭐</p>
          <span className="text-[10px] text-slate-500 font-semibold">Conquistas acumuladas</span>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Status Bilíngue</span>
          <div className="pt-1">
            <BilingualBadge child={selectedChild} size="sm" showLabel={true} />
          </div>
        </Card>
      </div>

      {/* Junior Pillars Progress */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Domínio por Módulo Junior</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JUNIOR_MODULES.map((mod) => {
            const modSessions = juniorSessions.filter((s) => s.module_id === mod.id)
            const count = modSessions.length
            const acc =
              count > 0
                ? Math.round(modSessions.reduce((a, s) => a + (s.accuracy || 0), 0) / count)
                : 0

            return (
              <Card
                key={mod.id}
                className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                      {mod.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">{mod.title}</h3>
                      <p className="text-xs text-slate-500">{mod.subtitle}</p>
                    </div>
                  </div>
                  <Badge
                    className="text-xs font-bold"
                    style={{ backgroundColor: mod.color, color: 'white' }}
                  >
                    {count} jogos
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Taxa de Acerto</span>
                    <span className="text-slate-800">{count > 0 ? `${acc}%` : 'Não iniciado'}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, acc)}%`, backgroundColor: mod.color }}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Multilingual Evolution & Words */}
      <div className="space-y-6">
        <LanguageEvolutionTimeline
          sessions={sessions}
          selectedLanguage="all"
          selectedPeriod="all"
        />

        <WeeklyWordsRanking
          ranking={weeklyRanking}
          childName={selectedChild?.name}
          onPracticeWord={() => {
            if (selectedChild) {
              navigate(`/junior/game/${selectedChild.id}/vocab`)
            }
          }}
        />
      </div>
    </div>
  )
}
