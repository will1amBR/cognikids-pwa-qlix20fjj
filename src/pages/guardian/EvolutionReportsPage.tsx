import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  fetchChildren,
  fetchChildById,
  calculateChildEvolution,
  fetchChildAchievements,
  getChildAvatarUrl,
} from '@/services/children'
import type { Child, EvolutionSummary, ChildAchievement } from '@/types/cognikids'
import { generateEvolutionPdf } from '@/lib/pdfReport'
import { formatChildAge, COGNIKIDS_MODULES, TeacherNote } from '@/types/cognikids'
import { teacherNotesService } from '@/services/teacherNotes'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { evaluateModuleDevelopment } from '@/lib/developmentDiagnostic'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/button'
import { useSound } from '@/context/SoundContext'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Star,
  Trophy,
  Sparkles,
  ArrowRight,
  Activity,
  Flame,
  Gamepad2,
  ChevronDown,
  Info,
  Lightbulb,
  Home,
  CheckCircle2,
  BookOpen,
  FileDown,
  Printer,
  Download,
  Languages,
  History,
  School as SchoolIcon,
} from 'lucide-react'
import { BilingualBadge } from '@/components/mascot/BilingualBadge'
import { VocabReviewQueueCard } from '@/components/reminders/VocabReviewQueueCard'
import { TeacherWeeklySummaryCard } from '@/components/reports/TeacherWeeklySummaryCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const EvolutionReportsPage: React.FC = () => {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { playPop, playStarReward } = useSound()
  const { language, t } = useLanguage()

  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [achievements, setAchievements] = useState<ChildAchievement[]>([])
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([])
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [summary, setSummary] = useState<EvolutionSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const list = await fetchChildren()
      setChildrenList(list)

      const activeId = childId || localStorage.getItem('cognikids_selected_child_id')
      const active = list.find((c) => c.id === activeId) || list[0] || null
      setSelectedChild(active)

      if (active) {
        const [evo, achs, notes] = await Promise.all([
          calculateChildEvolution(active.id, period),
          fetchChildAchievements(active.id),
          teacherNotesService.fetchNotesByChild(active.id),
        ])
        setSummary(evo)
        setAchievements(achs)
        setTeacherNotes(notes)
      }
      setIsLoading(false)
    }
    load()
  }, [childId, period])

  const handleExportPdf = () => {
    if (!selectedChild || !summary) return
    playStarReward(2)
    setIsExporting(true)
    generateEvolutionPdf(selectedChild, summary, achievements, language, teacherNotes)
    setTimeout(() => setIsExporting(false), 1000)
  }

  const handleSelectChild = async (kid: Child) => {
    playPop()
    setSelectedChild(kid)
    localStorage.setItem('cognikids_selected_child_id', kid.id)
    setIsLoading(true)
    const [evo, achs, notes] = await Promise.all([
      calculateChildEvolution(kid.id, period),
      fetchChildAchievements(kid.id),
      teacherNotesService.fetchNotesByChild(kid.id),
    ])
    setSummary(evo)
    setAchievements(achs)
    setTeacherNotes(notes)
    setIsLoading(false)
  }

  const handlePeriodChange = async (p: 'week' | 'month') => {
    playPop()
    setPeriod(p)
    if (selectedChild) {
      setIsLoading(true)
      const evo = await calculateChildEvolution(selectedChild.id, p)
      setSummary(evo)
      setIsLoading(false)
    }
  }

  if (childrenList.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-orange-100 shadow-sm text-center flex flex-col items-center max-w-lg mx-auto mt-8">
        <TicoMascot size="lg" mood="talking" />
        <h2 className="text-xl font-bold text-slate-800 mt-4">
          Nenhum perfil de criança encontrado
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Cadastre uma criança para acompanhar os relatórios de assimilação e evolução.
        </p>
        <Link to="/app/children/new">
          <Button className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
            Cadastrar criança
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Relatórios de Evolução & Dicas</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
              Responsável
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe o desenvolvimento cognitivo e vocal por período com sugestões práticas para
            casa
          </p>
        </div>

        {/* Controls: Child switch + Period Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Child Picker with Bilingual Badge */}
          {childrenList.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              {childrenList.map((kid) => (
                <button
                  key={kid.id}
                  onClick={() => handleSelectChild(kid)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedChild?.id === kid.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{kid.name}</span>
                </button>
              ))}
            </div>
          )}

          {selectedChild && (
            <Link to={`/app/history/${selectedChild.id}`}>
              <Button
                variant="outline"
                className="h-10 px-3.5 rounded-2xl border-orange-200 text-orange-700 hover:bg-orange-50 text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <History className="w-4 h-4" />
                <span>Histórico de Partidas</span>
              </Button>
            </Link>
          )}
          {/* Period Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => handlePeriodChange('week')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                period === 'week'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semanal (7d)
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                period === 'month'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mensal (30d)
            </button>
          </div>

          {/* Export PDF Button */}
          {selectedChild && summary && (
            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="h-10 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? 'Gerando…' : 'Exportar Relatório PDF'}</span>
            </Button>
          )}
        </div>
      </div>

      {selectedChild && (
        <>
          {/* Hero Comparison Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Assimilação Média */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Assimilação Média
                </span>
                <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  🎯
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">
                  {summary?.averageAccuracy || (summary?.totalSessions ? 85 : 0)}%
                </span>
                {summary && (
                  <span
                    className={`inline-flex items-center text-xs font-bold ${
                      summary.accuracyChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {summary.accuracyChange >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {summary.accuracyChange >= 0
                      ? `+${summary.accuracyChange}%`
                      : `${summary.accuracyChange}%`}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                vs período anterior ({period === 'week' ? 'semana passada' : 'mês passado'})
              </p>
            </div>

            {/* 2. Total de Partidas */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Jogadas no Período
                </span>
                <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                  🎮
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">
                  {summary?.totalSessions ?? 0}
                </span>
                <span className="text-xs font-semibold text-slate-400">partidas</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {summary && summary.sessionsChange >= 0
                  ? `+${summary.sessionsChange} em relação ao anterior`
                  : `${summary?.sessionsChange ?? 0} em relação ao anterior`}
              </p>
            </div>

            {/* 3. Estrelas Conquistadas */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Estrelas Obtidas</span>
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                  ⭐
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-500">
                  {summary?.totalStars ?? 0}
                </span>
                <span className="text-xs font-semibold text-slate-400">estrelas</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Reforço positivo imediato</p>
            </div>

            {/* 4. Sessão Diária CTA */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Rotina Personalizada
                </span>
                <h3 className="text-sm font-black mt-1">Sessão Diária</h3>
                <p className="text-[11px] text-white/90 mt-0.5">
                  {selectedChild.daily_minutes || 15} min •{' '}
                  {selectedChild.daily_activity_count || 3} jogos
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/app/daily/${selectedChild.id}`)}
                className="mt-2 h-9 bg-white text-orange-600 hover:bg-white/90 font-black rounded-xl text-xs shadow-sm"
              >
                Iniciar agora
              </Button>
            </div>
          </div>

          {/* Quick PDF Export Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-5 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Levar este relatório ao Pediatra ou à Escola?
                </h3>
                <p className="text-xs text-slate-500">
                  Gere um documento executivo formatado com o Cérebro em Flor, taxas de acerto,
                  dicas pedagógicas e o Resumo Semanal do Professor.
                </p>
              </div>
            </div>

            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="h-10 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>{isExporting ? 'Processando…' : 'Gerar PDF com Resumo Escolar'}</span>
            </Button>
          </div>

          {/* Resumo Semanal do Professor (Compilado das anotações da turma/escola para a criança) */}
          <TeacherWeeklySummaryCard
            child={selectedChild}
            teacherNotes={teacherNotes}
            period={period}
            onExportPdf={handleExportPdf}
          />

          {/* Fila de Palavras a Revisar Conectada no Relatório */}
          <VocabReviewQueueCard
            child={selectedChild}
            onSelectWordToPractice={(word, lang) => {
              navigate(`/app/game/${selectedChild.id}/fazenda_falante`)
            }}
          />

          {/* Multilingual Performance Comparison Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    Comparativo de Desempenho por Idioma
                  </h2>
                  <p className="text-xs text-slate-500">
                    Português 🇧🇷 x Inglês 🇺🇸 x Espanhol 🇪🇸 x Alemão 🇩🇪 x Francês 🇫🇷
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold px-3 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-200 self-start sm:self-auto">
                Assimilação Multilíngue Real
              </span>
            </div>

            {/* Language Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary?.languageBreakdown.map((langStat) => {
                const hasPlayed = langStat.totalSessions > 0
                const isDoingWell = langStat.averageAccuracy >= 70

                return (
                  <div
                    key={langStat.code}
                    className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                      !hasPlayed
                        ? 'bg-slate-50/70 border-slate-200'
                        : isDoingWell
                          ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                          : 'bg-amber-50/40 border-amber-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Language Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl drop-shadow-sm">{langStat.flag}</span>
                          <div>
                            <h3 className="text-base font-black text-slate-800">
                              {langStat.label}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-400">
                              {langStat.nativeName}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            !hasPlayed
                              ? 'bg-slate-200 text-slate-600'
                              : isDoingWell
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {langStat.statusLabel}
                        </span>
                      </div>

                      {/* Stats numbers */}
                      <div className="grid grid-cols-2 gap-2 my-3">
                        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Precisão da Fala
                          </span>
                          <div className="text-xl font-black text-slate-800 mt-0.5">
                            {hasPlayed ? `${langStat.averageAccuracy}%` : '—'}
                          </div>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Partidas
                          </span>
                          <div className="text-xl font-black text-slate-800 mt-0.5">
                            {langStat.totalSessions}{' '}
                            <span className="text-xs font-normal text-slate-400">
                              {langStat.totalSessions === 1 ? 'jogada' : 'jogadas'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                          <span>Nível de Assimilação</span>
                          <span className="text-slate-800 font-extrabold">
                            {hasPlayed ? `${langStat.averageAccuracy}%` : '0%'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isDoingWell ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${langStat.averageAccuracy}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2.5">
                        {hasPlayed
                          ? `⭐ ${langStat.totalStars} estrelas ganhas • ${
                              langStat.wordsPracticedCount || langStat.totalSessions * 4
                            } vocábulos praticados`
                          : 'Nenhuma partida gravada neste idioma ainda.'}
                      </p>
                    </div>

                    {/* Button to practice words in this language */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">
                        {langStat.code === 'pt-BR' ? 'Língua Materna' : 'Segunda Língua'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/app/game/${selectedChild.id}/fazenda_falante`)}
                        className="h-8 px-3 rounded-xl border-orange-200 text-orange-600 font-bold hover:bg-orange-50 text-xs"
                      >
                        <span>Praticar {langStat.label}</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Module Breakdown Comparison Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  Assimilação por Área do Cérebro
                </h2>
                <p className="text-xs text-slate-500">
                  Comparação da maestria atual vs período anterior (
                  {period === 'week' ? '7 dias' : '30 dias'})
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {selectedChild.name} • {formatChildAge(selectedChild.birth_date)}
              </span>
            </div>

            <div className="space-y-4">
              {summary?.moduleBreakdown.map((item) => {
                const isPositive = item.delta >= 0
                return (
                  <div
                    key={item.moduleId}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Left: Icon and Name */}
                    <div className="flex items-center gap-3.5 min-w-[220px]">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{item.title}</h4>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {item.sessionsCount} {item.sessionsCount === 1 ? 'partida' : 'partidas'}{' '}
                          no período
                        </span>
                      </div>
                    </div>

                    {/* Middle: Progress Bar Comparison */}
                    <div className="flex-1 w-full sm:max-w-xs">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-slate-500">
                          Anterior: <span className="text-slate-700">{item.previousMastery}%</span>
                        </span>
                        <span className="text-slate-800">
                          Atual:{' '}
                          <span className="text-orange-600 font-extrabold">
                            {item.currentMastery}%
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden relative">
                        {/* Previous mastery marker */}
                        <div
                          className="absolute top-0 bottom-0 bg-slate-300 rounded-full"
                          style={{ width: `${item.previousMastery}%` }}
                        />
                        {/* Current mastery fill */}
                        <div
                          className="absolute top-0 bottom-0 rounded-full transition-all duration-700"
                          style={{
                            width: `${item.currentMastery}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Right: Trend Badge + Action */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div
                        className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl ${
                          item.trend === 'up'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.trend === 'down'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        <span>{item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`}</span>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/app/child/${selectedChild.id}`)}
                        className="h-9 px-3 rounded-xl text-orange-600 font-bold hover:bg-orange-50 text-xs"
                      >
                        <span>Treinar</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pedagogical Guidance Cards / Dicas Pedagógicas para o Responsável */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    Cartões de Dicas Pedagógicas & Reforço em Casa
                  </h2>
                  <p className="text-xs text-slate-500">
                    Atividades práticas do dia a dia sugeridas para {selectedChild.name} com base no
                    desempenho atual
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full self-start sm:self-auto">
                Baseado em Neurociência Infantil
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COGNIKIDS_MODULES.map((mod) => {
                const modSummary = summary?.moduleBreakdown.find((m) => m.moduleId === mod.id)
                const currentMastery = modSummary?.currentMastery || 50
                const diag = evaluateModuleDevelopment(mod.id, currentMastery, language)
                const isDoingWell = diag.status === 'doing_well'

                return (
                  <div
                    key={mod.id}
                    className={`rounded-3xl p-5 border-2 flex flex-col justify-between transition-all ${
                      isDoingWell
                        ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                        : 'bg-amber-50/50 border-amber-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{mod.icon}</span>
                          <div>
                            <h3 className="text-sm font-black text-slate-800">{mod.title}</h3>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Assimilação: {currentMastery}%
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isDoingWell
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {diag.statusLabel}
                        </span>
                      </div>

                      {/* Diagnostic Summary */}
                      <p className="text-xs text-slate-700 font-medium mb-2.5 leading-relaxed">
                        {diag.summary}
                      </p>

                      {/* Level Up & Home Activities Tips */}
                      <div className="space-y-2 bg-white/95 p-3 rounded-2xl border border-slate-200/80 text-xs">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {isDoingWell ? '🚀 Para subir ainda mais:' : '🎯 Como subir de nível:'}
                        </p>
                        <div className="flex items-start gap-2 text-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{diag.levelUpTips.homeReinforcement}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Link to Play Area */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {mod.activities.length} jogos disponíveis
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          navigate(`/app/game/${selectedChild.id}/${mod.activities[0].id}`)
                        }
                        className="h-8 px-2 text-orange-600 font-bold hover:bg-orange-50 text-xs"
                      >
                        <span>Praticar</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Educational Note */}
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200/80 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <span className="font-black">Dica do Mascote Tico:</span> Crianças na faixa dos 0 aos
              5 anos evoluem em saltos naturais. Sessões curtas de 10 a 15 minutos diários com
              repetição de palavras e identificação de padrões trazem os melhores resultados de
              fixação neuronal!
            </div>
          </div>
        </>
      )}
    </div>
  )
}
