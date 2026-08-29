import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface TraceChallenge {
  id: string
  title: string
  letterOrNumber: string
  associatedWord: string
  associatedEmoji: string
  steps: { x: number; y: number; label: string }[]
}

const TRACE_ROUNDS: TraceChallenge[] = [
  {
    id: 'letra_a',
    title: 'Letra A do Avião',
    letterOrNumber: 'A',
    associatedWord: 'Avião',
    associatedEmoji: '✈️',
    steps: [
      { x: 50, y: 15, label: '1' },
      { x: 20, y: 85, label: '2' },
      { x: 80, y: 85, label: '3' },
      { x: 50, y: 55, label: '4' },
    ],
  },
  {
    id: 'letra_e',
    title: 'Letra E da Estrela',
    letterOrNumber: 'E',
    associatedWord: 'Estrela',
    associatedEmoji: '⭐',
    steps: [
      { x: 30, y: 15, label: '1' },
      { x: 30, y: 85, label: '2' },
      { x: 75, y: 15, label: '3' },
      { x: 65, y: 50, label: '4' },
      { x: 75, y: 85, label: '5' },
    ],
  },
  {
    id: 'numero_1',
    title: 'Número 1 do Sol',
    letterOrNumber: '1',
    associatedWord: 'Sol',
    associatedEmoji: '☀️',
    steps: [
      { x: 40, y: 30, label: '1' },
      { x: 55, y: 15, label: '2' },
      { x: 55, y: 85, label: '3' },
    ],
  },
]

export const TrilhaDasLetrasGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory } = useSound()

  const [roundIdx, setRoundIdx] = useState(0)
  const [visitedSteps, setVisitedSteps] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const currentChallenge = TRACE_ROUNDS[roundIdx] || TRACE_ROUNDS[0]

  useEffect(() => {
    if (isCompleted) return
    setVisitedSteps([])
    speechService.speak(
      `Vamos traçar a ${currentChallenge.title}! Toque nos pontos mágicos 1, 2, 3 com o dedinho!`,
    )
  }, [roundIdx, isCompleted])

  const handleTouchStep = (stepIdx: number) => {
    // Check if expected next step or already touched
    const expected = visitedSteps.length
    if (stepIdx === expected) {
      playPop()
      playStarReward(1)
      const nextVisited = [...visitedSteps, stepIdx]
      setVisitedSteps(nextVisited)

      if (nextVisited.length === currentChallenge.steps.length) {
        playStarReward(3)
        speechService.speak(
          `Sensacional! Você desenhou a letra ${currentChallenge.letterOrNumber} de ${currentChallenge.associatedWord}!`,
        )
        setTimeout(() => {
          if (roundIdx + 1 < TRACE_ROUNDS.length) {
            setRoundIdx((r) => r + 1)
          } else {
            finishGame()
          }
        }, 1500)
      }
    } else if (!visitedSteps.includes(stepIdx)) {
      speechService.speak(`Toque no ponto número ${expected + 1}!`)
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    speechService.speak('Parabéns! Sua coordenação com as letras e números foi impecável!')
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'motor',
      game_id: 'trilha_das_letras',
      game_title: 'Trilha das Letras & Formas',
      stars: 3,
      score: 100,
      accuracy: 100,
      rounds_completed: TRACE_ROUNDS.length,
      total_rounds: TRACE_ROUNDS.length,
      details: { theme: 'fine_motor_tracing', description: 'Traçado de letras e números com guia' },
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Trilha das Letras & Formas"
        moduleColor="#06D6A0"
        currentRound={TRACE_ROUNDS.length}
        totalRounds={TRACE_ROUNDS.length}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-emerald-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Mãozinha Mágica! ✍️</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} conectou todos os pontos e treinou a coordenação fina!
          </p>
          <Button
            onClick={() => navigate(`/app/child/${child.id}`)}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
          >
            Voltar ao progresso
          </Button>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Trilha das Letras & Formas"
      moduleColor="#06D6A0"
      currentRound={roundIdx + 1}
      totalRounds={TRACE_ROUNDS.length}
      exitPath={`/app/child/${child.id}`}
      ticoMood="talking"
      ticoInstruction={`Conecte os pontos da ${currentChallenge.title}!`}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-5">
        {/* Letter Card Header */}
        <div className="bg-white/90 px-5 py-3 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-3">
          <span className="text-3xl">{currentChallenge.associatedEmoji}</span>
          <div>
            <h3 className="text-base font-black text-slate-800">{currentChallenge.title}</h3>
            <p className="text-xs text-slate-500">
              {currentChallenge.letterOrNumber} de {currentChallenge.associatedWord}
            </p>
          </div>
        </div>

        {/* Tracing Canvas Area */}
        <div className="relative w-full h-[320px] sm:h-[360px] bg-emerald-50/70 rounded-3xl border-4 border-dashed border-emerald-300 shadow-inner flex items-center justify-center select-none overflow-hidden">
          {/* Big Ghost Character in background */}
          <span className="text-[140px] sm:text-[180px] font-black text-emerald-200/60 select-none pointer-events-none">
            {currentChallenge.letterOrNumber}
          </span>

          {/* Touch Point Buttons */}
          {currentChallenge.steps.map((st, idx) => {
            const isDone = visitedSteps.includes(idx)
            const isNext = visitedSteps.length === idx

            return (
              <button
                key={idx}
                onClick={() => handleTouchStep(idx)}
                style={{
                  left: `${st.x}%`,
                  top: `${st.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute w-12 h-12 rounded-full font-black text-base flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                  isDone
                    ? 'bg-emerald-500 text-white scale-110 ring-4 ring-emerald-200'
                    : isNext
                      ? 'bg-amber-400 text-amber-950 animate-bounce ring-4 ring-amber-200 scale-120'
                      : 'bg-white text-slate-700 border-2 border-slate-300 opacity-80'
                }`}
              >
                {isDone ? '✓' : st.label}
              </button>
            )
          })}
        </div>

        <p className="text-xs font-bold text-slate-500 text-center">
          Toque no ponto{' '}
          <span className="text-amber-600 font-black">{visitedSteps.length + 1}</span> para
          continuar o traço!
        </p>
      </div>
    </GameShell>
  )
}
