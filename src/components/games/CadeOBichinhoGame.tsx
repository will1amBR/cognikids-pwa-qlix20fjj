import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { FARM_ANIMALS, AnimalItem } from './farmAnimalsData'
import { Star, RotateCcw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface CadeOBichinhoGameProps {
  child: Child
}

export const CadeOBichinhoGame: React.FC<CadeOBichinhoGameProps> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory, playAnimalSound } = useSound()

  const totalRounds = 4
  const [roundsList] = useState<AnimalItem[]>(() => {
    return [...FARM_ANIMALS].sort(() => 0.5 - Math.random()).slice(0, totalRounds)
  })

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [options, setOptions] = useState<AnimalItem[]>([])
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [scoreList, setScoreList] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const targetAnimal = roundsList[currentRoundIdx] || roundsList[0]

  useEffect(() => {
    if (isCompleted || !targetAnimal) return

    // Generate 3 options (1 correct + 2 distractors)
    const distractors = FARM_ANIMALS.filter((a) => a.id !== targetAnimal.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
    const roundOptions = [targetAnimal, ...distractors].sort(() => 0.5 - Math.random())
    setOptions(roundOptions)
    setSelectedAnimalId(null)
    setIsCorrect(null)

    // Prompt child
    playAnimalSound(targetAnimal.soundKey)
    setTimeout(() => {
      speechService.speak(`Cadê o ${targetAnimal.name}? Toque no ${targetAnimal.name}!`)
    }, 500)
  }, [currentRoundIdx, isCompleted])

  const handleSelectOption = (animal: AnimalItem) => {
    if (selectedAnimalId !== null) return
    playPop()
    setSelectedAnimalId(animal.id)

    if (animal.id === targetAnimal.id) {
      setIsCorrect(true)
      playStarReward(3)
      setScoreList((prev) => [...prev, 100])
      speechService.speak(`Muito bem! Você achou o ${animal.name}! 🎉`)

      setTimeout(() => {
        if (currentRoundIdx + 1 < totalRounds) {
          setCurrentRoundIdx((prev) => prev + 1)
        } else {
          finishGame()
        }
      }, 1500)
    } else {
      setIsCorrect(false)
      setScoreList((prev) => [...prev, 50])
      playAnimalSound(animal.soundKey)
      speechService.speak(`Esse é o ${animal.name}. Cadê o ${targetAnimal.name}?`)
      setTimeout(() => {
        setSelectedAnimalId(null)
        setIsCorrect(null)
      }, 1400)
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    const finalScore = 95
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'speech',
      game_id: 'cade_o_bichinho',
      game_title: 'Cadê o Bichinho?',
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
        title="Cadê o Bichinho?"
        moduleColor="#FF7A45"
        currentRound={totalRounds}
        totalRounds={totalRounds}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-orange-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Você encontrou todos! 🎈</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} tem uma ótima percepção auditiva!
          </p>
          <Button
            onClick={() => navigate(`/app/child/${child.id}`)}
            className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
          >
            Voltar ao progresso
          </Button>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Cadê o Bichinho?"
      moduleColor="#FF7A45"
      currentRound={currentRoundIdx + 1}
      totalRounds={totalRounds}
      exitPath={`/app/child/${child.id}`}
      ticoMood={isCorrect ? 'celebrating' : 'talking'}
      ticoInstruction={`Toque no ${targetAnimal.name}!`}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">
            Cadê o <span className="text-orange-600">{targetAnimal.name}</span>?
          </h2>
          <p className="text-xs text-slate-500 mt-1">Toque no animalzinho correto na tela</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {options.map((opt) => {
            const isSelected = selectedAnimalId === opt.id
            const isTarget = opt.id === targetAnimal.id

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                className={`h-36 sm:h-44 rounded-3xl p-4 bg-white border-4 flex flex-col items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                  isSelected && isTarget
                    ? 'border-emerald-500 bg-emerald-50 scale-105'
                    : isSelected && !isTarget
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200/80 hover:border-orange-300 hover:shadow-xl'
                }`}
              >
                <span className="text-5xl sm:text-6xl drop-shadow-md">{opt.emoji}</span>
                <span className="font-black text-slate-800 text-sm sm:text-base">{opt.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
