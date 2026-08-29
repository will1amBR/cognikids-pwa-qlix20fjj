import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { FARM_ANIMALS, DINOSAURS, AnimalItem } from './farmAnimalsData'
import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface SomDoBichoGameProps {
  child: Child
}

export const SomDoBichoGame: React.FC<SomDoBichoGameProps> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory, playAnimalSound } = useSound()

  const allItems = [...FARM_ANIMALS, ...DINOSAURS]
  const totalRounds = 4

  const [roundsList] = useState<AnimalItem[]>(() => {
    return [...allItems].sort(() => 0.5 - Math.random()).slice(0, totalRounds)
  })

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [options, setOptions] = useState<AnimalItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const targetItem = roundsList[currentRoundIdx] || roundsList[0]

  useEffect(() => {
    if (isCompleted || !targetItem) return

    const distractors = allItems
      .filter((a) => a.id !== targetItem.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)

    const roundOptions = [targetItem, ...distractors].sort(() => 0.5 - Math.random())
    setOptions(roundOptions)
    setSelectedId(null)
    setIsCorrect(null)

    // Play target sound first
    playAnimalSound(targetItem.soundKey)
    setTimeout(() => {
      speechService.speak('Ouça o som! De quem é esse barulhinho ou rugido?')
    }, 400)
  }, [currentRoundIdx, targetItem, isCompleted])

  const handlePlaySoundAgain = () => {
    if (!targetItem) return
    playAnimalSound(targetItem.soundKey)
  }

  const handleSelectOption = (item: AnimalItem) => {
    if (selectedId !== null) return
    playPop()
    setSelectedId(item.id)

    if (item.id === targetItem.id) {
      setIsCorrect(true)
      playStarReward(3)
      speechService.speak(`Acertou! É o som do ${item.name}! 🌟`)

      setTimeout(() => {
        if (currentRoundIdx + 1 < totalRounds) {
          setCurrentRoundIdx((prev) => prev + 1)
        } else {
          finishGame()
        }
      }, 1500)
    } else {
      setIsCorrect(false)
      speechService.speak(`Não é o ${item.name}. Ouça o som de novo!`)
      setTimeout(() => {
        setSelectedId(null)
        setIsCorrect(null)
        playAnimalSound(targetItem.soundKey)
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
      game_id: 'som_do_bicho',
      game_title: 'Qual é o Som?',
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
        title="Qual é o Som?"
        moduleColor="#FF7A45"
        currentRound={totalRounds}
        totalRounds={totalRounds}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-orange-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Ouvido de Detetive! 🎧</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} reconheceu todos os sons e rugidos!
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

  if (!targetItem) return null

  return (
    <GameShell
      title="Qual é o Som?"
      moduleColor="#FF7A45"
      currentRound={currentRoundIdx + 1}
      totalRounds={totalRounds}
      exitPath={`/app/child/${child.id}`}
      ticoMood={isCorrect ? 'celebrating' : 'listening'}
      ticoInstruction="Ouça o som e toque no bicho ou dinossauro certo!"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Sound button */}
        <button
          onClick={handlePlaySoundAgain}
          className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xl shadow-orange-500/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:scale-105"
        >
          <Volume2 className="w-10 h-10 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider">Ouvir som</span>
        </button>

        <p className="text-sm font-bold text-slate-700 text-center">
          De quem é esse barulhinho? Toque na opção:
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {options.map((opt) => {
            const isSelected = selectedId === opt.id
            const isTarget = opt.id === targetItem.id

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
