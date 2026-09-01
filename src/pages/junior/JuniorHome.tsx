import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { BilingualBadge } from '@/components/mascot/BilingualBadge'
import { LanguageEvolutionTimeline } from '@/components/progress/LanguageEvolutionTimeline'
import { WeeklyWordsRanking } from '@/components/progress/WeeklyWordsRanking'
import {
  COGNIKIDS_JUNIOR_ACTIVITIES,
  JuniorActivityDefinition,
  Child,
  GameSession,
} from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import { fetchChildren, fetchChildSessions, getChildAvatarUrl } from '@/services/children'
import { computeWeeklyWordsRanking, WeeklyWordRankItem } from '@/services/reminders'
import { offlineSyncService } from '@/lib/offlineSync'
import {
  Sparkles,
  ArrowRight,
  Play,
  TrendingUp,
  Brain,
  BookOpen,
  Award,
  Users,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export const JuniorHome: React.FC = () => {
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [weeklyRanking, setWeeklyRanking] = useState<WeeklyWordRankItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const list = await fetchChildren()
      setChildren(list)

      // Find children in junior age (6-10 years => 72-120 months) or fallback to any
      const juniorKids = list.filter((c) => {
        if (c.birth_date) {
          const diffMonths =
            (new Date().getFullYear() - new Date(c.birth_date).getFullYear()) * 12 +
            (new Date().getMonth() - new Date(c.birth_date).getMonth())
          return diffMonths >= 72
        }
        return false
      })
      const active = juniorKids.length > 0 ? juniorKids[0] : list[0] || null
      setSelectedChild(active)

      if (active) {
        loadChildSessions(active.id)
      }
    } catch (err) {
      console.warn('Error loading junior home data', err)
    } finally {
      setLoading(false)
    }
  }

  const loadChildSessions = async (childId: string) => {
    try {
      const serverSessions = await fetchChildSessions(childId, 100)
      const pending = offlineSyncService.getPendingSessions().filter((p: any) => p.child_id === childId)

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

      const combined = [...formattedPending, ...serverSessions].sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
      )

      setSessions(combined)
      setWeeklyRanking(computeWeeklyWordsRanking(combined, 6))
    } catch (e) {
      console.warn('Error loading sessions for child', e)
    }
  }

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child)
    loadChildSessions(child.id)
  }

  const handleLaunchJuniorGame = (activity: JuniorActivityDefinition) => {
    if (!selectedChild) {
      navigate('/app/children/new')
      return
    }

    // Direct game routing based on activity ID
    switch (activity.id) {
      case 'junior_vocab_builder':
        navigate(`/junior/game/${selectedChild.id}/vocab`)
        break
      case 'junior_math_quest':
        navigate(`/junior/game/${selectedChild.id}/math`)
        break
      case 'junior_logic_matrix':
        navigate(`/junior/game/${selectedChild.id}/logic`)
        break
      case 'junior_dictation_voice':
        navigate(`/junior/game/${selectedChild.id}/dictation`)
        break
      case 'junior_memory_master':
      default:
        navigate(`/junior/game/${selectedChild.id}/logic`)
        break
    }
  }

  const getChildAgeMonths = (c: Child) => {
    if (!c.birth_date) return c.age_months || 0
    return Math.max(
      0,
      (new Date().getFullYear() - new Date(c.birth_date).getFullYear()) * 12 +
        (new Date().getMonth() - new Date(c.birth_date).getMonth()),
    )
  }

  const juniorKids = children.filter((c) => getChildAgeMonths(c) >= 72)
  const infantKids = children.filter((c) => getChildAgeMonths(c) < 72)

  return (
    <div className="space-y-8 pb-16">
      {/* Junior Hero Banner with Grown-Up Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs px-3 py-1 shadow-md uppercase tracking-wider">
                🚀 CogniKids Junior
              </Badge>
              <Badge
                variant="outline"
                className="text-indigo-200 border-indigo-400/40 text-xs font-semibold"
              >
                6 a 10 anos (Alfabetização & Raciocínio)
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Exploração Cognitiva Avançada
            </h1>

            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Desafios sob medida para o desenvolvimento escolar: vocabulário amplo nos 5 idiomas,
              ditado fonético, matemática ágil e dedução lógica com o Tico!
            </p>

            {/* Quick Switch back to Infant button */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/app')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl text-xs font-bold"
              >
                ← Ir para CogniKids Infantil (0-5 anos)
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/15 shrink-0 self-center md:self-auto">
            <TicoMascot emotion="happy" size="md" />
            <span className="text-xs font-black uppercase text-amber-300 mt-2">
              Tico Mentor Junior
            </span>
          </div>
        </div>
      </div>

      {/* Child Selector for Junior */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Criança Selecionada</span>
            </h3>
            <p className="text-xs text-slate-500">
              Escolha qual perfil está jogando as missões do CogniKids Junior
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/app/children/new')}
            className="rounded-2xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold self-start sm:self-auto"
          >
            + Cadastrar Criança (6-10 anos)
          </Button>
        </div>

        {/* Children Pills */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {children.map((k) => {
            const isSelected = selectedChild?.id === k.id
            const ageMonths = getChildAgeMonths(k)
            const ageYears = (ageMonths / 12).toFixed(1)
            const isJuniorAge = ageMonths >= 72

            return (
              <button
                key={k.id}
                onClick={() => handleSelectChild(k)}
                className={`flex items-center gap-2.5 p-2 pr-4 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Avatar className="w-9 h-9 border border-indigo-200">
                  <AvatarImage src={getChildAvatarUrl(k)} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">
                    {k.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-800">{k.name}</span>
                    {isJuniorAge ? (
                      <Badge className="bg-indigo-600 text-[9px] px-1.5 py-0">Junior</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-500">
                        Infantil
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {ageYears} anos ({ageMonths}m)
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Junior Activities Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Jogos & Atividades CogniKids Junior</span>
            </h2>
            <p className="text-xs text-slate-500">
              Exercícios estruturados para 6 a 10 anos em 5 idiomas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COGNIKIDS_JUNIOR_ACTIVITIES.map((act) => (
            <Card
              key={act.id}
              className="rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group bg-white"
            >
              <CardHeader className="p-5 pb-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                    style={{ backgroundColor: act.lightColor }}
                  >
                    {act.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {act.badge && (
                      <Badge
                        className="text-[10px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: act.color }}
                      >
                        {act.badge}
                      </Badge>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {act.pillarTitle}
                    </span>
                  </div>
                </div>

                <div>
                  <CardTitle className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {act.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {act.description}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {act.skillsWorked.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <Button
                  onClick={() => handleLaunchJuniorGame(act)}
                  className="w-full rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs h-10 shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Jogar Agora</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Multilingual Timeline Evolution & Words Ranking */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Progresso & Assimilação de {selectedChild?.name || 'Junior'}</span>
        </h3>

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
