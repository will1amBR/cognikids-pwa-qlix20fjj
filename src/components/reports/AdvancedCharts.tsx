/**
 * Gráficos leves em SVG puro (sem dependências externas) para os
 * Relatórios Avançados do CogniKids — funcionam offline e imprimem bem.
 */
import React from 'react'

export interface SeriesDef {
  key: string
  label: string
  color: string
  values: (number | null)[]
}

interface LineChartProps {
  labels: string[]
  series: SeriesDef[]
  height?: number
  yMin?: number
  yMax?: number
}

/** Gráfico de linha multi-série com grid, pontos e legenda. */
export const SimpleLineChart: React.FC<LineChartProps> = ({
  labels,
  series,
  height = 220,
  yMin = 0,
  yMax = 100,
}) => {
  const W = 640
  const H = height
  const padL = 34
  const padR = 10
  const padT = 12
  const padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const n = labels.length
  const xAt = (i: number) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const yAt = (v: number) => padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH

  const gridLines = [0, 25, 50, 75, 100].filter((g) => g >= yMin && g <= yMax)

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Gráfico de evolução"
      >
        {gridLines.map((g) => (
          <g key={g}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yAt(g)}
              y2={yAt(g)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text x={padL - 6} y={yAt(g) + 3.5} fontSize="9" fill="#94a3b8" textAnchor="end">
              {g}
            </text>
          </g>
        ))}
        {labels.map((lb, i) => (
          <text
            key={i}
            x={xAt(i)}
            y={H - 8}
            fontSize="9"
            fill="#64748b"
            textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
          >
            {lb}
          </text>
        ))}
        {series.map((s) => {
          const pts = s.values
            .map((v, i) => (v == null ? null : { x: xAt(i), y: yAt(v) }))
            .filter((p): p is { x: number; y: number } => p != null)
          if (pts.length === 0) return null
          const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
          return (
            <g key={s.key}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill={s.color} />
              ))}
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2">
        {series.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

interface BarChartProps {
  labels: string[]
  values: number[]
  secondary?: number[]
  color?: string
  secondaryColor?: string
  height?: number
  valueSuffix?: string
  secondarySuffix?: string
}

/** Gráfico de barras duplas (partidas + minutos) por semana. */
export const SimpleBarChart: React.FC<BarChartProps> = ({
  labels,
  values,
  secondary,
  color = '#f97316',
  secondaryColor = '#6366f1',
  height = 200,
  valueSuffix = '',
  secondarySuffix = '',
}) => {
  const W = 640
  const H = height
  const padL = 30
  const padR = 10
  const padT = 14
  const padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const n = labels.length
  const maxVal = Math.max(1, ...values, ...(secondary || [0]))
  const slot = innerW / Math.max(1, n)
  const barW = secondary ? Math.min(18, slot / 2.6) : Math.min(26, slot / 1.8)

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Gráfico de partidas por semana"
      >
        <line
          x1={padL}
          x2={W - padR}
          y1={H - padB}
          y2={H - padB}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        {labels.map((lb, i) => {
          const cx = padL + slot * i + slot / 2
          const h1 = (values[i] / maxVal) * innerH
          const x1 = secondary ? cx - barW - 1.5 : cx - barW / 2
          const h2 = secondary ? ((secondary[i] || 0) / maxVal) * innerH : 0
          return (
            <g key={i}>
              <rect
                x={x1}
                y={H - padB - h1}
                width={barW}
                height={Math.max(1, h1)}
                rx={3}
                fill={color}
              />
              {secondary && (
                <rect
                  x={cx + 1.5}
                  y={H - padB - h2}
                  width={barW}
                  height={Math.max(1, h2)}
                  rx={3}
                  fill={secondaryColor}
                />
              )}
              <text x={cx} y={H - padB + 14} fontSize="9" fill="#64748b" textAnchor="middle">
                {lb}
              </text>
              <text
                x={cx}
                y={H - padB - Math.max(h1, h2) - 4}
                fontSize="9"
                fill="#334155"
                fontWeight="700"
                textAnchor="middle"
              >
                {values[i]}
                {valueSuffix}
                {secondary ? ` / ${secondary[i] || 0}${secondarySuffix}` : ''}
              </text>
            </g>
          )
        })}
      </svg>
      {secondary && (
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            Partidas
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: secondaryColor }}
            />
            Minutos
          </span>
        </div>
      )}
    </div>
  )
}

interface MultiBarRowProps {
  rows: { label: string; icon?: string; color?: string; value: number }[]
  max?: number
  suffix?: string
}

/** Barras horizontais para ranking de áreas (turma/instituição). */
export const HorizontalBarRanking: React.FC<MultiBarRowProps> = ({ rows, max, suffix = '%' }) => {
  const maxVal = max ?? Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={`${r.label}-${i}`} className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-black text-slate-500 w-5 text-right shrink-0">
            {i + 1}º
          </span>
          <span className="text-base shrink-0">{r.icon}</span>
          <span className="text-xs font-bold text-slate-700 w-28 sm:w-40 truncate" title={r.label}>
            {r.label}
          </span>
          <div className="flex-1 bg-slate-100 rounded-full h-3.5 overflow-hidden min-w-[60px]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(3, (r.value / maxVal) * 100)}%`,
                backgroundColor: r.color || '#94a3b8',
              }}
            />
          </div>
          <span className="text-xs font-black text-slate-800 w-11 text-right shrink-0 tabular-nums">
            {r.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  )
}
