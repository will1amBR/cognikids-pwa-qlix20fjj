import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface ShapeTarget {
  name: string
  shape: 'circle' | 'square' | 'triangle' | 'star'
  color: string
  icon: string
}

const SHAPES: ShapeTarget[] = [
  { name: 'Círculo Vermelho', shape: 'circle', color: '#E63946', icon: '🔴' },
  { name: 'Quadrado Azul', shape: 'square', color: '#4EA8DE', icon: '🟦' },
  { name: 'Estrela Amarela', shape: 'star', color: '#FFB703', icon: '⭐' },
  { name: 'Coração Rosa', shape: 'triangle', color: '#FF7A45', icon: '❤️' },
]

export const CaixaDasFormasGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory } = useSound()

  const [roundIdx, setRoundIdx] = useState(0)
  const [selectedShape, setSelectedShape] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentShape = SHAPES[roundIdx] || SHAPES[0]

  useEffect(() => {
    if (isCompleted) return
    speechService.speak(`Toque na forma: ${currentShape.name}!`)
  }, [roundIdx, isCompleted])

  const handleSelect = (shape: ShapeTarget) => {
    playPop()
    setSelectedShape(shape.name)

    if (shape.name === currentShape.name) {
      playStarReward(3)
      speechService.speak(`Muito bem! Você encontrou o ${shape.name}!`)
      setTimeout(() => {
        setSelectedShape(null)
        if (roundIdx + 1 < SHAPES.length) {
          setRoundIdx((r) => r + 1)
        } else {
          finishGame()
        }
      }, 1400)
    } else {
      speechService.speak(`Esse é o ${shape.name}. Procure o ${currentShape.name}!`)
      setTimeout(() => setSelectedShape(null), 1200)
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'logic',
      game_id: 'caixa_das_formas',
      game_title: 'Caixa das Formas',
      stars: 3,
      score: 95,
      accuracy: 95,
      rounds_completed: 4,
      total_rounds: 4,
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Caixa das Formas"
        moduleColor="#FFB703"
        currentRound={4}
        totalRounds={4}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-amber-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Lógica Brilhante! 🧠</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Você identificou todas as formas e cores!
          </p>
          <Button
            onClick={() => navigate(`/app/child/${child.id}`)}
            className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
          >
            Voltar ao progresso
          </Button>
        </div>
      </GameShell>
    )
  }

  const handleAdvanceManually = () => {
    if (roundIdx + 1 < 4) {
      setRoundIdx((prev) => prev + 1)
      setSelectedShape(null)
    } else {
      finishGame()
    }
  }

  return (
    <GameShell
      title="Caixa das Formas"
      moduleColor="#FFB703"
      currentRound={roundIdx + 1}
      totalRounds={4}
      exitPath={`/app/child/${child.id}`}
      ticoMood="talking"
      ticoInstruction={`Onde está o ${currentShape.name}?`}
      onNextRound={handleAdvanceManually}
      nextLabel="Avançar"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">
            Encontre o <span style={{ color: currentShape.color }}>{currentShape.name}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {SHAPES.map((s) => (
            <button
              key={s.name}
              onClick={() => handleSelect(s)}
              className={`h-32 rounded-3xl p-4 bg-white border-4 flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                selectedShape === s.name && s.name === currentShape.name
                  ? 'border-emerald-500 bg-emerald-50 scale-105'
                  : 'border-slate-200 hover:border-amber-400'
              }`}
            >
              <span className="text-5xl">{s.icon}</span>
              <span className="font-bold text-xs sm:text-sm text-slate-700">{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  )
}
