import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface EmotionQuestion {
  story: string
  targetEmotion: string
  emoji: string
  options: { name: string; emoji: string }[]
}

const EMOTIONS_ROUNDS: EmotionQuestion[] = [
  {
    story: 'O Tico ganhou um presente surpresa muito legal! Como ele está se sentindo?',
    targetEmotion: 'Feliz',
    emoji: '😄',
    options: [
      { name: 'Feliz', emoji: '😄' },
      { name: 'Triste', emoji: '😢' },
      { name: 'Bravo', emoji: '😠' },
    ],
  },
  {
    story: 'O cachorrinho ouviu um trovão bem forte no céu. Ele ficou assustado!',
    targetEmotion: 'Assustado',
    emoji: '😮',
    options: [
      { name: 'Assustado', emoji: '😮' },
      { name: 'Dormindo', emoji: '😴' },
      { name: 'Feliz', emoji: '😄' },
    ],
  },
  {
    story: 'A ovelhinha deu um abraço apertado na mamãe. Ela está calma e com amor!',
    targetEmotion: 'Amoroso',
    emoji: '🥰',
    options: [
      { name: 'Amoroso', emoji: '🥰' },
      { name: 'Bravo', emoji: '😠' },
      { name: 'Triste', emoji: '😢' },
    ],
  },
]

export const CarinhasFelizesGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory } = useSound()

  const [roundIdx, setRoundIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentRound = EMOTIONS_ROUNDS[roundIdx] || EMOTIONS_ROUNDS[0]

  useEffect(() => {
    if (isCompleted) return
    speechService.speak(currentRound.story)
  }, [roundIdx, isCompleted])

  const handleSelect = (optionName: string) => {
    playPop()
    setSelectedOption(optionName)

    if (optionName === currentRound.targetEmotion) {
      playStarReward(3)
      speechService.speak(`Isso mesmo! Ele está se sentindo ${optionName}!`)
      setTimeout(() => {
        setSelectedOption(null)
        if (roundIdx + 1 < EMOTIONS_ROUNDS.length) {
          setRoundIdx((r) => r + 1)
        } else {
          finishGame()
        }
      }, 1500)
    } else {
      speechService.speak(`Vamos pensar juntos! Olhe as carinhas de novo.`)
      setTimeout(() => setSelectedOption(null), 1200)
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'socioemotional',
      game_id: 'carinhas_felizes',
      game_title: 'Como Eu Me Sinto?',
      stars: 3,
      score: 95,
      accuracy: 95,
      rounds_completed: 3,
      total_rounds: 3,
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Como Eu Me Sinto?"
        moduleColor="#E63946"
        currentRound={3}
        totalRounds={3}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-rose-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Empatia e Emoções! ❤️</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">Você reconheceu todos os sentimentos!</p>
          <Button
            onClick={() => navigate(`/app/child/${child.id}`)}
            className="w-full h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
          >
            Voltar ao progresso
          </Button>
        </div>
      </GameShell>
    )
  }

  const handleAdvanceManually = () => {
    if (roundIdx + 1 < 3) {
      setRoundIdx((prev) => prev + 1)
      setSelectedOption(null)
    } else {
      finishGame()
    }
  }

  return (
    <GameShell
      title="Como Eu Me Sinto?"
      moduleColor="#E63946"
      currentRound={roundIdx + 1}
      totalRounds={3}
      exitPath={`/app/child/${child.id}`}
      ticoMood="talking"
      ticoInstruction={currentRound.story}
      onNextRound={handleAdvanceManually}
      nextLabel="Avançar"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="bg-white/90 p-5 rounded-3xl border border-rose-100 shadow-md text-center">
          <p className="text-sm sm:text-base font-bold text-slate-800">{currentRound.story}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
          {currentRound.options.map((opt) => (
            <button
              key={opt.name}
              onClick={() => handleSelect(opt.name)}
              className={`h-32 sm:h-36 rounded-3xl p-3 bg-white border-4 flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                selectedOption === opt.name && opt.name === currentRound.targetEmotion
                  ? 'border-emerald-500 bg-emerald-50 scale-105'
                  : 'border-slate-200 hover:border-rose-400'
              }`}
            >
              <span className="text-5xl">{opt.emoji}</span>
              <span className="font-bold text-xs sm:text-sm text-slate-700">{opt.name}</span>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  )
}
