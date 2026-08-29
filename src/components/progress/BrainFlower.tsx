import React from 'react'
import { COGNIKIDS_MODULES } from '@/types/cognikids'

interface BrainFlowerProps {
  progressMap: Record<string, number> // moduleId -> mastery (0-100)
  size?: number
  onSelectModule?: (moduleId: string) => void
  showLabels?: boolean
}

export const BrainFlower: React.FC<BrainFlowerProps> = ({
  progressMap,
  size = 280,
  onSelectModule,
  showLabels = true,
}) => {
  // 5 petals spaced at 72 degrees (360/5)
  // 0: Fala & Linguagem (top) -> angle -90 deg
  // 1: Memória & Atenção -> angle -18 deg
  // 2: Lógica & Cognição -> angle 54 deg
  // 3: Motricidade -> angle 126 deg
  // 4: Socioemocional -> angle 198 deg
  const center = size / 2
  const radius = size * 0.32
  const petalRadius = size * 0.22

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-md"
      >
        <defs>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Petals */}
        {COGNIKIDS_MODULES.map((mod, index) => {
          const angleDeg = -90 + index * 72
          const angleRad = (angleDeg * Math.PI) / 180
          const px = center + radius * Math.cos(angleRad)
          const py = center + radius * Math.sin(angleRad)
          const mastery = progressMap[mod.id] || 40 // 0 to 100
          const scale = 0.65 + (mastery / 100) * 0.35 // 0.65 to 1.0

          return (
            <g
              key={mod.id}
              className="cursor-pointer group transition-transform duration-300"
              onClick={() => onSelectModule?.(mod.id)}
            >
              {/* Petal Outer Ring Background */}
              <circle
                cx={px}
                cy={py}
                r={petalRadius}
                fill={mod.lightColor}
                stroke={mod.color}
                strokeWidth="2.5"
                className="transition-all group-hover:scale-105"
              />

              {/* Petal Filled Progress Area */}
              <circle
                cx={px}
                cy={py}
                r={petalRadius * scale * 0.88}
                fill={mod.color}
                opacity={0.85}
                className="transition-all duration-500 group-hover:opacity-100"
              />

              {/* Module Icon and % */}
              <text
                x={px}
                y={py - 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.08}
                className="pointer-events-none"
              >
                {mod.icon}
              </text>
              <text
                x={px}
                y={py + size * 0.07}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.045}
                fontWeight="bold"
                fill="#FFFFFF"
                className="pointer-events-none drop-shadow-sm font-sans"
              >
                {mastery}%
              </text>
            </g>
          )
        })}

        {/* Center Golden Core */}
        <circle
          cx={center}
          cy={center}
          r={size * 0.16}
          fill="#FFFFFF"
          stroke="#FFB703"
          strokeWidth="4"
          filter="url(#softGlow)"
        />
        <circle cx={center} cy={center} r={size * 0.13} fill="#FFF8E7" />
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.08}
          className="pointer-events-none"
        >
          🌱
        </text>
        <text
          x={center}
          y={center + size * 0.06}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.04}
          fontWeight="bold"
          fill="#B45309"
          className="pointer-events-none uppercase tracking-wider"
        >
          Cérebro
        </text>
      </svg>

      {/* Legend below */}
      {showLabels && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-sm">
          {COGNIKIDS_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onSelectModule?.(mod.id)}
              className="flex items-center gap-1.5 p-1.5 rounded-xl text-left hover:bg-slate-100 transition-colors"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: mod.color }}
              />
              <span className="text-[11px] font-bold text-slate-700 truncate">{mod.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
