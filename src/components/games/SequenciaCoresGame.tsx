import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { COLORS, CategoryItem } from './farmAnimalsData'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface SequenceRound {
  sequence: CategoryItem[]
  target: CategoryItem
  options: CategoryItem[]
}

export const SequenciaCoresGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory, playAnimalSound } = useSound()

  const totalRounds = 3
  const colorPool = COLORS.slice(0, 6) // red, blue, yellow, green, purple, orange

  const [rounds, setRounds] = useState<SequenceRound[]>([])
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // Generate 3 simple alternating sequences (e.g. A - B - A - ?)
    const generated: SequenceRound[] = []
    for (let r = 0; r < totalRounds; r++) {
      const colA = colorPool[(r * 2) % colorPool.length]
      const colB = colorPool[(r * 2 + 1) % colorPool.length]

      // Pattern: colA, colB, colA, [colB]
      const sequence = [colA, colB, colA]
      const target = colB
      const distractors = colorPool.filter((c) => c.id !== target.id).slice(0, 2)
      const options = [target, ...distractors].sort(() => 0.5 - Math.random())

      generated.push({ sequence, target, options })
    }
    setRounds(generated)
    setCurrentRoundIdx(0)
  }, [])

  const currentRound = rounds[currentRoundIdx]

  useEffect(() => {
    if (isCompleted || !currentRound) return

    setSelectedId(null)
    setIsCorrect(null)

    const seqNames = currentRound.sequence.map((c) => c.name).join(', ')
    speechService.speak(
      `Olhe a sequência: ${seqNames}. Qual é a próxima cor no ponto de interrogação?`,
    )
  }, [currentRoundIdx, currentRound, isCompleted])

  const handleSelectOption = (col: CategoryItem) => {
    if (selectedId !== null || !currentRound) return
    playPop()
    setSelectedId(col.id)

    if (col.id === currentRound.target.id) {
      setIsCorrect(true)
      playStarReward(3)
      playAnimalSound(col.soundKey)
      speechService.speak(`Muito bem! A próxima cor é ${col.name}! 🎉`)

      setTimeout(() => {
        if (currentRoundIdx + 1 < totalRounds) {
          setCurrentRoundIdx((prev) => prev + 1)
        } else {
          finishGame()
        }
      }, 1500)
    } else {
      setIsCorrect(false)
      speechService.speak(`Não é ${col.name}. Olhe o padrão de cores novamente!`)
      setTimeout(() => {
        setSelectedId(null)
        setIsCorrect(null)
      }, 1300)
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    const finalScore = 95
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'logic',
      game_id: 'sequencia_cores',
      game_title: 'Sequência das Cores & Mágica',
      stars: 3,
      score: finalScore,
      accuracy: finalScore,
      rounds_completed: totalRounds,
      total_rounds: totalRounds,
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Sequência das Cores & Mágica"
        moduleColor="#FFB703"
        currentRound={totalRounds}
        totalRounds={totalRounds}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-amber-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Lógica Perfeita! 🎨</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} descobriu todas as sequências e padrões de cores!
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

  if (!currentRound) return null

  return (
    <GameShell
      title="Sequência das Cores & Mágica"
      moduleColor="#FFB703"
      currentRound={currentRoundIdx + 1}
      totalRounds={totalRounds}
      exitPath={`/app/child/${child.id}`}
      ticoMood={isCorrect ? 'celebrating' : 'talking'}
      ticoInstruction="Descubra qual a próxima cor no ponto de interrogação!"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Sequence Display Row */}
        <div className="w-full bg-white/90 border-2 border-amber-200 rounded-3xl p-5 shadow-md flex items-center justify-center gap-3 sm:gap-4">
          {currentRound.sequence.map((item, idx) => (
            <div
              key={idx}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center text-3xl shadow-sm border border-slate-200"
              style={{ backgroundColor: `${item.id === 'branco' ? '#f1f5f9' : '#ffffff'}` }}
            >
              <span>{item.emoji}</span>
            </div>
          ))}

          {/* Missing item */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 border-2 border-dashed border-amber-400 flex items-center justify-center text-2xl font-black text-amber-700 animate-pulse">
            ❓
          </div>
        </div>

        <p className="text-sm sm:text-base font-bold text-slate-800 text-center">
          Qual cor completa a sequência mágica?
        </p>

        {/* Options */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {currentRound.options.map((opt) => {
            const isSelected = selectedId === opt.id
            const isTarget = opt.id === currentRound.target.id

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                className={`h-28 sm:h-32 rounded-3xl bg-white border-4 p-3 shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5 ${
                  isSelected && isTarget
                    ? 'border-emerald-500 bg-emerald-50 scale-105'
                    : isSelected && !isTarget
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <span className="text-4xl sm:text-5xl">{opt.emoji}</span>
                <span className="text-xs font-black text-slate-700">{opt.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
