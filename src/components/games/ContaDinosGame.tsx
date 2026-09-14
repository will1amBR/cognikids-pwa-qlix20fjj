import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { DINOSAURS, FRUITS, CategoryItem } from './farmAnimalsData'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface ContaDinosGameProps {
  child: Child
}

interface CountRound {
  count: number
  item: CategoryItem
  options: number[]
}

export const ContaDinosGame: React.FC<ContaDinosGameProps> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory, playAnimalSound } = useSound()

  const totalRounds = 4
  const pool = [...DINOSAURS, ...FRUITS]

  const [rounds, setRounds] = useState<CountRound[]>([])
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [selectedNum, setSelectedNum] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // Generate 4 rounds with numbers 1 to 6 (preschool appropriate)
    const generated: CountRound[] = []
    const usedCounts = [1, 2, 3, 4, 5, 6].sort(() => 0.5 - Math.random()).slice(0, totalRounds)

    usedCounts.forEach((targetCount) => {
      const randomItem = pool[Math.floor(Math.random() * pool.length)]
      // Options: target + 2 distractors
      const possible = [1, 2, 3, 4, 5, 6].filter((n) => n !== targetCount)
      const distractors = possible.sort(() => 0.5 - Math.random()).slice(0, 2)
      const roundOptions = [targetCount, ...distractors].sort((a, b) => a - b)

      generated.push({
        count: targetCount,
        item: randomItem,
        options: roundOptions,
      })
    })

    setRounds(generated)
    setCurrentRoundIdx(0)
  }, [])

  const currentRound = rounds[currentRoundIdx]

  useEffect(() => {
    if (isCompleted || !currentRound) return

    setSelectedNum(null)
    setIsCorrect(null)

    const itemName =
      currentRound.count === 1 ? currentRound.item.name : `${currentRound.item.name}s`
    speechService.speak(`Quantos ${currentRound.item.name}s você vê na tela? Vamos contar!`)
  }, [currentRoundIdx, currentRound, isCompleted])

  const handleSelectNumber = (num: number) => {
    if (selectedNum !== null || !currentRound) return
    playPop()
    setSelectedNum(num)

    if (num === currentRound.count) {
      setIsCorrect(true)
      playStarReward(3)
      playAnimalSound(currentRound.item.soundKey)
      speechService.speak(`Muito bem! São ${num} ${currentRound.item.name}s! Parabéns!`)

      setTimeout(() => {
        if (currentRoundIdx + 1 < totalRounds) {
          setCurrentRoundIdx((prev) => prev + 1)
        } else {
          finishGame()
        }
      }, 1500)
    } else {
      setIsCorrect(false)
      speechService.speak(`Não são ${num}. Vamos contar com o dedinho juntos!`)
      setTimeout(() => {
        setSelectedNum(null)
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
      game_id: 'conta_dinos',
      game_title: 'Contar Bichinhos e Dinos',
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
        title="Contar Bichinhos e Dinos"
        moduleColor="#FFB703"
        currentRound={totalRounds}
        totalRounds={totalRounds}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-amber-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Contador Brilhante! 🔢</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} contou tudo direitinho e aprendeu os números!
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

  const handleAdvanceManually = () => {
    if (currentRoundIdx + 1 < totalRounds) {
      setCurrentRoundIdx((prev) => prev + 1)
      setSelectedNum(null)
      setIsCorrect(false)
    } else {
      finishGame()
    }
  }

  return (
    <GameShell
      title="Contar Bichinhos e Dinos"
      moduleColor="#FFB703"
      currentRound={currentRoundIdx + 1}
      totalRounds={totalRounds}
      exitPath={`/app/child/${child.id}`}
      ticoMood={isCorrect ? 'celebrating' : 'talking'}
      ticoInstruction={`Quantos ${currentRound.item.name}s tem aqui?`}
      onNextRound={handleAdvanceManually}
      nextLabel="Avançar"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Visual Item Display Area */}
        <div className="w-full bg-white/90 border-2 border-amber-200 rounded-3xl p-6 shadow-md flex flex-wrap items-center justify-center gap-4 min-h-[160px]">
          {Array.from({ length: currentRound.count }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-sm animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {currentRound.item.emoji}
            </div>
          ))}
        </div>

        <p className="text-base font-black text-slate-800 text-center">
          Quantos <span className="text-amber-600">{currentRound.item.name}s</span> você contou?
        </p>

        {/* Number Options */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {currentRound.options.map((num) => {
            const isSelected = selectedNum === num
            const isTarget = num === currentRound.count

            return (
              <button
                key={num}
                onClick={() => handleSelectNumber(num)}
                className={`h-24 sm:h-28 rounded-3xl bg-white border-4 font-black text-3xl sm:text-4xl shadow-md transition-all active:scale-95 flex items-center justify-center ${
                  isSelected && isTarget
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 scale-105'
                    : isSelected && !isTarget
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-slate-200 hover:border-amber-400 text-slate-800'
                }`}
              >
                {num}
              </button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
