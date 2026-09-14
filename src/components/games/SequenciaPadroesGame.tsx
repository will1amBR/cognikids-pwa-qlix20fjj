import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface SequenceChallenge {
  patternType: 'shape' | 'fruit' | 'animal'
  sequence: { name: string; emoji: string }[]
  missingIndex: number
  targetAnswer: { name: string; emoji: string }
  options: { name: string; emoji: string }[]
  explanation: string
}

const SEQUENCE_ROUNDS: SequenceChallenge[] = [
  {
    patternType: 'fruit',
    sequence: [
      { name: 'Maçã', emoji: '🍎' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Maçã', emoji: '🍎' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Maçã', emoji: '🍎' },
      { name: 'Ponto de interrogação', emoji: '❓' },
    ],
    missingIndex: 5,
    targetAnswer: { name: 'Banana', emoji: '🍌' },
    options: [
      { name: 'Banana', emoji: '🍌' },
      { name: 'Uva', emoji: '🍇' },
      { name: 'Morango', emoji: '🍓' },
    ],
    explanation: 'Maçã, banana, maçã, banana, maçã... agora vem a Banana!',
  },
  {
    patternType: 'shape',
    sequence: [
      { name: 'Estrela', emoji: '⭐' },
      { name: 'Coração', emoji: '❤️' },
      { name: 'Estrela', emoji: '⭐' },
      { name: 'Coração', emoji: '❤️' },
      { name: 'Ponto de interrogação', emoji: '❓' },
      { name: 'Coração', emoji: '❤️' },
    ],
    missingIndex: 4,
    targetAnswer: { name: 'Estrela', emoji: '⭐' },
    options: [
      { name: 'Estrela', emoji: '⭐' },
      { name: 'Círculo', emoji: '🔵' },
      { name: 'Quadrado', emoji: '🟩' },
    ],
    explanation: 'Estrela, coração, estrela, coração... a que falta é a Estrela!',
  },
  {
    patternType: 'animal',
    sequence: [
      { name: 'Leão', emoji: '🦁' },
      { name: 'Sapo', emoji: '🐸' },
      { name: 'Leão', emoji: '🦁' },
      { name: 'Sapo', emoji: '🐸' },
      { name: 'Leão', emoji: '🦁' },
      { name: 'Ponto de interrogação', emoji: '❓' },
    ],
    missingIndex: 5,
    targetAnswer: { name: 'Sapo', emoji: '🐸' },
    options: [
      { name: 'Sapo', emoji: '🐸' },
      { name: 'Pato', emoji: '🦆' },
      { name: 'Gato', emoji: '🐱' },
    ],
    explanation: 'Leão, sapo, leão, sapo, leão... o próximo é o Sapo!',
  },
]

export const SequenciaPadroesGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory } = useSound()

  const [roundIdx, setRoundIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentRound = SEQUENCE_ROUNDS[roundIdx] || SEQUENCE_ROUNDS[0]

  useEffect(() => {
    if (isCompleted) return
    setSelectedOption(null)
    speechService.speak(
      `Olhe o padrão de repetição do Tico! Qual é o próximo que vem no lugar do ponto de interrogação?`,
    )
  }, [roundIdx, isCompleted])

  const handleSelect = (opt: { name: string; emoji: string }) => {
    playPop()
    setSelectedOption(opt.name)

    if (opt.name === currentRound.targetAnswer.name) {
      playStarReward(3)
      speechService.speak(`Muito bem! ${currentRound.explanation}`)
      setTimeout(() => {
        if (roundIdx + 1 < SEQUENCE_ROUNDS.length) {
          setRoundIdx((r) => r + 1)
        } else {
          finishGame()
        }
      }, 1500)
    } else {
      speechService.speak(`Ops, quase! Olhe a ordem com atenção e tente de novo!`)
      setTimeout(() => setSelectedOption(null), 1200)
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    speechService.speak('Incrível! Você dominou todos os padrões lógicos!')
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'logic',
      game_id: 'sequencia_padroes',
      game_title: 'Sequência & Padrões Lógicos',
      stars: 3,
      score: 100,
      accuracy: 100,
      rounds_completed: SEQUENCE_ROUNDS.length,
      total_rounds: SEQUENCE_ROUNDS.length,
      details: { theme: 'logic_patterns', description: 'Reconhecimento de sequências AB' },
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Sequência & Padrões Lógicos"
        moduleColor="#FFB703"
        currentRound={SEQUENCE_ROUNDS.length}
        totalRounds={SEQUENCE_ROUNDS.length}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-amber-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Mente Lógica! 🧠</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} encontrou todos os elementos que faltavam nas sequências!
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
    if (roundIdx + 1 < SEQUENCE_ROUNDS.length) {
      setRoundIdx((prev) => prev + 1)
      setSelectedOption(null)
    } else {
      finishGame()
    }
  }

  return (
    <GameShell
      title="Sequência & Padrões Lógicos"
      moduleColor="#FFB703"
      currentRound={roundIdx + 1}
      totalRounds={SEQUENCE_ROUNDS.length}
      exitPath={`/app/child/${child.id}`}
      ticoMood="talking"
      ticoInstruction="Qual figura completa a sequência certa?"
      onNextRound={handleAdvanceManually}
      nextLabel="Avançar"
    >
      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        {/* Sequence Belt Display */}
        <div className="w-full bg-white/95 p-5 sm:p-6 rounded-3xl border-2 border-amber-200 shadow-md">
          <p className="text-xs font-black uppercase text-amber-600 tracking-wider text-center mb-3">
            Descubra o padrão:
          </p>
          <div className="grid grid-cols-6 gap-2 sm:gap-3 items-center justify-center">
            {currentRound.sequence.map((item, idx) => {
              const isMissing = idx === currentRound.missingIndex
              return (
                <div
                  key={idx}
                  className={`h-14 sm:h-18 rounded-2xl flex flex-col items-center justify-center text-2xl sm:text-3xl shadow-sm border-2 ${
                    isMissing
                      ? 'bg-amber-100 border-dashed border-amber-400 animate-pulse text-amber-700 font-black'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isMissing
                    ? selectedOption && selectedOption === currentRound.targetAnswer.name
                      ? currentRound.targetAnswer.emoji
                      : '❓'
                    : item.emoji}
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-base font-extrabold text-slate-800 text-center">
          Qual opção entra no <span className="text-amber-500 font-black">❓</span>?
        </p>

        {/* Options */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {currentRound.options.map((opt) => {
            const isSelected = selectedOption === opt.name
            const isCorrect = opt.name === currentRound.targetAnswer.name

            return (
              <button
                key={opt.name}
                onClick={() => handleSelect(opt)}
                className={`h-28 sm:h-32 rounded-3xl bg-white border-4 flex flex-col items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                  isSelected && isCorrect
                    ? 'border-emerald-500 bg-emerald-50 scale-105'
                    : isSelected && !isCorrect
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-slate-200 hover:border-amber-400'
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
