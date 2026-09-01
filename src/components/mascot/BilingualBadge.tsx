import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Child, AppLanguage } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import { getChildBilingualStatus } from '@/services/children'
import { Sparkles, Globe } from 'lucide-react'

interface BilingualBadgeProps {
  child?: Child | null
  showLanguages?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badge' | 'card' | 'inline'
  className?: string
}

export const BilingualBadge: React.FC<BilingualBadgeProps> = ({
  child,
  showLanguages = false,
  size = 'md',
  variant = 'badge',
  className = '',
}) => {
  const status = getChildBilingualStatus(child)

  if (!status.isBilingualOrMultilingual) {
    return null
  }

  const langFlags = status.languages
    .map((code) => {
      const found = SUPPORTED_LANGUAGES.find((l) => l.code === code)
      return found ? found.flag : '🌐'
    })
    .join(' ')

  const langNames = status.languages
    .map((code) => {
      const found = SUPPORTED_LANGUAGES.find((l) => l.code === code)
      return found ? `${found.flag} ${found.label}` : code
    })
    .join(', ')

  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-amber-900 bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 border border-amber-300/80 shadow-xs text-xs animate-pulse hover:scale-105 transition-transform cursor-default ${className}`}
            >
              <span className="text-sm">🌍</span>
              <span>{status.badgeTitle}</span>
              <span className="text-xs font-normal opacity-90">({langFlags})</span>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-slate-900 text-white p-2.5 text-xs rounded-xl shadow-xl border-amber-400">
            <p className="font-bold text-amber-300 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {status.badgeTitle}
            </p>
            <p>{status.badgeDescription}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-amber-300/70 p-3.5 shadow-sm hover:shadow-md transition-shadow ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-xl shadow-md border-2 border-white text-white shrink-0">
            🌍
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-amber-950 text-sm tracking-tight flex items-center gap-1">
                {status.badgeTitle}
              </h4>
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-1.5 py-0">
                {status.languagesCount} Idiomas
              </Badge>
            </div>
            <p className="text-xs text-amber-900/80 mt-0.5 leading-snug">
              Praticando <strong className="font-semibold">{langNames}</strong> de forma lúdica e
              natural.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Default 'badge'
  const sizeClasses = {
    sm: 'text-[11px] py-0.5 px-2 gap-1',
    md: 'text-xs py-1 px-3 gap-1.5',
    lg: 'text-sm py-1.5 px-4 gap-2',
  }[size]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-amber-950 font-black shadow-sm border border-amber-300/80 hover:scale-105 active:scale-95 transition-all cursor-default select-none ${sizeClasses} ${className}`}
          >
            <span className="text-base leading-none">🌍</span>
            <span>{status.badgeTitle}</span>
            {showLanguages && (
              <span className="text-[10px] bg-white/80 text-amber-950 font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                {langFlags}
              </span>
            )}
            <Sparkles className="w-3.5 h-3.5 text-amber-900/70" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-slate-900 text-white p-2.5 text-xs rounded-xl shadow-xl border-amber-400">
          <p className="font-bold text-amber-300 flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {status.badgeTitle}
          </p>
          <p>{status.badgeDescription}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
