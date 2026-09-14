import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GameShell } from '@/components/layout/GameShell'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { CelebrationScreen } from '@/components/celebration/CelebrationScreen'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSound } from '@/context/SoundContext'
import { speechService } from '@/lib/speechSynthesis'
import { speechRecognitionService } from '@/lib/speechRecognition'
import { evaluateSpeechAccuracy } from '@/lib/fuzzyMatching'
import { offlineSyncService } from '@/lib/offlineSync'
import { fetchChildById } from '@/services/children'
import { JUNIOR_VOCABULARY_LIST, JuniorWordItem } from './juniorContentData'
import type { AppLanguage, Child } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Trophy,
} from 'lucide-react'

interface JuniorGameProps {
  child?: Child | null
}

export const JuniorVocabBuilderGame: React.FC<JuniorGameProps> = ({ child: initialChild }) => {
  const { childId: routeChildId } = useParams<{ childId: string }>()
  const childId = initialChild?.id || routeChildId
  const navigate = useNavigate()
  const { playSound } = useSound()

  const [child, setChild] = useState<Child | null>(initialChild || null)
  const [currentLang, setCurrentLang] = useState<AppLanguage>('pt-BR')
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [stars, setStars] = useState<number>(3)
  const [isListening, setIsListening] = useState<boolean>(false)
  const [speechTranscript, setSpeechTranscript] = useState<string>('')
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null)
  const [wordResults, setWordResults] = useState<any[]>([])
  const [mode, setMode] = useState<'word' | 'phrase'>('word')
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)

  const words = JUNIOR_VOCABULARY_LIST
  const totalRounds = words.length
  const currentItem: JuniorWordItem = words[currentRound] || words[0]

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

  // Speak word or phrase
  const handleSpeak = async (text: string) => {
    setIsSpeaking(true)
    try {
      await speechService.speak(text, { lang: currentLang })
    } catch (_) {
      // ignore
    } finally {
      setIsSpeaking(false)
    }
  }

  // Voice Recognition
  const handleToggleListening = () => {
    if (isListening) {
      speechRecognitionService.stopListening()
      setIsListening(false)
      return
    }

    setSpeechTranscript('')
    setSpeechFeedback(null)
    setIsListening(true)
    playSound('pop')

    const targetText = mode === 'word' ? langContent.word : langContent.phrase

    speechRecognitionService.startListening({
      lang: currentLang,
      onResult: (result) => {
        setSpeechTranscript(result.transcript)
        if (result.isFinal) {
          setIsListening(false)
          evaluateSpoken(result.transcript, targetText)
        }
      },
      onError: (err) => {
        setIsListening(false)
        console.warn('Speech error', err)
      },
      onEnd: () => {
        setIsListening(false)
      },
    })
  }

  const evaluateSpoken = (transcript: string, targetText: string) => {
    const evalRes = evaluateSpeechAccuracy(transcript, targetText)
    const accuracy = evalRes.score || 80

    let points = 20
    if (accuracy >= 80) {
      playSound('correct')
      setSpeechFeedback(`Excelente! Precisão de ${accuracy}%! 🎉`)
      points = 30
    } else if (accuracy >= 60) {
      playSound('pop')
      setSpeechFeedback(`Muito bom! Precisão de ${accuracy}%. Quase perfeito!`)
      points = 20
    } else {
      playSound('pop')
      setSpeechFeedback(`Continue tentando! Você disse: "${transcript}"`)
      points = 10
    }

    setScore((prev) => prev + points)
    setWordResults((prev) => [
      ...prev,
      {
        word: langContent.word,
        language: currentLang,
        score: accuracy,
        isRecognized: accuracy >= 60,
        transcript,
      },
    ])
  }

  const handleNextRound = () => {
    playSound('pop')
    setSpeechTranscript('')
    setSpeechFeedback(null)

    if (currentRound + 1 >= totalRounds) {
      finishGame()
    } else {
      setCurrentRound((prev) => prev + 1)
    }
  }

  const finishGame = () => {
    setIsCompleted(true)
    playSound('fanfare')

    const calculatedStars = score > 100 ? 3 : score > 50 ? 2 : 1
    setStars(calculatedStars)

    if (childId && child) {
      offlineSyncService.saveSession({
        user_id: child.user_id,
        child_id: child.id,
        module_id: 'junior_vocab',
        game_id: 'junior_vocab_builder',
        game_title: 'Construtor de Vocabulário & Frases',
        stars: calculatedStars,
        score: score,
        accuracy: Math.min(100, Math.round((score / (totalRounds * 30)) * 100)),
        rounds_completed: totalRounds,
        total_rounds: totalRounds,
        language: currentLang,
        details: {
          wordResults,
          items: words.map((w) => getLangData(w, currentLang).word),
          isJunior: true,
        },
      })
    }
  }

  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0]

  if (isCompleted) {
    const accuracyVal = Math.min(100, Math.round((score / (totalRounds * 30)) * 100))
    return (
      <GameShell title="Mestre do Vocabulário Junior" onBack={() => navigate('/junior')}>
        <CelebrationScreen
          title="Vocabulário Dominado! 🗣️"
          subtitle="Módulo CogniKids Junior: Expressão Oral e Fluência Multilíngue"
          childName="Junior"
          score={score}
          accuracy={accuracyVal}
          stars={stars}
          roundsCompleted={totalRounds}
          totalRounds={totalRounds}
          practicedWords={wordResults.map((r) => ({
            word: r.word,
            score: r.score,
            isRecognized: r.score >= 70,
          }))}
          onPlayAgain={() => {
            setIsCompleted(false)
            setCurrentRound(0)
            setScore(0)
            setWordResults([])
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
      title="CogniKids Junior: Mestre do Vocabulário"
      score={score}
      stars={stars}
      currentRound={currentRound + 1}
      totalRounds={totalRounds}
      onBack={() => navigate('/junior')}
      onNextRound={handleNextRound}
      nextLabel="Avançar"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Language selector for multilingual practice */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Praticar em:</span>
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
                      ? 'bg-orange-500 text-white shadow-xs scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span className="hidden sm:inline">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMode('word')}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === 'word' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Palavra
            </button>
            <button
              onClick={() => setMode('phrase')}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === 'phrase' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Frase Completa
            </button>
          </div>
        </div>

        {/* Main Word Flashcard */}
        <Card className="p-6 sm:p-8 rounded-3xl border-2 border-orange-200/80 bg-gradient-to-b from-white via-orange-50/20 to-amber-50/30 shadow-md text-center space-y-6">
          <div className="flex items-center justify-between">
            <Badge className="bg-orange-100 text-orange-800 font-bold border-orange-200 text-xs">
              {currentItem.category}
            </Badge>
            <span className="text-xs font-bold text-slate-400">
              Silabação: <span className="text-slate-700">{langContent.phonetic}</span>
            </span>
          </div>

          {mode === 'word' ? (
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-wide">
                {langContent.word}
              </h2>
              <p className="text-sm text-slate-500 italic">"{langContent.hint}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-relaxed">
                "{langContent.phrase}"
              </p>
              <p className="text-xs text-orange-700 font-semibold bg-orange-100/60 py-1 px-3 rounded-full inline-block">
                Foco no termo: <strong>{langContent.word}</strong>
              </p>
            </div>
          )}

          {/* Audio Pronunciation Button */}
          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleSpeak(mode === 'word' ? langContent.word : langContent.phrase)}
              disabled={isSpeaking}
              className="rounded-2xl border-orange-200 text-orange-700 hover:bg-orange-50 font-bold px-6 py-6 shadow-xs"
            >
              <Volume2
                className={`w-5 h-5 mr-2 ${isSpeaking ? 'animate-bounce text-orange-500' : ''}`}
              />
              Ouvir Pronúncia ({langInfo.flag})
            </Button>
          </div>

          {/* Speech Recording Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                size="lg"
                onClick={handleToggleListening}
                className={`w-20 h-20 rounded-full shadow-lg transition-all ${
                  isListening
                    ? 'bg-rose-500 hover:bg-rose-600 animate-pulse text-white scale-110'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
              <span className="text-xs font-bold text-slate-600">
                {isListening ? 'Ouvindo sua voz... Fale agora!' : 'Toque no microfone para falar'}
              </span>
            </div>

            {speechTranscript && (
              <div className="bg-slate-100/80 p-3 rounded-2xl text-xs font-semibold text-slate-700">
                Você disse: <span className="font-bold text-slate-900">"{speechTranscript}"</span>
              </div>
            )}

            {speechFeedback && (
              <div className="p-3.5 rounded-2xl bg-orange-100/80 border border-orange-200 text-sm font-bold text-orange-950 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{speechFeedback}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              evaluateSpoken(langContent.word, langContent.word)
            }}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Pular / Praticar sem mic
          </Button>

          <Button
            size="lg"
            onClick={handleNextRound}
            className="rounded-2xl px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md hover:from-orange-600 hover:to-amber-600"
          >
            <span>Próxima Palavra</span>
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </GameShell>
  )
}
