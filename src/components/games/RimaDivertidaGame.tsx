import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface RhymeChallenge {
  id: string
  leadWord: string
  leadEmoji: string
  leadAudioText: string
  targetRhyme: string
  options: { name: string; emoji: string; isCorrect: boolean }[]
  celebrationPhrase: string
}

const RHYME_ROUNDS: RhymeChallenge[] = [
  {
    id: 'rima_gato',
    leadWord: 'Gato',
    leadEmoji: '🐱',
    leadAudioText: 'Gato termina com ATO! O que rima com Gato?',
    targetRhyme: 'Pato',
    options: [
      { name: 'Pato', emoji: '🦆', isCorrect: true },
      { name: 'Carro', emoji: '🚗', isCorrect: false },
      { name: 'Bola', emoji: '⚽', isCorrect: false },
    ],
    celebrationPhrase: 'Gato rima com Pato! Os dois terminam com ATO!',
  },
  {
    id: 'rima_maca',
    leadWord: 'Maçã',
    leadEmoji: '🍎',
    leadAudioText: 'Maçã termina com Ã! O que rima com Maçã?',
    targetRhyme: 'Rã',
    options: [
      { name: 'Rã', emoji: '🐸', isCorrect: true },
      { name: 'Peixe', emoji: '🐟', isCorrect: false },
      { name: 'Casa', emoji: '🏠', isCorrect: false },
    ],
    celebrationPhrase: 'Maçã rima com Rã! As duas terminam com o som Ã!',
  },
  {
    id: 'rima_leao',
    leadWord: 'Leão',
    leadEmoji: '🦁',
    leadAudioText: 'Leão termina com Ã-O! O que rima com Leão?',
    targetRhyme: 'Avião',
    options: [
      { name: 'Avião', emoji: '✈️', isCorrect: true },
      { name: 'Estrela', emoji: '⭐', isCorrect: false },
      { name: 'Flor', emoji: '🌸', isCorrect: false },
    ],
    celebrationPhrase: 'Leão rima com Avião! Som do coração!',
  },
]

export const RimaDivertidaGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory } = useSound()

  const [roundIdx, setRoundIdx] = useState(0)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentRound = RHYME_ROUNDS[roundIdx] || RHYME_ROUNDS[0]

  useEffect(() => {
    if (isCompleted) return
    setSelectedName(null)
    speechService.speak(currentRound.leadAudioText)
  }, [roundIdx, isCompleted])

  const handleSelect = (opt: RhymeChallenge['options'][0]) => {
    playPop()
    setSelectedName(opt.name)

    if (opt.isCorrect) {
      playStarReward(3)
      speechService.speak(`Muito bem! ${currentRound.celebrationPhrase}`)
      setTimeout(() => {
        if (roundIdx + 1 < RHYME_ROUNDS.length) {
          setRoundIdx((r) => r + 1)
        } else {
          finishGame()
        }
      }, 1500)
    } else {
      speechService.speak(`Não é ${opt.name}. Escute o som no final da palavra e tente de novo!`)
      setTimeout(() => setSelectedName(null), 1200)
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    speechService.speak('Parabéns! Seu ouvido musical para as rimas é fantástico!')
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'speech',
      game_id: 'rima_divertida',
      game_title: 'Rimas do Tico',
      stars: 3,
      score: 100,
      accuracy: 100,
      rounds_completed: RHYME_ROUNDS.length,
      total_rounds: RHYME_ROUNDS.length,
      details: { theme: 'phonological_awareness', description: 'Consciência fonológica e rimas' },
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Rimas do Tico"
        moduleColor="#FF7A45"
        currentRound={RHYME_ROUNDS.length}
        totalRounds={RHYME_ROUNDS.length}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-orange-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Poeta das Palavras! 🗣️</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} encontrou todos os pares de rimas com muita percepção auditiva!
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

  const handleAdvanceManually = () => {
    if (roundIdx + 1 < RHYME_ROUNDS.length) {
      setRoundIdx((prev) => prev + 1)
      setSelectedName(null)
    } else {
      finishGame()
    }
  }

  return (
    <GameShell
      title="Rimas do Tico"
      moduleColor="#FF7A45"
      currentRound={roundIdx + 1}
      totalRounds={RHYME_ROUNDS.length}
      exitPath={`/app/child/${child.id}`}
      ticoMood="talking"
      ticoInstruction={currentRound.leadAudioText}
      onNextRound={handleAdvanceManually}
      nextLabel="Avançar"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Main Lead Card */}
        <div className="bg-white/95 p-6 rounded-3xl border-2 border-orange-200 shadow-md text-center flex flex-col items-center gap-2">
          <span className="text-6xl animate-bounce">{currentRound.leadEmoji}</span>
          <h2 className="text-2xl font-black text-slate-800">
            Palavra: <span className="text-orange-600">{currentRound.leadWord}</span>
          </h2>
          <p className="text-xs font-bold text-slate-500">Qual das figuras abaixo rima com ela?</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {currentRound.options.map((opt) => {
            const isSelected = selectedName === opt.name
            return (
              <button
                key={opt.name}
                onClick={() => handleSelect(opt)}
                className={`h-32 sm:h-36 rounded-3xl bg-white border-4 flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                  isSelected && opt.isCorrect
                    ? 'border-emerald-500 bg-emerald-50 scale-105'
                    : isSelected && !opt.isCorrect
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 hover:border-orange-400'
                }`}
              >
                <span className="text-4xl sm:text-5xl">{opt.emoji}</span>
                <span className="font-bold text-xs sm:text-sm text-slate-700">{opt.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
