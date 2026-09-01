import React, { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GameSession, AppLanguage } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import { TrendingUp, Calendar, Info } from 'lucide-react'

interface LanguageEvolutionTimelineProps {
  sessions: GameSession[]
  selectedLanguage: string
  selectedPeriod: string
  className?: string
}

const LANGUAGE_COLORS: Record<
  string,
  { stroke: string; fill: string; dot: string; label: string }
> = {
  'pt-BR': {
    stroke: '#FF7A45',
    fill: 'rgba(255, 122, 69, 0.15)',
    dot: '#FF7A45',
    label: 'Português',
  },
  en: { stroke: '#0EA5E9', fill: 'rgba(14, 165, 233, 0.15)', dot: '#0EA5E9', label: 'Inglês' },
  es: { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)', dot: '#F59E0B', label: 'Espanhol' },
  de: { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.15)', dot: '#10B981', label: 'Alemão' },
  fr: { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.15)', dot: '#8B5CF6', label: 'Francês' },
}

interface DataPoint {
  id: string
  date: Date
  dateLabel: string
  timeLabel: string
  accuracy: number
  stars: number
  gameTitle: string
  language: string
}

export const LanguageEvolutionTimeline: React.FC<LanguageEvolutionTimelineProps> = ({
  sessions,
  selectedLanguage,
  selectedPeriod,
  className = '',
}) => {
  // Extract and sort chronological data points per language
  const timelineData = useMemo(() => {
    // Sort ascending for timeline (oldest to newest)
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
    )

    const pointsByLang: Record<string, DataPoint[]> = {
      'pt-BR': [],
      en: [],
      es: [],
      de: [],
      fr: [],
    }

    sorted.forEach((s) => {
      const lang = s.language || 'pt-BR'
      if (!pointsByLang[lang]) {
        pointsByLang[lang] = []
      }
      const d = new Date(s.created)
      const acc = s.accuracy || s.score || 80
      pointsByLang[lang].push({
        id: s.id,
        date: d,
        dateLabel: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        timeLabel: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        accuracy: acc,
        stars: s.stars || 3,
        gameTitle: s.game_title || 'Partida',
        language: lang,
      })
    })

    return pointsByLang
  }, [sessions])

  // Determine active languages to display based on filter
  const activeLanguages = useMemo(() => {
    if (selectedLanguage !== 'all') {
      return [selectedLanguage]
    }
    return Object.keys(timelineData).filter((lang) => (timelineData[lang] || []).length > 0)
  }, [selectedLanguage, timelineData])

  const hasAnyData = activeLanguages.some((lang) => (timelineData[lang] || []).length > 0)

  // SVG Chart Metrics
  const chartWidth = 720
  const chartHeight = 220
  const paddingX = 45
  const paddingY = 25
  const innerWidth = chartWidth - paddingX * 2
  const innerHeight = chartHeight - paddingY * 2

  // Compute overall min/max time bounds across active languages
  const allActivePoints = useMemo(() => {
    const list: DataPoint[] = []
    activeLanguages.forEach((l) => {
      if (timelineData[l]) {
        list.push(...timelineData[l])
      }
    })
    return list.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [activeLanguages, timelineData])

  const minTime = allActivePoints.length > 0 ? allActivePoints[0].date.getTime() : Date.now()
  const maxTime =
    allActivePoints.length > 1
      ? allActivePoints[allActivePoints.length - 1].date.getTime()
      : minTime + 1000

  const getX = (date: Date, index: number, total: number) => {
    if (maxTime === minTime || total <= 1) {
      return paddingX + (index + 1) * (innerWidth / (total + 1))
    }
    const t = date.getTime()
    return paddingX + ((t - minTime) / (maxTime - minTime)) * innerWidth
  }

  const getY = (accuracy: number) => {
    // 0% at bottom (chartHeight - paddingY), 100% at top (paddingY)
    const clamped = Math.max(0, Math.min(100, accuracy))
    return chartHeight - paddingY - (clamped / 100) * innerHeight
  }

  // Generate SVG Path for a language series
  const generateSeriesPath = (points: DataPoint[]) => {
    if (points.length === 0) return { linePath: '', areaPath: '', pointsWithCoords: [] }
    if (points.length === 1) {
      const cx = paddingX + innerWidth / 2
      const cy = getY(points[0].accuracy)
      return {
        linePath: `M ${cx - 10} ${cy} L ${cx + 10} ${cy}`,
        areaPath: `M ${cx - 10} ${chartHeight - paddingY} L ${cx - 10} ${cy} L ${cx + 10} ${cy} L ${cx + 10} ${chartHeight - paddingY} Z`,
        pointsWithCoords: [{ ...points[0], x: cx, y: cy }],
      }
    }

    const coords = points.map((p, idx) => ({
      ...p,
      x: getX(p.date, idx, points.length),
      y: getY(p.accuracy),
    }))

    let linePath = `M ${coords[0].x} ${coords[0].y}`
    for (let i = 1; i < coords.length; i++) {
      // Smooth curve with cubic beziers
      const prev = coords[i - 1]
      const curr = coords[i]
      const cp1x = prev.x + (curr.x - prev.x) / 2
      const cp1y = prev.y
      const cp2x = prev.x + (curr.x - prev.x) / 2
      const cp2y = curr.y
      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }

    const last = coords[coords.length - 1]
    const areaPath = `${linePath} L ${last.x} ${chartHeight - paddingY} L ${coords[0].x} ${chartHeight - paddingY} Z`

    return { linePath, areaPath, pointsWithCoords: coords }
  }

  return (
    <Card
      className={`rounded-3xl border border-slate-200/90 shadow-sm bg-white overflow-hidden ${className}`}
    >
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-orange-50/40 via-amber-50/20 to-sky-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shadow-xs">
              📈
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                <span>Evolução por Idioma ao Longo do Tempo</span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-white text-orange-700 border-orange-200 font-bold"
                >
                  {selectedPeriod === '7days'
                    ? 'Últimos 7 dias'
                    : selectedPeriod === '30days'
                      ? 'Últimos 30 dias'
                      : selectedPeriod === 'today'
                        ? 'Hoje'
                        : 'Período Completo'}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Taxa de assimilação e precisão (%) a cada partida jogada
              </CardDescription>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-0">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const conf = LANGUAGE_COLORS[lang.code] || LANGUAGE_COLORS['pt-BR']
              const count = (timelineData[lang.code] || []).length
              const isActive = activeLanguages.includes(lang.code) && count > 0

              if (!isActive && selectedLanguage !== 'all' && selectedLanguage !== lang.code)
                return null

              return (
                <div
                  key={lang.code}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                    isActive
                      ? 'bg-white border-slate-200 shadow-xs text-slate-800'
                      : 'bg-slate-50 border-slate-200/60 text-slate-400 opacity-60'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: conf.stroke }}
                  />
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {count}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {!hasAnyData ? (
          <div className="py-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-6">
            <div className="text-4xl mb-2">📊</div>
            <h4 className="text-sm font-bold text-slate-700">
              Sem histórico suficiente para o gráfico
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Assim que a criança jogar partidas no idioma selecionado, a curva de aprendizado e
              evolução será traçada aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* SVG Interactive Chart */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto min-w-[500px] select-none"
              >
                <defs>
                  {/* Linear Gradients for Area Fills */}
                  {Object.entries(LANGUAGE_COLORS).map(([code, conf]) => (
                    <linearGradient
                      key={code}
                      id={`grad_${code}`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={conf.stroke} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={conf.stroke} stopOpacity="0.01" />
                    </linearGradient>
                  ))}
                </defs>

                {/* Y-Axis Grid Lines & Labels */}
                {[100, 75, 50, 25, 0].map((lvl) => {
                  const y = getY(lvl)
                  return (
                    <g key={lvl} className="transition-all">
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray={lvl === 0 || lvl === 100 ? '0' : '4 4'}
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-semibold"
                      >
                        {lvl}%
                      </text>
                    </g>
                  )
                })}

                {/* Target Benchmark Band (70% - 100%) */}
                <rect
                  x={paddingX}
                  y={getY(100)}
                  width={innerWidth}
                  height={getY(70) - getY(100)}
                  fill="rgba(16, 185, 129, 0.04)"
                />

                {/* Draw Area Fills & Lines per active language */}
                {activeLanguages.map((lang) => {
                  const pts = timelineData[lang] || []
                  if (pts.length === 0) return null
                  const conf = LANGUAGE_COLORS[lang] || LANGUAGE_COLORS['pt-BR']
                  const { linePath, areaPath, pointsWithCoords } = generateSeriesPath(pts)

                  return (
                    <g key={`series_${lang}`} className="transition-all">
                      {/* Gradient Area Fill */}
                      <path d={areaPath} fill={`url(#grad_${lang})`} />

                      {/* Bold Line */}
                      <path
                        d={linePath}
                        fill="none"
                        stroke={conf.stroke}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Dots with Tooltip hover effects */}
                      {pointsWithCoords.map((pt) => {
                        const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === pt.language)
                        return (
                          <g key={pt.id} className="cursor-pointer group">
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="5"
                              fill="#FFFFFF"
                              stroke={conf.stroke}
                              strokeWidth="3"
                              className="transition-transform group-hover:scale-150"
                            />

                            {/* Native SVG Tooltip */}
                            <title>
                              {`${langInfo?.flag || '🌐'} ${conf.label}\nJogo: ${pt.gameTitle}\nData: ${pt.dateLabel} às ${pt.timeLabel}\nAssimilação: ${pt.accuracy}%\nEstrelas: ${pt.stars} ⭐`}
                            </title>
                          </g>
                        )
                      })}
                    </g>
                  )
                })}

                {/* X-Axis Date Ticks */}
                {allActivePoints.length > 0 && (
                  <g className="text-[10px] fill-slate-400 font-medium">
                    {/* First Date */}
                    <text x={paddingX} y={chartHeight - 6} textAnchor="start">
                      {allActivePoints[0].dateLabel}
                    </text>
                    {/* Middle Date if plenty */}
                    {allActivePoints.length > 2 && (
                      <text x={paddingX + innerWidth / 2} y={chartHeight - 6} textAnchor="middle">
                        {allActivePoints[Math.floor(allActivePoints.length / 2)].dateLabel}
                      </text>
                    )}
                    {/* Latest Date */}
                    <text x={chartWidth - paddingX} y={chartHeight - 6} textAnchor="end">
                      {allActivePoints[allActivePoints.length - 1].dateLabel}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Quick Helper Note */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>
                  Passe o cursor sobre os pontos para ver o jogo correspondente e o percentual de
                  acertos.
                </span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                Meta: 70%+
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
