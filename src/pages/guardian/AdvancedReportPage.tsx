/**
 * Relatório Avançado do Responsável — evolução semanal por área, insights
 * automáticos, alertas de queda, comparativo por idioma e faixa etária.
 * Tudo calculado localmente (offline-first) a partir do histórico da criança.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  fetchChildById,
  fetchChildSessions,
  fetchChildModuleProgress,
  fetchChildren,
} from '@/services/children'
import type { Child, GameSession, ModuleProgress } from '@/types/cognikids'
import { buildAdvancedReport, buildShareText, type AdvancedReport } from '@/lib/advancedReports'
import {
  HorizontalBarRanking,
  SimpleBarChart,
  SimpleLineChart,
  type SeriesDef,
} from '@/components/reports/AdvancedCharts'
import { generateEvolutionPdf } from '@/lib/pdfReport'

const WEEK_OPTIONS = [4, 8, 12]

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  below: { label: 'Abaixo do esperado', className: 'bg-rose-100 text-rose-800 border-rose-200' },
  expected: {
    label: 'No esperado',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  above: { label: 'Acima do esperado', className: 'bg-sky-100 text-sky-800 border-sky-200' },
}

export default function AdvancedReportPage() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [child, setChild] = useState<Child | null>(null)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [progress, setProgress] = useState<ModuleProgress[]>([])
  const [weeks, setWeeks] = useState(8)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const all = await fetchChildren()
        if (cancelled) return
        setChildren(all)
        const current =
          (childId && all.find((c) => c.id === childId)) ||
          (childId ? await fetchChildById(childId).catch(() => null) : null)
        if (!current || cancelled) {
          setChild(null)
          return
        }
        setChild(current)
        const [sess, prog] = await Promise.all([
          fetchChildSessions(current.id).catch(() => []),
          fetchChildModuleProgress(current.id).catch(() => []),
        ])
        if (!cancelled) {
          setSessions(sess)
          setProgress(prog)
        }
      } catch {
        if (!cancelled) {
          setChild(null)
          toast({
            title: 'Não foi possível carregar o relatório',
            description: 'Verifique a conexão — os dados ficarão disponíveis quando sincronizados.',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [childId, toast])

  const report: AdvancedReport | null = useMemo(() => {
    if (!child) return null
    try {
      return buildAdvancedReport(child, sessions, progress, weeks)
    } catch {
      return null
    }
  }, [child, sessions, progress, weeks])

  const areaSeries: SeriesDef[] = useMemo(
    () =>
      report
        ? report.areaTrends.map((a) => ({
            key: a.moduleId,
            label: a.title,
            color: a.color,
            values: a.series,
          }))
        : [],
    [report],
  )

  const langSeries: SeriesDef[] = useMemo(
    () =>
      report
        ? report.languageEvolution.map((l) => ({
            key: l.code,
            label: `${l.flag} ${l.label}`,
            color:
              l.code === 'pt-BR'
                ? '#f97316'
                : l.code === 'en'
                  ? '#3b82f6'
                  : l.code === 'es'
                    ? '#eab308'
                    : l.code === 'de'
                      ? '#8b5cf6'
                      : '#ec4899',
            values: l.series,
          }))
        : [],
    [report],
  )

  const childIndex = children.findIndex((c) => c.id === childId)
  const prevChild = childIndex > 0 ? children[childIndex - 1] : null
  const nextChild =
    childIndex >= 0 && childIndex < children.length - 1 ? children[childIndex + 1] : null

  const handleExportPdf = async () => {
    if (!child || !report) return
    setExporting(true)
    try {
      await generateEvolutionPdf(
        child,
        {
          totalSessions: report.totals.sessions,
          totalStars: report.totals.stars,
          moduleBreakdown: report.areaTrends.map((a) => ({
            moduleId: a.moduleId,
            title: a.title,
            icon: a.icon,
            color: a.color,
            currentMastery: a.current,
            previousMastery: Math.max(0, a.current - a.changePct),
            delta: a.changePct,
            trend: a.changePct > 0 ? 'up' : a.changePct < 0 ? 'down' : 'stable',
            sessionsCount: report.weeks.reduce((acc, w) => acc + w.sessions, 0),
          })),
        },
        user,
        {
          insights: report.insights,
          alerts: report.alerts,
          weekLabels: report.weeks.map((w) => w.label),
          areaSeries,
          languageEvolution: report.languageEvolution.map((l) => ({
            label: l.label,
            current: l.current,
            totalSessions: l.totalSessions,
          })),
        },
      )
      toast({ title: 'PDF avançado gerado com sucesso!' })
    } catch {
      toast({
        title: 'Falha ao gerar o PDF',
        description: 'Tente novamente — os dados continuam salvos no dispositivo.',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const handleShare = async () => {
    if (!child || !report) return
    const text = buildShareText(child, report)
    try {
      if (navigator.share) {
        await navigator.share({ title: `Relatório Avançado — ${child.name}`, text })
        return
      }
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(url, '_blank', 'noopener')
    } catch {
      await navigator.clipboard?.writeText(text).catch(() => undefined)
      toast({ title: 'Resumo copiado para compartilhar!' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Calculando relatório avançado…</p>
        </div>
      </div>
    )
  }

  if (!child || !report) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <span className="text-4xl">🧠</span>
            <p className="font-black text-slate-800">Nenhuma criança selecionada</p>
            <p className="text-sm text-slate-500">
              Escolha um perfil na lista de crianças para ver o relatório avançado.
            </p>
            <Button onClick={() => navigate('/app/children')} className="rounded-xl">
              Ver crianças
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const firstName = child.name.split(' ')[0]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
              Relatório Avançado
            </h1>
            <p className="text-xs text-slate-500 truncate">
              {child.name} • evolução semanal nas 5 áreas do cérebro
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-xl text-xs font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 max-w-[10rem]"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" />
            <span className="truncate">Compartilhar resumo</span>
          </Button>
          <Button
            size="sm"
            onClick={handleExportPdf}
            disabled={exporting}
            className="rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 max-w-[10rem]"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span className="truncate">{exporting ? 'Gerando…' : 'PDF avançado'}</span>
          </Button>
        </div>
      </div>

      {/* Controles: período + navegação entre crianças */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1 self-start">
          {WEEK_OPTIONS.map((w) => (
            <button
              key={w}
              onClick={() => setWeeks(w)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                weeks === w ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {w} semanas
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 self-start">
          <Button
            variant="outline"
            size="sm"
            disabled={!prevChild}
            onClick={() => prevChild && navigate(`/app/reports-advanced/${prevChild.id}`)}
            className="rounded-xl h-8 px-2.5 max-w-[9rem]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="truncate max-w-[6.5rem]">{prevChild?.name || '—'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!nextChild}
            onClick={() => nextChild && navigate(`/app/reports-advanced/${nextChild.id}`)}
            className="rounded-xl h-8 px-2.5 max-w-[9rem]"
          >
            <span className="truncate max-w-[6.5rem]">{nextChild?.name || '—'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Alertas de queda */}
      {report.alerts.length > 0 && (
        <div className="space-y-2">
          {report.alerts.map((al) => (
            <div
              key={al.moduleId}
              className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-amber-900">
                  {al.icon} {al.title} piorou {al.dropPct}% em duas semanas seguidas
                </p>
                <p className="text-xs text-amber-800 mt-0.5">{al.suggestion}.</p>
                <p className="text-xs text-amber-700 mt-0.5 italic">Dica: {al.tip}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/app/game/${child.id}/${al.gamePath}`)}
                className="rounded-xl text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0"
              >
                Jogar
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Insights automáticos */}
      <Card className="border-slate-200 shadow-sm rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Insights para você
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.insights.length === 0 && (
            <p className="text-sm text-slate-500">
              Ainda não há dados suficientes — jogue uma sessão para gerar os primeiros insights.
            </p>
          )}
          {report.insights.map((ins) => (
            <div
              key={ins.id}
              className={`flex items-start gap-2.5 rounded-2xl p-3 text-sm font-semibold ${
                ins.tone === 'positive'
                  ? 'bg-emerald-50 text-emerald-900'
                  : ins.tone === 'warning'
                    ? 'bg-amber-50 text-amber-900'
                    : 'bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-base leading-none mt-0.5">{ins.icon}</span>
              <span className="min-w-0">{ins.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Gráfico de linha: evolução por área */}
      <Card className="border-slate-200 shadow-sm rounded-3xl">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-black">
            Evolução da assimilação ({weeks} semanas)
          </CardTitle>
          <p className="text-xs text-slate-500">
            Uma linha por área cognitiva, média semanal de acertos.
          </p>
        </CardHeader>
        <CardContent>
          <SimpleLineChart labels={report.weeks.map((w) => w.label)} series={areaSeries} />
        </CardContent>
      </Card>

      {/* Gráfico de barras: partidas e minutos */}
      <Card className="border-slate-200 shadow-sm rounded-3xl">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-black">Partidas e tempo de jogo</CardTitle>
          <p className="text-xs text-slate-500">
            {firstName} jogou {report.totals.sessions}{' '}
            {report.totals.sessions === 1 ? 'partida' : 'partidas'} (~{report.totals.minutes} min)
            em {report.totals.activeDays}{' '}
            {report.totals.activeDays === 1 ? 'dia ativo' : 'dias ativos'} no período.
          </p>
        </CardHeader>
        <CardContent>
          <SimpleBarChart
            labels={report.weeks.map((w) => w.label)}
            values={report.weeks.map((w) => w.sessions)}
            secondary={report.weeks.map((w) => w.minutes)}
          />
        </CardContent>
      </Card>

      {/* Comparativo por idioma ao longo do tempo */}
      <Card className="border-slate-200 shadow-sm rounded-3xl">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-black">Evolução por idioma</CardTitle>
          <p className="text-xs text-slate-500">
            Assimilação semanal em cada idioma praticado por {firstName}.
          </p>
        </CardHeader>
        <CardContent>
          {langSeries.length > 0 ? (
            <SimpleLineChart labels={report.weeks.map((w) => w.label)} series={langSeries} />
          ) : (
            <p className="text-sm text-slate-500">Nenhuma partida por idioma registrada ainda.</p>
          )}
        </CardContent>
      </Card>

      {/* Comparação com faixa etária */}
      <Card className="border-slate-200 shadow-sm rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black">Comparação com a faixa etária</CardTitle>
          <p className="text-xs text-slate-500">
            Assimilação de {firstName} versus a expectativa para a idade (em meses).
          </p>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {report.ageComparison.map((item) => {
            const st = STATUS_LABEL[item.status]
            return (
              <div
                key={item.moduleId}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-700 truncate">{item.title}</span>
                    <span className="text-slate-900 shrink-0 ml-2">
                      {item.childMastery}%{' '}
                      <span className="text-slate-400 font-semibold">
                        / esperado {item.expectedMastery}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, item.childMastery)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-black shrink-0 ${st.className}`}
                >
                  {st.label}
                </Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Ranking de áreas (mais forte → mais fraca) */}
      <Card className="border-slate-200 shadow-sm rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black">Ranking de áreas</CardTitle>
          <p className="text-xs text-slate-500">Da mais forte à que mais precisa de reforço.</p>
        </CardHeader>
        <CardContent>
          <HorizontalBarRanking
            rows={[...report.areaTrends]
              .sort((a, b) => b.current - a.current)
              .map((a) => ({
                label: a.title,
                icon: a.icon,
                color: a.color,
                value: a.current,
              }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
