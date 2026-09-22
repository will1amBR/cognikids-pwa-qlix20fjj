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
  Loader2,
  AlertCircle,
  Play,
  SkipForward,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { CelebrationScreen } from '@/components/celebration/CelebrationScreen'
import { ItemIllustration } from './ItemIllustration'

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
  const [hasInteractedAudio, setHasInteractedAudio] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [micStatus, setMicStatus] = useState<
    'idle' | 'requesting' | 'recording' | 'denied' | 'unsupported'
  >('idle')
  const [micAudioLevel, setMicAudioLevel] = useState(0)
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

  // When round changes, only play sound/speech if user has already unlocked audio via interaction
  useEffect(() => {
    if (step === 'completed' || !currentAnimal) return

    setStep('intro')
    setTranscript('')
    setEvaluation(null)
    setTicoMood('talking')
    setTicoMessage(`${currentAnimal.name}! 🎙️`)

    // Don't auto-trigger audio on mount without previous user gesture
    if (!hasInteractedAudio) {
      setTicoMessage(`Toque em "Ouvir Som" para começar a brincadeira! 🔊`)
      return
    }

    const introText = `${currentAnimal.name}! ${currentAnimal.actionDescription}`
    const promptText = currentAnimal.promptText || `Agora fale: ${currentAnimal.name}!`

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
    }, 500)

    return () => clearTimeout(timer)
  }, [currentRoundIdx, currentAnimal, gameLanguage, isFirstWordsMode, hasInteractedAudio])

  // Destravar áudio via interação do usuário
  const handleUnlockAndPlaySound = (slow = false) => {
    setHasInteractedAudio(true)
    playPop()
    if (!currentAnimal) return
    playAnimalSound(currentAnimal.soundKey)
    const langOption = SUPPORTED_LANGUAGES.find((l) => l.code === gameLanguage)
    const textToSpeak = `${currentAnimal.name}! ${currentAnimal.promptText || `Agora fale: ${currentAnimal.name}!`}`
    if (slow || isFirstWordsMode) {
      speechService.speakSlow(textToSpeak, {
        lang: langOption?.speechLang || 'pt-BR',
      })
    } else {
      speechService.speak(textToSpeak, {
        lang: langOption?.speechLang || 'pt-BR',
      })
    }
  }

  // Start Voice Recording with complete feedback states
  const handleStartRecording = async () => {
    if (!currentAnimal) return
    setHasInteractedAudio(true)
    playPop()
    speechService.stop()
    setIsRecording(true)
    setMicStatus('requesting')
    setTranscript('')
    setStep('listening')
    setTicoMood('listening')
    setTicoMessage(`Aguardando microfone... 🎙️`)

    if (!speechRecognitionService.isSupported()) {
      setMicStatus('unsupported')
      setTicoMessage(`Microfone não disponível neste navegador. Não se preocupe!`)
      return
    }

    const langOption = SUPPORTED_LANGUAGES.find((l) => l.code === gameLanguage)
    const speechLang = langOption ? langOption.speechLang : 'pt-BR'

    try {
      await speechRecognitionService.startListening({
        lang: speechLang,
        onAudioLevel: (lvl) => {
          if (isMountedRef.current) {
            setMicAudioLevel(lvl)
            if (lvl > 5 && micStatus !== 'recording') {
              setMicStatus('recording')
              setTicoMessage(`Estou ouvindo você... fale "${currentAnimal.name}"! 🎙️`)
            }
          }
        },
        onResult: (res) => {
          if (!isMountedRef.current) return
          setTranscript(res.transcript)
          setMicStatus('recording')
          setTicoMessage(`Ouvindo: "${res.transcript}"...`)
          if (res.isFinal) {
            handleStopRecording(res.transcript)
          }
        },
        onError: (err) => {
          console.warn('Recognition notice', err)
          if (!isMountedRef.current) return
          if (err === 'not-allowed' || err === 'service-not-allowed') {
            setMicStatus('denied')
            setTicoMessage(`Permissão do microfone negada. Toque em permitir ou pule!`)
          } else {
            // Other error - allow fallback
            setMicStatus('recording')
          }
        },
      })
      // If no explicit error after 600ms, set recording state
      setTimeout(() => {
        if (isMountedRef.current && micStatus === 'requesting') {
          setMicStatus('recording')
          setTicoMessage(`Estou ouvindo você... fale "${currentAnimal.name}"! 🎙️`)
        }
      }, 700)
    } catch (err) {
      console.warn('Microphone start error', err)
      setMicStatus('denied')
    }

    // Max recording duration safeguard
    setTimeout(() => {
      if (isMountedRef.current && isRecording) {
        handleStopRecording()
      }
    }, 4500)
  }

  const handleStopRecording = (forcedTranscript?: string) => {
    if (
      !isRecording &&
      step !== 'listening' &&
      micStatus !== 'recording' &&
      micStatus !== 'requesting'
    )
      return
    if (!currentAnimal) return
    setIsRecording(false)
    setMicStatus('idle')
    setMicAudioLevel(0)
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

  // Pular rodada com nota amigável de incentivo se microfone não estiver disponível
  const handleSkipOrFallback = () => {
    if (!currentAnimal) return
    speechService.stop()
    speechRecognitionService.stopListening()
    setIsRecording(false)
    setMicStatus('idle')

    const fallbackResult: EvaluationResult = {
      score: 85,
      stars: 2,
      isRecognized: true,
      praise: `Muito bem! Você conheceu o ${currentAnimal.name}! 🌟`,
      feedback: `Você ouviu com atenção!`,
      matchType: 'partial',
    }

    setEvaluation(fallbackResult)
    setSessionResults((prev) => [...prev, fallbackResult])
    setStep('feedback')
    playStarReward(2)
    setTicoMood('celebrating')
    setTicoMessage(fallbackResult.praise)
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

      const wordResults = roundsList.map((r, idx) => {
        const evalRes = allResults[idx]
        return {
          word: r.name,
          score: evalRes ? evalRes.score : 80,
          stars: evalRes ? evalRes.stars : 2,
          isRecognized: evalRes ? evalRes.isRecognized : true,
        }
      })

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
          wordResults,
        },
      })
    }
  }
  const handleReplayPrompt = (slow = false) => {
    if (!currentAnimal) return
    setHasInteractedAudio(true)
    playAnimalSound(currentAnimal.soundKey)
    const langOption = SUPPORTED_LANGUAGES.find((l) => l.code === gameLanguage)
    const textToSpeak = currentAnimal.promptText || currentAnimal.name
    if (slow || isFirstWordsMode) {
      speechService.speakSlow(textToSpeak, {
        lang: langOption?.speechLang || 'pt-BR',
      })
    } else {
      speechService.speak(textToSpeak, {
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

    const practicedWordsData = roundsList.map((r, idx) => {
      const evalRes = sessionResults[idx]
      return {
        word: r.name,
        score: evalRes ? evalRes.score : 85,
        stars: evalRes ? evalRes.stars : 3,
        isRecognized: evalRes ? evalRes.isRecognized : true,
      }
    })

    return (
      <GameShell
        title="Fala & Linguagem"
        moduleColor="#FF7A45"
        currentRound={totalRounds}
        totalRounds={totalRounds}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
        ticoInstruction={`Incrível, ${child.name}! Você praticou com muita alegria!`}
      >
        <CelebrationScreen
          childName={child.name}
          score={totalScore}
          accuracy={totalScore}
          stars={totalStars}
          roundsCompleted={totalRounds}
          totalRounds={totalRounds}
          categoryName={isFirstWordsMode ? 'Primeiras Palavras' : activeCategoryInfo?.name}
          practicedWords={practicedWordsData}
          onPlayAgain={() => {
            setCurrentRoundIdx(0)
            setSessionResults([])
            setStep('intro')
          }}
          onExit={() => navigate(`/app/child/${child.id}`)}
          exitLabel="Voltar ao progresso"
          isJunior={false}
        />
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
      onNextRound={handleNextRound}
      nextLabel="Avançar"
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

        {/* Animal / Item Stage Card with Rich Vector Illustration */}
        <div
          className={`w-full bg-gradient-to-br ${currentAnimal.bgGradient} rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 border-2 border-white/20`}
        >
          {/* Sound replay button */}
          <button
            onClick={() => handleUnlockAndPlaySound(false)}
            className="absolute top-4 right-4 px-3 py-2 rounded-2xl bg-white/25 hover:bg-white/40 backdrop-blur-md flex items-center gap-1.5 text-white transition-all active:scale-95 shadow-sm text-xs font-bold"
            title="Ouvir som novamente"
            aria-label="Ouvir som"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Ouvir</span>
          </button>

          {/* First audio unlock banner if not interacted yet */}
          {!hasInteractedAudio && (
            <button
              onClick={() => handleUnlockAndPlaySound(false)}
              className="mb-3 px-4 py-2 rounded-full bg-white text-orange-600 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 animate-bounce hover:bg-orange-50 transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-orange-600 text-orange-600" />
              <span>Toque para Ouvir o Som do Bicho 🔊</span>
            </button>
          )}

          {/* Rich Vector Illustration (with emoji fallback) */}
          <div className="relative my-1 flex items-center justify-center animate-float">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl transform scale-90" />
            <div className="relative bg-white/30 backdrop-blur-sm p-4 rounded-3xl shadow-inner border border-white/30 flex items-center justify-center">
              <ItemIllustration
                itemId={currentAnimal.id}
                fallbackEmoji={currentAnimal.emoji}
                size="xl"
                altText={currentAnimal.name}
              />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm mt-3 text-center">
            {currentAnimal.name}
          </h2>

          {/* Syllables breakdown pill */}
          {currentAnimal.syllables && (
            <div className="mt-1 bg-white/25 backdrop-blur-md px-3 py-0.5 rounded-full text-white font-extrabold text-xs tracking-widest uppercase shadow-sm">
              {currentAnimal.syllables[gameLanguage] ||
                currentAnimal.syllables['pt-BR'] ||
                currentAnimal.name}
            </div>
          )}

          <p className="text-xs sm:text-sm font-semibold text-white/95 text-center mt-1 max-w-xs">
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
              </Button>
            </div>
          </div>
        ) : (
          /* Mic Recording Trigger with all states feedback */
          <div className="w-full flex flex-col items-center gap-3">
            {/* Microfone Negado */}
            {micStatus === 'denied' && (
              <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col items-center text-center gap-2 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>Microfone bloqueado</span>
                </div>
                <p className="text-xs text-rose-600 max-w-sm">
                  Para falar com o Tico, permita o microfone no navegador. Ou clique abaixo para
                  avançar!
                </p>
                <div className="flex gap-2 mt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleStartRecording}
                    className="rounded-xl border-rose-300 text-rose-700 text-xs font-bold"
                  >
                    Tentar Permitir Novamente
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSkipOrFallback}
                    className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                  >
                    <SkipForward className="w-3.5 h-3.5 mr-1" />
                    Pular e Ganhar Estrelas
                  </Button>
                </div>
              </div>
            )}

            {/* Microfone Não Suportado */}
            {micStatus === 'unsupported' && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col items-center text-center gap-2 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>Navegador sem reconhecimento de fala</span>
                </div>
                <p className="text-xs text-amber-700 max-w-sm">
                  Você pode ouvir os sons e repetir com a criança, e avançar para a próxima rodada!
                </p>
                <Button
                  size="sm"
                  onClick={handleSkipOrFallback}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold mt-1"
                >
                  <SkipForward className="w-3.5 h-3.5 mr-1" />
                  Continuar Jogando
                </Button>
              </div>
            )}

            {/* Permissão Pendente / Solicitando */}
            {micStatus === 'requesting' && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-full bg-amber-500 text-white shadow-xl flex items-center justify-center animate-pulse">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-amber-700">
                  Aguardando permissão do microfone...
                </span>
              </div>
            )}

            {/* Gravando / Ouvindo */}
            {micStatus === 'recording' && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleStopRecording()}
                  className="w-24 h-24 rounded-full bg-rose-500 text-white shadow-2xl flex items-center justify-center animate-pulse ring-8 ring-rose-200 transition-all"
                  aria-label="Gravando voz - clique para parar"
                >
                  <Mic className="w-12 h-12" />
                </button>
                {/* Visual sound wave bar */}
                <div className="flex items-center gap-1 h-3 mt-1">
                  <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:300ms]" />
                  <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce [animation-delay:200ms]" />
                  <span className="w-1.5 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:100ms]" />
                </div>
                <span className="text-xs font-black text-rose-600">
                  {transcript ? `"${transcript}"` : 'Ouvindo você... Toque para finalizar'}
                </span>
                <button
                  onClick={handleSkipOrFallback}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline mt-1"
                >
                  Não consigo falar agora? Pular palavra
                </button>
              </div>
            )}

            {/* Estado Inicial / Idle */}
            {micStatus === 'idle' && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleStartRecording}
                  className="w-24 h-24 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 flex items-center justify-center active:scale-95 transition-all group ring-4 ring-orange-200"
                  aria-label="Aperte para falar"
                >
                  <Mic className="w-12 h-12 group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-xs sm:text-sm font-black text-slate-700 text-center">
                  Toque no microfone e fale "{currentAnimal.name}"
                </span>
                <button
                  onClick={handleSkipOrFallback}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline"
                >
                  Pular palavra
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </GameShell>
  )
}
