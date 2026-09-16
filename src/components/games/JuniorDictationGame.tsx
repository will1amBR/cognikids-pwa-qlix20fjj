import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GameShell } from '@/components/layout/GameShell'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { CelebrationScreen } from '@/components/celebration/CelebrationScreen'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSound } from '@/context/SoundContext'
import { speechService } from '@/lib/speechSynthesis'
import { normalizePtText } from '@/lib/fuzzyMatching'
import { offlineSyncService } from '@/lib/offlineSync'
import { fetchChildById } from '@/services/children'
import { JUNIOR_VOCABULARY_LIST, JuniorWordItem } from './juniorContentData'
import type { AppLanguage, Child } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  HelpCircle,
} from 'lucide-react'

interface JuniorGameProps {
  child?: Child | null
}

export const JuniorDictationGame: React.FC<JuniorGameProps> = ({ child: initialChild }) => {
  const { childId: routeChildId } = useParams<{ childId: string }>()
  const childId = initialChild?.id || routeChildId
  const navigate = useNavigate()
  const { playSound } = useSound()

  const [child, setChild] = useState<Child | null>(initialChild || null)
  const [currentLang, setCurrentLang] = useState<AppLanguage>('pt-BR')
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [userInput, setUserInput] = useState<string>('')
  const [score, setScore] = useState<number>(0)
  const [isAnswered, setIsAnswered] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [showHint, setShowHint] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  const words = JUNIOR_VOCABULARY_LIST
  const totalRounds = words.length
  const currentItem: JuniorWordItem = words[currentRound] || words[0]

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

  const getLangData = (item: JuniorWordItem, lang: AppLanguage) => {
    switch (lang) {
      case 'en':
        return item.en
      case 'es':
        return item.es
      case 'de':
        return item.de
      case 'fr':
        return item.fr
      case 'pt-BR':
      default:
        return item.pt
    }
  }

  const langContent = getLangData(currentItem, currentLang)

  const handleSpeak = async () => {
    setIsSpeaking(true)
    try {
      await speechService.speak(langContent.word, { lang: currentLang })
    } catch (_) {
      // ignore
    } finally {
      setIsSpeaking(false)
    }
  }

  // Auto speak word on round load
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSpeak()
    }, 400)
    return () => clearTimeout(timer)
  }, [currentRound, currentLang])

  const handleCheckSpelling = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isAnswered || !userInput.trim()) return

    const normalizedUser = normalizePtText(userInput.trim())
    const normalizedTarget = normalizePtText(langContent.word)

    const match = normalizedUser === normalizedTarget
    setIsAnswered(true)
    setIsCorrect(match)

    if (match) {
      playSound('correct')
      setScore((prev) => prev + (showHint ? 20 : 30))
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
      setUserInput('')
      setIsAnswered(false)
      setIsCorrect(false)
      setShowHint(false)
    }
  }

  const finishGame = () => {
    setIsCompleted(true)
    playSound('fanfare')

    const accuracy = Math.round((correctCount / totalRounds) * 100)
    const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1

    const sessionChild = child || {
      id: childId || 'arthur_demo_id',
      user_id: 'demo_user',
      name: 'Arthur (Junior)',
      birth_date: new Date().toISOString(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }

    offlineSyncService.saveSession({
      user_id: sessionChild.user_id || 'demo_user',
      child_id: sessionChild.id,
      module_id: 'junior_dictation',
      game_id: 'junior_dictation_game',
      game_title: 'Ditado & Soletração Inteligente',
      stars,
      score,
      accuracy,
      rounds_completed: totalRounds,
      total_rounds: totalRounds,
      language: currentLang,
      details: {
        correctCount,
        totalWords: totalRounds,
        isJunior: true,
      },
    })
  }

  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0]

  if (isCompleted) {
    const accuracy = Math.round((correctCount / totalRounds) * 100)
    const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1

    return (
      <GameShell title="Ditado de Voz & Ortografia Junior" onBack={() => navigate('/junior')}>
        <CelebrationScreen
          title="Ditado Concluído! ✍️"
          subtitle="Módulo CogniKids Junior: Escrita e Ortografia Multilíngue"
          childName={child?.name || 'Arthur'}
          childId={child?.id}
          score={score}
          accuracy={accuracy}
          stars={stars}
          roundsCompleted={totalRounds}
          totalRounds={totalRounds}
          practicedWords={words.slice(0, totalRounds).map((w) => getLangData(w, currentLang).word)}
          onPlayAgain={() => {
            setIsCompleted(false)
            setCurrentRound(0)
            setScore(0)
            setUserInput('')
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
      title="CogniKids Junior: Ditado & Ortografia"
      score={score}
      stars={3}
      currentRound={currentRound + 1}
      totalRounds={totalRounds}
      onBack={() => navigate('/junior')}
      onNextRound={handleNext}
      nextLabel="Avançar"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Language selector */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500">Idioma do Ditado:</span>
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
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{l.flag}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dictation Card */}
        <Card className="p-6 sm:p-8 rounded-3xl border-2 border-purple-200 bg-gradient-to-b from-white via-purple-50/20 to-indigo-50/20 shadow-md text-center space-y-6">
          <div className="flex justify-between items-center">
            <Badge className="bg-purple-100 text-purple-900 font-bold border-purple-200 text-xs">
              {currentItem.category}
            </Badge>
            <span className="text-xs font-bold text-slate-400">Escute & Digite</span>
          </div>

          <div className="py-2">
            <Button
              size="lg"
              onClick={handleSpeak}
              disabled={isSpeaking}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white shadow-lg mx-auto flex flex-col items-center justify-center gap-1"
            >
              <Volume2 className={`w-8 h-8 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Ouvir</span>
            </Button>
            <p className="text-xs text-slate-500 mt-3 font-semibold">
              Toque para ouvir a palavra falada pelo Tico
            </p>
          </div>

          {/* User Input Form */}
          <form onSubmit={handleCheckSpelling} className="space-y-4 max-w-md mx-auto">
            <div className="relative">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isAnswered}
                placeholder="Digite a palavra que ouviu..."
                className="h-14 text-center text-xl font-bold rounded-2xl border-2 border-purple-200 focus:border-purple-500 bg-white"
                autoFocus
              />
            </div>

            {!isAnswered ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHint(true)}
                  className="rounded-2xl border-purple-200 text-purple-700 text-xs"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Dica
                </Button>
                <Button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="flex-1 h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md"
                >
                  Verificar Escrita
                </Button>
              </div>
            ) : (
              <div
                className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 text-left">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <p>
                      {isCorrect
                        ? 'Perfeito! Grafia correta.'
                        : `Grafia correta: ${langContent.word}`}
                    </p>
                    <p className="text-xs font-normal opacity-80">{langContent.phonetic}</p>
                  </div>
                </div>
              </div>
            )}
          </form>

          {showHint && !isAnswered && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Dica: "{langContent.hint}" (Inicia com "{langContent.word[0]}")
              </span>
            </div>
          )}
        </Card>

        {isAnswered && (
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleNext}
              className="rounded-2xl px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md hover:from-purple-700 hover:to-indigo-700"
            >
              <span>{currentRound + 1 >= totalRounds ? 'Ver Resultado' : 'Próxima Palavra'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </GameShell>
  )
}
