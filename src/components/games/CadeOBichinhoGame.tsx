import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { calculateAgeMonths } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { AnimalItem, WORD_CATEGORIES, getItemsByCategory, getAllItems } from './farmAnimalsData'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { CelebrationScreen } from '@/components/celebration/CelebrationScreen'

interface CadeOBichinhoGameProps {
  child: Child
}

export const CadeOBichinhoGame: React.FC<CadeOBichinhoGameProps> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory, playAnimalSound } = useSound()

  const [selectedCategory, setSelectedCategory] = useState<string>('farm')
  const totalRounds = 4

  const [roundsList, setRoundsList] = useState<AnimalItem[]>([])
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [options, setOptions] = useState<AnimalItem[]>([])
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const items = getItemsByCategory(selectedCategory)
    const shuffled = [...items].sort(() => 0.5 - Math.random()).slice(0, totalRounds)
    setRoundsList(shuffled)
    setCurrentRoundIdx(0)
    setIsCompleted(false)
  }, [selectedCategory])

  const targetAnimal = roundsList[currentRoundIdx] || roundsList[0]

  useEffect(() => {
    if (isCompleted || !targetAnimal) return

    const categoryPool = getItemsByCategory(selectedCategory)
    const distractors = categoryPool
      .filter((a) => a.id !== targetAnimal.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)

    const roundOptions = [targetAnimal, ...distractors].sort(() => 0.5 - Math.random())
    setOptions(roundOptions)
    setSelectedAnimalId(null)
    setIsCorrect(null)

    playAnimalSound(targetAnimal.soundKey)
    setTimeout(() => {
      speechService.speak(`Cadê: ${targetAnimal.name}? Toque no ${targetAnimal.name}!`)
    }, 500)
  }, [currentRoundIdx, targetAnimal, isCompleted, selectedCategory])

  const handleSelectOption = (animal: AnimalItem) => {
    if (selectedAnimalId !== null) return
    playPop()
    setSelectedAnimalId(animal.id)

    if (animal.id === targetAnimal.id) {
      setIsCorrect(true)
      playStarReward(3)
      speechService.speak(`Muito bem! Você encontrou: ${animal.name}! 🎉`)

      setTimeout(() => {
        if (currentRoundIdx + 1 < totalRounds) {
          setCurrentRoundIdx((prev) => prev + 1)
        } else {
          finishGame()
        }
      }, 1500)
    } else {
      setIsCorrect(false)
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
    const catName = WORD_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Itens'
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'speech',
      game_id: 'cade_o_bichinho',
      game_title: `Cadê o Item? (${catName})`,
      stars: 3,
      score: finalScore,
      accuracy: finalScore,
      rounds_completed: totalRounds,
      total_rounds: totalRounds,
      language: 'pt-BR',
      details: {
        category: selectedCategory,
        items: roundsList.map((r) => r.name),
        wordResults: roundsList.map((r) => ({
          word: r.name,
          score: finalScore,
          stars: 3,
          isRecognized: true,
        })),
      },
    })
  }

  if (isCompleted) {
    const catName = WORD_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Itens'
    return (
      <GameShell
        title="Cadê o Bichinho / Objeto?"
        moduleColor="#FF7A45"
        currentRound={totalRounds}
        totalRounds={totalRounds}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <CelebrationScreen
          title="Você Encontrou Todos! 🎈"
          subtitle={`${child.name} tem uma excelente percepção auditiva e visual!`}
          childName={child.name}
          score={95}
          accuracy={95}
          stars={3}
          roundsCompleted={totalRounds}
          totalRounds={totalRounds}
          categoryName={catName}
          practicedWords={roundsList.map((r) => r.name)}
          onPlayAgain={() => {
            setCurrentRoundIdx(0)
            setIsCompleted(false)
          }}
          onExit={() => navigate(`/app/child/${child.id}`)}
          exitLabel="Voltar ao progresso"
          isJunior={false}
        />
      </GameShell>
    )
  }

  if (!targetAnimal) return null

  return (
    <GameShell
      title="Cadê o Bichinho / Objeto?"
      moduleColor="#FF7A45"
      currentRound={currentRoundIdx + 1}
      totalRounds={totalRounds}
      exitPath={`/app/child/${child.id}`}
      ticoMood={isCorrect ? 'celebrating' : 'talking'}
      ticoInstruction={`Toque no ${targetAnimal.name}!`}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {/* Category Pills */}
        <div className="w-full flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {WORD_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playPop()
                  setSelectedCategory(cat.id)
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white/80 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">
            Cadê o <span className="text-orange-600">{targetAnimal.name}</span>?
          </h2>
          <p className="text-xs text-slate-500 mt-1">Toque na imagem correspondente na tela</p>
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
