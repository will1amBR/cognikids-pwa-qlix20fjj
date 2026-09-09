import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GameShell } from '@/components/layout/GameShell'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { CelebrationScreen } from '@/components/celebration/CelebrationScreen'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSound } from '@/context/SoundContext'
import { offlineSyncService } from '@/lib/offlineSync'
import { fetchChildById } from '@/services/children'
import { JUNIOR_LOGIC_PATTERNS, JuniorLogicPattern } from './juniorContentData'
import type { AppLanguage, Child } from '@/types/cognikids'
import { Check, X, RefreshCw, ArrowRight, Lightbulb } from 'lucide-react'

interface JuniorGameProps {
  child?: Child | null
}

export const JuniorLogicMatrixGame: React.FC<JuniorGameProps> = ({ child: initialChild }) => {
  const { childId: routeChildId } = useParams<{ childId: string }>()
  const childId = initialChild?.id || routeChildId
  const navigate = useNavigate()
  const { playSound } = useSound()

  const [child, setChild] = useState<Child | null>(initialChild || null)
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  const patterns = JUNIOR_LOGIC_PATTERNS
  const totalRounds = patterns.length
  const currentPattern: JuniorLogicPattern = patterns[currentRound] || patterns[0]

  useEffect(() => {
    if (childId) {
      fetchChildById(childId).then((c) => {
        if (c) setChild(c)
      })
    }
  }, [childId])

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return
    setSelectedOption(opt)
    setIsAnswered(true)

    const correct = opt === currentPattern.correctOption
    setIsCorrect(correct)

    if (correct) {
      playSound('correct')
      setScore((prev) => prev + 30)
      setCorrectCount((prev) => prev + 1)
    } else {
      playSound('error')
    }
  }

  const handleNext = () => {
    playSound('pop')
    if (currentRound + 1 >= totalRounds) {
      finishGame()
    } else {
      setCurrentRound((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
      setIsCorrect(false)
    }
  }

  const finishGame = () => {
    setIsCompleted(true)
    playSound('fanfare')

    const accuracy = Math.round((correctCount / totalRounds) * 100)
    const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1

    if (childId && child) {
      offlineSyncService.saveSession({
        user_id: child.user_id,
        child_id: child.id,
        module_id: 'junior_logic',
        game_id: 'junior_logic_matrix',
        game_title: 'Matriz Lógica 2x2',
        stars,
        score,
        accuracy,
        rounds_completed: totalRounds,
        total_rounds: totalRounds,
        language: 'pt-BR',
        details: {
          correctCount,
          totalPatterns: totalRounds,
          isJunior: true,
        },
      })
    }
  }

  if (isCompleted) {
    const accuracy = Math.round((correctCount / totalRounds) * 100)
    const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1

    return (
      <GameShell title="Matriz Lógica Junior" onBack={() => navigate('/junior')}>
        <CelebrationScreen
          title="Enigmas Decifrados! 🧩"
          subtitle="Módulo CogniKids Junior: Dedução, Padrões e Raciocínio Espacial"
          childName="Junior"
          score={score}
          accuracy={accuracy}
          stars={stars}
          roundsCompleted={totalRounds}
          totalRounds={totalRounds}
          practicedWords={patterns.slice(0, totalRounds).map((p) => p.title)}
          onPlayAgain={() => {
            setIsCompleted(false)
            setCurrentRound(0)
            setScore(0)
            setSelectedOption(null)
            setIsAnswered(false)
            setCorrectCount(0)
          }}
          onExit={() => navigate('/junior')}
          exitLabel="Voltar ao Junior"
          isJunior={true}
        />
      </GameShell>
    )
  }

  return (
    <GameShell
      title="CogniKids Junior: Matriz Lógica"
      score={score}
      stars={3}
      currentRound={currentRound + 1}
      totalRounds={totalRounds}
      onBack={() => navigate('/junior')}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6 sm:p-8 rounded-3xl border-2 border-amber-200 bg-gradient-to-b from-white via-amber-50/20 to-orange-50/20 shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <Badge className="bg-amber-100 text-amber-900 font-bold border-amber-200 text-xs">
              {currentPattern.title}
            </Badge>
            <span className="text-xs font-bold text-slate-400">Dedução & Sequência</span>
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-lg font-bold text-slate-700">
              Qual é o próximo elemento da sequência?
            </h3>
            {/* Sequence Box */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4 bg-slate-100/70 rounded-2xl border border-slate-200">
              {currentPattern.sequence.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-2xs border ${
                    item === '?'
                      ? 'bg-amber-400 text-slate-900 border-amber-500 animate-pulse font-extrabold'
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentPattern.options.map((opt) => {
              let btnStyle = 'bg-white hover:bg-amber-50 border-2 border-slate-200 text-slate-800'
              if (isAnswered) {
                if (opt === currentPattern.correctOption) {
                  btnStyle =
                    'bg-emerald-500 text-white border-emerald-600 font-black scale-105 shadow-md'
                } else if (selectedOption === opt) {
                  btnStyle = 'bg-rose-500 text-white border-rose-600 opacity-80'
                } else {
                  btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-50'
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`h-16 rounded-2xl text-xl sm:text-2xl font-black transition-all flex items-center justify-center gap-2 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && opt === currentPattern.correctOption && (
                    <Check className="w-5 h-5" />
                  )}
                  {isAnswered && selectedOption === opt && opt !== currentPattern.correctOption && (
                    <X className="w-5 h-5" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-sm font-bold flex items-start gap-2.5 ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">{isCorrect ? 'Resposta Exata!' : 'Quase lá!'}</p>
                <p className="text-xs font-semibold mt-0.5">{currentPattern.reason}</p>
              </div>
            </div>
          )}
        </Card>

        {isAnswered && (
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleNext}
              className="rounded-2xl px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md hover:from-amber-600 hover:to-orange-600"
            >
              <span>{currentRound + 1 >= totalRounds ? 'Ver Resultado' : 'Próximo Enigma'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </GameShell>
  )
}
