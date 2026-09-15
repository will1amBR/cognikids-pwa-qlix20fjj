import React, { useEffect, useState, useMemo } from 'react'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import { useSound } from '@/context/SoundContext'
import {
  RotateCcw,
  ArrowRight,
  Star,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  Award,
  Coins,
  Shirt,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ticoGamificationService } from '@/services/ticoGamification'

export interface CelebrationWordResult {
  word: string
  score?: number
  isRecognized?: boolean
  stars?: number
}

export interface CelebrationScreenProps {
  title?: string
  subtitle?: string
  childName: string
  score: number // 0-100
  accuracy?: number
  stars?: number // 1-3
  roundsCompleted?: number
  totalRounds?: number
  categoryName?: string
  practicedWords?: (string | CelebrationWordResult)[]
  onPlayAgain: () => void
  onExit: () => void
  exitLabel?: string
  isJunior?: boolean
  customPraise?: string
  childId?: string
  coinsEarned?: number
}

// Generate animated confetti particles
interface ConfettiParticle {
  id: number
  x: number // percentage
  y: number // percentage
  color: string
  size: number
  rotation: number
  delay: number
  duration: number
  shape: 'square' | 'circle' | 'ribbon'
}

const CONFETTI_COLORS = [
  '#FF7A45', // CogniKids Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#3B82F6', // Blue
]

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  title = 'Partida Concluída! 🎉',
  subtitle,
  childName,
  score,
  accuracy = score,
  stars: initialStars,
  roundsCompleted,
  totalRounds,
  categoryName,
  practicedWords = [],
  onPlayAgain,
  onExit,
  exitLabel = 'Voltar ao progresso',
  isJunior = false,
  customPraise,
  childId: propChildId,
  coinsEarned: propCoinsEarned,
}) => {
  const { playVictory, playStarPop, playConfettiWhoosh, playPop } = useSound()

  // Resolve child id from props or active stored child
  const effectiveChildId = useMemo(() => {
    if (propChildId) return propChildId
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cognikids_selected_child_id') || ''
    }
    return ''
  }, [propChildId])

  // Calculate actual stars (1-3)
  const targetStars = useMemo(() => {
    if (initialStars && initialStars >= 1 && initialStars <= 3) return initialStars
    if (accuracy >= 85) return 3
    if (accuracy >= 60) return 2
    return 1
  }, [initialStars, accuracy])

  // Coins awarded: base 10 + 5 per star + bonus for high accuracy
  const coinsReward = useMemo(() => {
    if (propCoinsEarned !== undefined) return propCoinsEarned
    let amt = 10 + targetStars * 5
    if (accuracy >= 95) amt += 5
    return amt
  }, [propCoinsEarned, targetStars, accuracy])

  // Award coins on mount once
  useEffect(() => {
    if (effectiveChildId && coinsReward > 0) {
      ticoGamificationService.awardCoins(
        effectiveChildId,
        coinsReward,
        `Partida concluída: ${title}`,
      )
    }
  }, [effectiveChildId, coinsReward, title])

  // Sequentially revealed stars state (0, 1, 2, 3)
  const [revealedStars, setRevealedStars] = useState<number>(0)
  const [showSummary, setShowSummary] = useState<boolean>(false)

  // Generate 45 confetti particles
  const particles: ConfettiParticle[] = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 30,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.8,
      duration: 2.2 + Math.random() * 1.5,
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'ribbon' : 'square',
    }))
  }, [])

  // Vary Tico's celebratory phrase depending on performance & profile
  const ticoPraise = useMemo(() => {
    if (customPraise) return customPraise

    if (isJunior) {
      if (targetStars === 3) {
        return `UAU, ${childName}! Desempenho espetacular com raciocínio afiado!`
      }
      if (targetStars === 2) {
        return `Excelente trabalho, ${childName}! Seu cérebro está cada vez mais forte!`
      }
      return `Muito bom treino, ${childName}! A prática constante leva à maestria!`
    }

    if (targetStars === 3) {
      return `Incrível, ${childName}! Você brilhou demais nesta atividade! ⭐⭐⭐`
    }
    if (targetStars === 2) {
      return `Muito bem, ${childName}! Seu cérebro está crescendo muito feliz!`
    }
    return `Parabéns pela dedicação, ${childName}! Vamos sempre em frente com alegria!`
  }, [customPraise, isJunior, targetStars, childName])

  // Play fanfare and reveal stars one by one with sparkling sounds
  useEffect(() => {
    // 1. Play grand fanfare & confetti whoosh immediately
    playVictory()
    setTimeout(() => {
      playConfettiWhoosh()
    }, 250)

    // 2. Reveal stars sequentially: 400ms, 900ms, 1400ms
    const starTimers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= targetStars; i++) {
      const t = setTimeout(
        () => {
          setRevealedStars(i)
          playStarPop(i)
        },
        450 + i * 450,
      )
      starTimers.push(t)
    }

    // 3. Reveal details summary panel
    const summaryTimer = setTimeout(
      () => {
        setShowSummary(true)
      },
      450 + targetStars * 450 + 200,
    )

    return () => {
      starTimers.forEach((t) => clearTimeout(t))
      clearTimeout(summaryTimer)
    }
  }, [playVictory, playConfettiWhoosh, playStarPop, targetStars])

  return (
    <div className="relative w-full max-w-lg mx-auto select-none overflow-hidden animate-fade-in my-auto py-4">
      {/* Confetti Animation Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-confetti"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.shape === 'ribbon' ? p.size * 0.4 : p.size}px`,
              height: `${p.shape === 'ribbon' ? p.size * 1.8 : p.size}px`,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '9999px' : '3px',
              transform: `rotate(${p.rotation}deg)`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-orange-200/90 shadow-2xl flex flex-col items-center text-center">
        {/* Mascot & Celebration Halo */}
        <div className="relative mb-3 flex flex-col items-center">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/30 via-orange-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse" />
          <TicoMascot size="lg" mood="celebrating" childId={effectiveChildId} />
          <div className="absolute -top-3 -right-3 text-3xl sm:text-4xl animate-bounce">
            {targetStars === 3 ? '🏆' : '🌟'}
          </div>
        </div>

        {/* Coins Reward Badge */}
        <div className="mb-2 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-black text-sm px-4 py-1.5 rounded-full shadow-md animate-bounce">
          <Coins className="w-4 h-4 fill-amber-300 text-amber-900" />
          <span>+{coinsReward} Moedas do Tico!</span>
          <div className="text-[10px] bg-amber-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold text-amber-900">
            Recompensa
          </div>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
          {subtitle || (
            <>
              {childName} concluiu {roundsCompleted || totalRounds || 5} rodadas{' '}
              {categoryName ? (
                <>
                  de <span className="font-bold text-orange-600">{categoryName}</span>
                </>
              ) : (
                'com muito capricho'
              )}
              !
            </>
          )}
        </p>

        {/* Tico Speech Bubble */}
        <div className="mt-3 mb-5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 px-4 py-2.5 rounded-2xl max-w-md w-full shadow-xs flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
          <p className="text-xs sm:text-sm font-black text-orange-950 italic">"{ticoPraise}"</p>
        </div>

        {/* Stars Revealed One by One with sequential animation */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-2 mb-6">
          {[1, 2, 3].map((starIdx) => {
            const isRevealed = starIdx <= revealedStars
            return (
              <div
                key={starIdx}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                  isRevealed
                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-white scale-110 rotate-3 shadow-lg shadow-amber-500/30 ring-4 ring-amber-200 animate-star-pop'
                    : 'bg-slate-100 text-slate-300 scale-95 opacity-50'
                }`}
              >
                <Star
                  className={`w-9 h-9 sm:w-11 sm:h-11 ${
                    isRevealed ? 'fill-white stroke-white drop-shadow-md' : 'fill-none'
                  }`}
                />
                {isRevealed && (
                  <span className="absolute -top-1 -right-1 text-xs animate-ping">✨</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Session Performance Breakdown Panel */}
        <div
          className={`w-full space-y-3 transition-all duration-500 ${
            showSummary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-orange-50/80 border border-orange-100 p-3.5 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                Pontuação
              </span>
              <p className="text-xl sm:text-2xl font-black text-orange-950 mt-0.5">
                {score} <span className="text-xs font-bold text-orange-600">pts</span>
              </p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-100 p-3.5 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Assimilação / Precisão
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5">{accuracy}%</p>
            </div>
          </div>

          {/* Quick wardrobe hint */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/30 flex items-center justify-center text-amber-700">
                <Shirt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-amber-950">Guarda-Roupa & Loja do Tico</p>
                <p className="text-[11px] text-amber-800">
                  Use suas moedas para vestir bonés, óculos e tênis no Tico!
                </p>
              </div>
            </div>
            <Link
              to="/app/wardrobe"
              onClick={() => playPop()}
              className="text-xs font-black text-amber-950 bg-amber-300 hover:bg-amber-400 px-3 py-1.5 rounded-xl shadow-xs shrink-0 transition-colors"
            >
              Ver Loja
            </Link>
          </div>

          {/* Practiced Words Pill List (if provided) */}
          {practicedWords.length > 0 && (
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 text-left">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                Itens praticados nesta partida ({practicedWords.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {practicedWords.map((item, idx) => {
                  const isObj = typeof item === 'object' && item !== null
                  const wordText = isObj ? String(item.word) : String(item)
                  const itemScore = isObj ? item.score : undefined
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs text-slate-700"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{wordText}</span>
                      {itemScore !== undefined && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({itemScore}%)
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action Buttons: Play Again & Return */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 w-full">
            <Button
              onClick={() => {
                playPop()
                onPlayAgain()
              }}
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-slate-300 font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Jogar de novo
            </Button>

            <Button
              onClick={() => {
                playPop()
                onExit()
              }}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{exitLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
