import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { calculateAgeMonths } from '@/types/cognikids'
import {
  AnimalItem,
  WORD_CATEGORIES,
  getItemsByCategory,
  getFirstWordsItems,
  CategoryInfo,
} from './farmAnimalsData'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { speechRecognitionService } from '@/lib/speechRecognition'
import { evaluateSpeechAccuracy, EvaluationResult } from '@/lib/fuzzyMatching'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { useLanguage } from '@/context/LanguageContext'
import type { AppLanguage } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import {
  Mic,
  Star,
  Sparkles,
  Volume2,
  ArrowRight,
  RotateCcw,
  Check,
  Trophy,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'

interface FazendaFalanteGameProps {
  child: Child
}

type StepState = 'intro' | 'listening' | 'evaluating' | 'feedback' | 'completed'

export const FazendaFalanteGame: React.FC<FazendaFalanteGameProps> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory, playAnimalSound } = useSound()
  const { language: uiLang, t } = useLanguage()

  // Language state for this game
  const [gameLanguage, setGameLanguage] = useState<AppLanguage>(() => {
    if (
      child.primary_language &&
      SUPPORTED_LANGUAGES.some((l) => l.code === child.primary_language)
    ) {
      return child.primary_language as AppLanguage
    }
    if (
      child.learning_languages &&
      Array.isArray(child.learning_languages) &&
      child.learning_languages.length > 0
    ) {
      const first = child.learning_languages[0] as AppLanguage
      if (SUPPORTED_LANGUAGES.some((l) => l.code === first)) return first
    }
    return uiLang
  })

  const childAgeMonths = calculateAgeMonths(child.birth_date)
  const [selectedCategory, setSelectedCategory] = useState<string>('farm')
  const [isFirstWordsMode, setIsFirstWordsMode] = useState<boolean>(false)

  // Calibrate rounds based on age (younger = 4 rounds, older = 5-6 rounds)
  const totalRounds = isFirstWordsMode ? 4 : childAgeMonths <= 24 ? 4 : 5

  const [roundsList, setRoundsList] = useState<AnimalItem[]>([])
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [step, setStep] = useState<StepState>('intro')
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [sessionResults, setSessionResults] = useState<EvaluationResult[]>([])
  const [ticoMessage, setTicoMessage] = useState('')
  const [ticoMood, setTicoMood] = useState<'happy' | 'talking' | 'celebrating' | 'listening'>(
    'talking',
  )
  const [showCategorySelector, setShowCategorySelector] = useState(false)

  const isMountedRef = useRef(true)

  // Initialize rounds when category changes, language changes or component mounts
  useEffect(() => {
    let pool: AnimalItem[]
    if (isFirstWordsMode) {
      pool = getFirstWordsItems(gameLanguage)
    } else {
      const items = getItemsByCategory(selectedCategory, gameLanguage)
      // Filter by child age if possible, or fallback to all in category
      const ageAppropriate = items.filter((i) => i.minAgeMonths <= childAgeMonths + 6)
      pool = ageAppropriate.length >= 3 ? ageAppropriate : items
    }
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, totalRounds)
    setRoundsList(shuffled)
    setCurrentRoundIdx(0)
    setSessionResults([])
    setStep('intro')
  }, [isFirstWordsMode, selectedCategory, childAgeMonths, totalRounds, gameLanguage])

  const currentAnimal = roundsList[currentRoundIdx] || roundsList[0]

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      speechService.stop()
      speechRecognitionService.stopListening()
    }
  }, [])

  // When round changes, play intro sound and spoken explanation
  useEffect(() => {
    if (step === 'completed' || !currentAnimal) return

    setStep('intro')
    setTranscript('')
    setEvaluation(null)
    setTicoMood('talking')

    const introText = `${currentAnimal.name}! ${currentAnimal.actionDescription}`
    const promptText = currentAnimal.promptText || `Agora fale: ${currentAnimal.name}!`
    setTicoMessage(`${currentAnimal.name}! 🎙️`)

    // 1. Play animal sound effect
    playAnimalSound(currentAnimal.soundKey)

    // 2. Speak animal description + prompt in chosen language
    const langOption = SUPPORTED_LANGUAGES.find((l) => l.code === gameLanguage)
    const speechLang = langOption ? langOption.speechLang : 'pt-BR'

    const timer = setTimeout(() => {
      if (isFirstWordsMode) {
        speechService.speakSlow(`${introText} ${promptText}`, {
          lang: speechLang,
          onEnd: () => {
            if (isMountedRef.current && step === 'intro') {
              setTicoMessage(`${currentAnimal.name}! 🎙️`)
            }
          },
        })
      } else {
        speechService.speak(`${introText} ${promptText}`, {
          lang: speechLang,
          onEnd: () => {
            if (isMountedRef.current && step === 'intro') {
              setTicoMessage(`${currentAnimal.name}! 🎙️`)
            }
          },
        })
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [currentRoundIdx, currentAnimal, gameLanguage, isFirstWordsMode])

  // Start Voice Recording
  const handleStartRecording = async () => {
    if (!currentAnimal) return
    playPop()
    speechService.stop()
    setIsRecording(true)
    setTranscript('')
    setStep('listening')
    setTicoMood('listening')
    setTicoMessage(`Estou ouvindo você... fale "${currentAnimal.name}"! 🎙️`)

    const langOption = SUPPORTED_LANGUAGES.find((l) => l.code === gameLanguage)
    const speechLang = langOption ? langOption.speechLang : 'pt-BR'

    await speechRecognitionService.startListening({
      lang: speechLang,
      onAudioLevel: () => {},
      onResult: (res) => {
        if (!isMountedRef.current) return
        setTranscript(res.transcript)
        if (res.isFinal) {
          handleStopRecording(res.transcript)
        }
      },
      onError: (err) => {
        console.warn('Recognition fallback', err)
      },
    })

    // Max recording duration safeguard
    setTimeout(() => {
      if (isMountedRef.current && isRecording) {
        handleStopRecording()
      }
    }, 4500)
  }

  const handleStopRecording = (forcedTranscript?: string) => {
    if (!isRecording && step !== 'listening') return
    if (!currentAnimal) return
    setIsRecording(false)
    speechRecognitionService.stopListening()

    const finalSaid = forcedTranscript || transcript || currentAnimal.name
    setStep('evaluating')
    setTicoMood('talking')

    // Run fuzzy word evaluation
    const result = evaluateSpeechAccuracy(
      finalSaid,
      currentAnimal.name,
      currentAnimal.acceptedAliases,
      childAgeMonths,
      gameLanguage,
    )

    setEvaluation(result)
    setSessionResults((prev) => [...prev, result])
    setStep('feedback')

    // Play star sound reward
    playStarReward(result.stars)
    setTicoMood(result.stars >= 2 ? 'celebrating' : 'talking')
    setTicoMessage(result.praise)

    // Speak praise
    const langOption = SUPPORTED_LANGUAGES.find((l) => l.code === gameLanguage)
    speechService.speak(result.praise, { lang: langOption?.speechLang || 'pt-BR' })
  }

  // Move to next round or finish
  const handleNextRound = async () => {
    playPop()
    speechService.stop()

    if (currentRoundIdx + 1 < totalRounds) {
      setCurrentRoundIdx((prev) => prev + 1)
    } else {
      // Completed full session
      setStep('completed')
      playVictory()
      setTicoMood('celebrating')
      setTicoMessage(`Parabéns, ${child.name}! Você arrasou falando todas as palavrinhas! 🏆`)

      const allResults = [...sessionResults, ...(evaluation ? [evaluation] : [])]
      const avgScore = allResults.length
        ? Math.round(allResults.reduce((a, b) => a + b.score, 0) / allResults.length)
        : 90
      const avgStars = Math.max(1, Math.min(3, Math.round(avgScore / 33.3)))

      const categoryName = isFirstWordsMode
        ? 'Primeiras Palavras'
        : WORD_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Palavras'

      await offlineSyncService.queueGameSession({
        user_id: child.user_id,
        child_id: child.id,
        module_id: 'speech',
        game_id: 'fazenda_falante',
        game_title: `Fala & Voz: ${categoryName}${isFirstWordsMode ? ' (Primeiras Palavras)' : ''}`,
        stars: avgStars,
        score: avgScore,
        accuracy: avgScore,
        rounds_completed: totalRounds,
        total_rounds: totalRounds,
        language: gameLanguage,
        details: {
          category: isFirstWordsMode ? 'primeiras_palavras' : selectedCategory,
          language: gameLanguage,
          isFirstWordsMode,
          items: roundsList.map((r) => r.name),
        },
      })
    }
  }

  const handleReplayPrompt = (slow = false) => {
    if (!currentAnimal) return
    playAnimalSound(currentAnimal.soundKey)
    const langOption = SUPPORTED_LANGUAGES.find((l) => l.code === gameLanguage)
    if (slow || isFirstWordsMode) {
      speechService.speakSlow(currentAnimal.promptText || currentAnimal.name, {
        lang: langOption?.speechLang || 'pt-BR',
      })
    } else {
      speechService.speak(currentAnimal.promptText || currentAnimal.name, {
        lang: langOption?.speechLang || 'pt-BR',
      })
    }
  }

  // Completed Screen
  if (step === 'completed') {
    const totalScore = sessionResults.length
      ? Math.round(sessionResults.reduce((a, b) => a + b.score, 0) / sessionResults.length)
      : 92
    const totalStars = Math.max(1, Math.min(3, Math.round(totalScore / 33.3)))
    const activeCategoryInfo = WORD_CATEGORIES.find((c) => c.id === selectedCategory)

    return (
      <GameShell
        title="Fala & Linguagem"
        moduleColor="#FF7A45"
        currentRound={totalRounds}
        totalRounds={totalRounds}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
        ticoInstruction={`Incrível, ${child.name}! Você praticou com alegria!`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-orange-200 shadow-2xl flex flex-col items-center text-center max-w-lg mx-auto w-full animate-fade-in">
          <div className="relative mb-3">
            <TicoMascot size="lg" mood="celebrating" />
            <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🌟</div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Partida Concluída! 🎉</h2>
          <p className="text-sm text-slate-500 mt-1">
            {child.name} completou {totalRounds} palavras da categoria{' '}
            <span className="font-bold text-orange-600">{activeCategoryInfo?.name}</span>!
          </p>

          {/* Stars */}
          <div className="flex items-center gap-3 my-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all duration-500 ${
                  idx < totalStars
                    ? 'bg-amber-400 text-white scale-110 rotate-3'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                <Star className="w-8 h-8 fill-current" />
              </div>
            ))}
          </div>

          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 w-full mb-6">
            <div className="flex justify-between items-center text-xs font-bold text-orange-950">
              <span>Precisão da Fala:</span>
              <span className="text-base text-orange-600">{totalScore}%</span>
            </div>
            <div className="w-full bg-orange-200/60 h-3 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${totalScore}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={() => {
                setCurrentRoundIdx(0)
                setSessionResults([])
                setStep('intro')
              }}
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-slate-300 font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Jogar de novo
            </Button>
            <Button
              onClick={() => navigate(`/app/child/${child.id}`)}
              className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/25"
            >
              Voltar ao progresso
            </Button>
          </div>
        </div>
      </GameShell>
    )
  }

  if (!currentAnimal) return null

  return (
    <GameShell
      title="Fala & Linguagem"
      moduleColor="#FF7A45"
      currentRound={currentRoundIdx + 1}
      totalRounds={totalRounds}
      exitPath={`/app/child/${child.id}`}
      ticoMood={ticoMood}
      ticoInstruction={ticoMessage}
    >
      <div className="w-full max-w-lg flex flex-col items-center justify-between gap-4">
        {/* Top bar: First Words Toggle + Category Selector Pills & Language Switcher */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5">
              {/* Special First Words mode button */}
              <button
                onClick={() => {
                  playPop()
                  setIsFirstWordsMode(true)
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition-all flex items-center gap-1.5 ${
                  isFirstWordsMode
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105 ring-2 ring-amber-300'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                }`}
              >
                <span>🍼</span>
                <span>Primeiras Palavras</span>
                <span className="text-[9px] bg-white/30 px-1.5 py-0.2 rounded-full uppercase">
                  Iniciante
                </span>
              </button>

              {WORD_CATEGORIES.map((cat) => {
                const isSelected = !isFirstWordsMode && selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playPop()
                      setIsFirstWordsMode(false)
                      setSelectedCategory(cat.id)
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-105'
                        : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Activity Language Selector */}
            <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full border border-orange-200 shadow-sm shrink-0">
              <Globe className="w-3.5 h-3.5 text-orange-600" />
              <select
                value={gameLanguage}
                onChange={(e) => {
                  playPop()
                  setGameLanguage(e.target.value as AppLanguage)
                }}
                className="text-xs font-bold text-orange-950 bg-transparent outline-none cursor-pointer"
                aria-label="Idioma da Atividade"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Syllable and slow articulation banner for First Words mode */}
          {isFirstWordsMode && (
            <div className="w-full bg-amber-500/10 border border-amber-300/80 rounded-2xl px-3.5 py-2 flex items-center justify-between gap-2 text-amber-900 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <b>Modo Primeiras Palavras ({gameLanguage.toUpperCase()}):</b> Ritmo calmo,
                  fonemas simples e sílabas pausadas!
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleReplayPrompt(true)}
                className="px-2 py-0.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[11px] shrink-0"
              >
                Ouvir Devagar 🐢
              </button>
            </div>
          )}
        </div>

        {/* Animal / Item Stage Card */}
        <div
          className={`w-full bg-gradient-to-br ${currentAnimal.bgGradient} rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500`}
        >
          {/* Sound replay button */}
          <button
            onClick={() => handleReplayPrompt(false)}
            className="absolute top-4 right-4 w-11 h-11 rounded-2xl bg-white/25 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95 shadow-sm"
            title="Ouvir som novamente"
            aria-label="Ouvir som"
          >
            <Volume2 className="w-6 h-6" />
          </button>

          {/* Big Emoji / Visual */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center text-7xl sm:text-8xl drop-shadow-lg animate-float">
            {currentAnimal.emoji}
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm mt-2 text-center">
            {currentAnimal.name}
          </h2>

          {/* Syllables breakdown pill when in First Words Mode or if syllable data exists */}
          {currentAnimal.syllables && (
            <div className="mt-1 bg-white/25 backdrop-blur-md px-3 py-0.5 rounded-full text-white font-extrabold text-xs tracking-widest uppercase shadow-sm">
              {currentAnimal.syllables[gameLanguage] ||
                currentAnimal.syllables['pt-BR'] ||
                currentAnimal.name}
            </div>
          )}

          <p className="text-xs sm:text-sm font-semibold text-white/90 text-center mt-1 max-w-xs">
            {currentAnimal.actionDescription}
          </p>
        </div>

        {/* Interaction Stage: Microphone or Feedback */}
        {step === 'feedback' && evaluation ? (
          /* Feedback Box */
          <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-orange-100 shadow-xl flex flex-col items-center text-center animate-fade-in">
            {/* Stars */}
            <div className="flex items-center gap-2 mb-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-8 h-8 ${
                    idx < evaluation.stars
                      ? 'text-amber-400 fill-amber-400 scale-110'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>

            <p className="text-base sm:text-lg font-black text-slate-800">{evaluation.praise}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {transcript ? `Ouvimos: "${transcript}"` : evaluation.feedback}
            </p>

            <div className="w-full mt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={handleStartRecording}
                className="flex-1 h-12 rounded-2xl border-slate-300 font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Tentar de novo
              </Button>
              <Button
                onClick={handleNextRound}
                className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/25"
              >
                <span>{t('game.nextWord')}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>{' '}
            </div>
          </div>
        ) : (
          /* Mic Recording Trigger */
          <div className="flex flex-col items-center gap-3">
            {isRecording ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleStopRecording()}
                  className="w-24 h-24 rounded-full bg-rose-500 text-white shadow-2xl flex items-center justify-center animate-pulse ring-8 ring-rose-200"
                  aria-label="Gravando voz"
                >
                  <Mic className="w-12 h-12" />
                </button>
                <span className="text-xs font-bold text-rose-600 animate-pulse">
                  Ouvindo... Toque para finalizar
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleStartRecording}
                  className="w-24 h-24 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 flex items-center justify-center active:scale-95 transition-all group"
                  aria-label="Aperte para falar"
                >
                  <Mic className="w-12 h-12 group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-xs sm:text-sm font-black text-slate-700">
                  Toque no microfone e fale "{currentAnimal.name}"
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </GameShell>
  )
}
