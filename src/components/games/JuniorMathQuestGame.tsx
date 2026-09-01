import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GameShell } from '@/components/layout/GameShell'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSound } from '@/context/SoundContext'
import { offlineSyncService } from '@/lib/offlineSync'
import { fetchChildById } from '@/services/children'
import { JUNIOR_MATH_QUESTIONS, JuniorMathQuestion } from './juniorContentData'
import type { AppLanguage, Child } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import { Check, X, RefreshCw, Trophy, ArrowRight, Lightbulb } from 'lucide-react'

interface JuniorGameProps {
  child?: Child | null
}

export const JuniorMathQuestGame: React.FC<JuniorGameProps> = ({ child: initialChild }) => {
  const { childId: routeChildId } = useParams<{ childId: string }>()
  const childId = initialChild?.id || routeChildId
  const navigate = useNavigate()
  const { playSound } = useSound()

  const [child, setChild] = useState<Child | null>(initialChild || null)
  const [currentLang, setCurrentLang] = useState<AppLanguage>('pt-BR')
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  const questions = JUNIOR_MATH_QUESTIONS
  const totalRounds = questions.length
  const currentQuestion: JuniorMathQuestion = questions[currentRound] || questions[0]

  useEffect(() => {
    if (childId) {
      fetchChildById(childId).then((c) => {
        if (c) {
          setChild(c)
          const preferred = (c.primary_language || 'pt-BR') as AppLanguage
          setCurrentLang(preferred)
        }
      })
    }
  }, [childId])

  const getQuestionText = (q: JuniorMathQuestion, lang: AppLanguage) => {
    switch (lang) {
      case 'en':
        return q.questionEn
      case 'es':
        return q.questionEs
      case 'de':
        return q.questionDe
      case 'fr':
        return q.questionFr
      case 'pt-BR':
      default:
        return q.questionPt
    }
  }

  const handleSelectOption = (opt: number) => {
    if (isAnswered) return
    setSelectedOption(opt)
    setIsAnswered(true)

    const correct = opt === currentQuestion.correctAnswer
    setIsCorrect(correct)

    if (correct) {
      playSound('correct')
      setScore((prev) => prev + 25)
      setCorrectAnswersCount((prev) => prev + 1)
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

    const accuracy = Math.round((correctAnswersCount / totalRounds) * 100)
    const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1

    if (childId && child) {
      offlineSyncService.saveSession({
        user_id: child.user_id,
        child_id: child.id,
        module_id: 'junior_math',
        game_id: 'junior_math_quest',
        game_title: 'Missão Matemática do Tico',
        stars,
        score,
        accuracy,
        rounds_completed: totalRounds,
        total_rounds: totalRounds,
        language: currentLang,
        details: {
          correctAnswersCount,
          totalQuestions: totalRounds,
          isJunior: true,
        },
      })
    }
  }

  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0]

  if (isCompleted) {
    const accuracy = Math.round((correctAnswersCount / totalRounds) * 100)
    const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1

    return (
      <GameShell title="Missão Matemática Junior" onBack={() => navigate('/junior')}>
        <div className="max-w-md mx-auto text-center space-y-6 py-8">
          <TicoMascot mood="celebrating" size="lg" />

          <Card className="p-6 rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white shadow-md">
            <h3 className="text-2xl font-black text-slate-800 mb-1">Missão Concluída!</h3>
            <p className="text-xs text-slate-500 mb-3">Módulo de Matemática & Raciocínio</p>

            <div className="flex justify-center gap-2 text-3xl mb-4">{'⭐'.repeat(stars)}</div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-sky-100/60 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-sky-800 uppercase">Pontuação</span>
                <p className="text-xl font-black text-sky-950">{score} pts</p>
              </div>
              <div className="bg-emerald-100/60 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Precisão</span>
                <p className="text-xl font-black text-emerald-950">{accuracy}%</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl"
                onClick={() => {
                  setIsCompleted(false)
                  setCurrentRound(0)
                  setScore(0)
                  setSelectedOption(null)
                  setIsAnswered(false)
                  setCorrectAnswersCount(0)
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Jogar de Novo
              </Button>
              <Button
                className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold"
                onClick={() => navigate('/junior')}
              >
                Voltar ao Junior
              </Button>
            </div>
          </Card>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="CogniKids Junior: Missão Matemática"
      score={score}
      stars={3}
      currentRound={currentRound + 1}
      totalRounds={totalRounds}
      onBack={() => navigate('/junior')}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Language selector */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500">Idioma do desafio:</span>
          <div className="flex gap-1.5">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setCurrentLang(l.code)
                  playSound('pop')
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  currentLang === l.code
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{l.flag}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Math Question Card */}
        <Card className="p-6 sm:p-8 rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-white via-sky-50/20 to-blue-50/30 shadow-md text-center space-y-6">
          <div className="flex justify-between items-center">
            <Badge className="bg-sky-100 text-sky-800 font-bold border-sky-200 text-xs">
              Desafio #{currentRound + 1}
            </Badge>
            <span className="text-xs font-bold text-slate-400">Cálculo Rápido</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
            {getQuestionText(currentQuestion, currentLang)}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {currentQuestion.options.map((opt) => {
              let btnStyle = 'bg-white hover:bg-sky-50/80 border-2 border-slate-200 text-slate-800'
              if (isAnswered) {
                if (opt === currentQuestion.correctAnswer) {
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
                  className={`py-5 px-4 rounded-2xl text-2xl sm:text-3xl font-black transition-all flex items-center justify-center gap-2 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && opt === currentQuestion.correctAnswer && (
                    <Check className="w-6 h-6" />
                  )}
                  {isAnswered &&
                    selectedOption === opt &&
                    opt !== currentQuestion.correctAnswer && <X className="w-6 h-6" />}
                </button>
              )
            })}
          </div>

          {/* Explanation / Feedback */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-sm font-bold text-left flex items-start gap-2.5 ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">{isCorrect ? 'Correto!' : 'Não foi dessa vez!'}</p>
                <p className="text-xs font-semibold mt-0.5">{currentQuestion.explanationPt}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Footer Next Button */}
        {isAnswered && (
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleNext}
              className="rounded-2xl px-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-md hover:from-sky-600 hover:to-blue-700"
            >
              <span>{currentRound + 1 >= totalRounds ? 'Ver Resultado' : 'Próxima Questão'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </GameShell>
  )
}
