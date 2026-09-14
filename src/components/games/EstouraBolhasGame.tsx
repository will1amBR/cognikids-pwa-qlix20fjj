import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { DINOSAURS, FRUITS, FARM_ANIMALS } from './farmAnimalsData'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  color: string
  popped: boolean
  item: string
}

const BUBBLE_ITEMS = [
  '🦖', // T-Rex
  '🦕', // Brachio
  '🍌', // Banana
  '🍓', // Strawberry
  '🦁', // Lion
  '⭐', // Star
  '🍎', // Apple
  '🎈', // Balloon
  '🍇', // Grape
]
const BUBBLE_COLORS = ['#06D6A0', '#4EA8DE', '#FF7A45', '#FFB703', '#E63946', '#8B5CF6']

export const EstouraBolhasGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory } = useSound()

  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [poppedCount, setPoppedCount] = useState(0)
  const totalBubbles = 8
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // Generate floating bubbles
    const initial: Bubble[] = Array.from({ length: totalBubbles }).map((_, idx) => ({
      id: idx,
      x: 10 + (idx % 4) * 22 + (Math.random() * 8 - 4),
      y: 15 + Math.floor(idx / 4) * 38 + (Math.random() * 8 - 4),
      size: 68 + Math.floor(Math.random() * 20),
      color: BUBBLE_COLORS[idx % BUBBLE_COLORS.length],
      popped: false,
      item: BUBBLE_ITEMS[idx % BUBBLE_ITEMS.length],
    }))
    setBubbles(initial)
    speechService.speak(
      'Toque rápido nas bolhas para estourar e descobrir dinos, frutas e estrelas!',
    )
  }, [])

  const handlePop = (bubbleId: number) => {
    playPop()
    setBubbles((prev) => prev.map((b) => (b.id === bubbleId ? { ...b, popped: true } : b)))
    const newCount = poppedCount + 1
    setPoppedCount(newCount)
    playStarReward(2)

    if (newCount >= totalBubbles) {
      finishGame()
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    speechService.speak('Você estourou todas as bolhas! Coordenação nota 10!')
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'motor',
      game_id: 'estoura_bolhas',
      game_title: 'Estoura Bolhas com Dinos',
      stars: 3,
      score: 100,
      accuracy: 100,
      rounds_completed: totalBubbles,
      total_rounds: totalBubbles,
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Estoura Bolhas"
        moduleColor="#06D6A0"
        currentRound={totalBubbles}
        totalRounds={totalBubbles}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-emerald-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Reflexo Rápido! ✋</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} tem uma coordenação motora afiada!
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

  const handleAdvanceManually = () => {
    finishGame()
  }

  return (
    <GameShell
      title="Estoura Bolhas"
      moduleColor="#06D6A0"
      currentRound={poppedCount}
      totalRounds={totalBubbles}
      exitPath={`/app/child/${child.id}`}
      ticoMood="talking"
      ticoInstruction="Toque com o dedinho nas bolhas para estourar!"
      onNextRound={handleAdvanceManually}
      nextLabel="Concluir"
    >
      <div className="relative w-full max-w-lg h-[420px] bg-sky-50/50 rounded-3xl border-2 border-dashed border-emerald-200 overflow-hidden select-none">
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => !b.popped && handlePop(b.id)}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              backgroundColor: b.popped ? 'transparent' : b.color,
            }}
            className={`absolute rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform duration-300 active:scale-75 ${
              b.popped ? 'scale-125 opacity-70 pointer-events-none' : 'animate-bounce'
            }`}
          >
            {b.popped ? b.item : '🫧'}
          </button>
        ))}
      </div>
    </GameShell>
  )
}
