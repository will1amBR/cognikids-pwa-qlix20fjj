import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface CardItem {
  id: string
  pairId: number
  emoji: string
  name: string
  isFlipped: boolean
  isMatched: boolean
}

const MEMORY_EMOJIS = [
  { emoji: '🐶', name: 'Cachorrinho' },
  { emoji: '🐱', name: 'Gatinho' },
  { emoji: '🦁', name: 'Leãozinho' },
  { emoji: '🐵', name: 'Macaco' },
]

export const ParDosAnimaisGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory } = useSound()

  const [cards, setCards] = useState<CardItem[]>([])
  const [flippedIds, setFlippedIds] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    // Generate 4 pairs = 8 cards (suitable for toddlers)
    const initialCards: CardItem[] = []
    MEMORY_EMOJIS.forEach((item, idx) => {
      initialCards.push({
        id: `c_${idx}_1`,
        pairId: idx,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      })
      initialCards.push({
        id: `c_${idx}_2`,
        pairId: idx,
        emoji: item.emoji,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      })
    })

    setCards(initialCards.sort(() => 0.5 - Math.random()))
    speechService.speak('Encontre as cartinhas com os bichinhos iguais!')
  }, [])

  const handleCardClick = (card: CardItem) => {
    if (card.isFlipped || card.isMatched || flippedIds.length >= 2) return
    playPop()

    const newCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c))
    setCards(newCards)

    const newFlipped = [...flippedIds, card.id]
    setFlippedIds(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      const firstCard = newCards.find((c) => c.id === newFlipped[0])!
      const secondCard = newCards.find((c) => c.id === newFlipped[1])!

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        playStarReward(3)
        speechService.speak(`Par de ${firstCard.name}! Muito bem!`)
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c)),
          )
          setFlippedIds([])

          // Check if all matched
          const remaining = newCards.filter((c) => !c.isMatched && c.pairId !== firstCard.pairId)
          if (remaining.length === 0) {
            finishGame()
          }
        }, 800)
      } else {
        // Not matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c)),
          )
          setFlippedIds([])
        }, 1100)
      }
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'memory',
      game_id: 'par_dos_animais',
      game_title: 'Par dos Bichinhos',
      stars: 3,
      score: 90,
      accuracy: 90,
      rounds_completed: 4,
      total_rounds: 4,
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Par dos Bichinhos"
        moduleColor="#4EA8DE"
        currentRound={4}
        totalRounds={4}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-sky-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Parabéns! Memória 10! 🧩</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Você achou todos os pares em {moves} jogadas!
          </p>
          <Button
            onClick={() => navigate(`/app/child/${child.id}`)}
            className="w-full h-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold"
          >
            Voltar ao progresso
          </Button>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Par dos Bichinhos"
      moduleColor="#4EA8DE"
      currentRound={cards.filter((c) => c.isMatched).length / 2}
      totalRounds={4}
      exitPath={`/app/child/${child.id}`}
      ticoMood="talking"
      ticoInstruction="Toque em duas cartas para encontrar o par igual!"
    >
      <div className="w-full max-w-md grid grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCardClick(c)}
            className={`h-24 sm:h-28 rounded-2xl border-4 flex items-center justify-center text-3xl sm:text-4xl shadow-md transition-all duration-300 ${
              c.isMatched
                ? 'bg-emerald-100 border-emerald-400 opacity-60 scale-95'
                : c.isFlipped
                  ? 'bg-white border-sky-400 scale-105'
                  : 'bg-gradient-to-br from-sky-400 to-indigo-500 border-white hover:scale-102'
            }`}
          >
            {c.isFlipped || c.isMatched ? c.emoji : '❓'}
          </button>
        ))}
      </div>
    </GameShell>
  )
}
