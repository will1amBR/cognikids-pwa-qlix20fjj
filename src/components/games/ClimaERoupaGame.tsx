import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Child } from '@/types/cognikids'
import { GameShell } from '@/components/layout/GameShell'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { useSound } from '@/context/SoundContext'
import { Button } from '@/components/ui/button'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Sun, CloudRain, Snowflake, Wind, CheckCircle2, Sparkles } from 'lucide-react'

interface WeatherScenario {
  id: string
  weatherName: string
  tempFeeling: 'calor' | 'frio' | 'chuva' | 'vento'
  question: string
  description: string
  iconEmoji: string
  bgGradient: string
  ticoPhrase: string
  suitableClothes: {
    id: string
    name: string
    emoji: string
    isCorrect: boolean
    feedback: string
  }[]
}

const WEATHER_SCENARIOS: WeatherScenario[] = [
  {
    id: 'dia_de_sol',
    weatherName: 'Dia de Sol & Calor',
    tempFeeling: 'calor',
    question:
      'Hoje está um sol bem radiante e faz muito calor! ☀️ O que o Tico e você devem vestir?',
    description: 'Sol forte e calor! Escolha roupas leves e proteção para brincar no parque!',
    iconEmoji: '☀️',
    bgGradient: 'from-amber-100 via-orange-50 to-yellow-100',
    ticoPhrase: 'Que calor gostoso! Vamos escolher uma roupinha fresca e protetor solar!',
    suitableClothes: [
      {
        id: 'camiseta_shorts',
        name: 'Camiseta leve e shorts',
        emoji: '👕🩳',
        isCorrect: true,
        feedback: 'Perfeito! Roupas frescas para o calor!',
      },
      {
        id: 'bone_chapeu',
        name: 'Boné ou Chapéu de sol',
        emoji: '🧢',
        isCorrect: true,
        feedback: 'Ótimo! Protege a cabeça do sol!',
      },
      {
        id: 'casaco_la',
        name: 'Casaco pesado de lã',
        emoji: '🧥',
        isCorrect: false,
        feedback: 'Casaco de lã vai dar muito calor no sol!',
      },
      {
        id: 'chinelo_sandalia',
        name: 'Sandália fresquinha',
        emoji: '🩴',
        isCorrect: true,
        feedback: 'Isso! Sandália arejada para o calor!',
      },
    ],
  },
  {
    id: 'dia_de_chuva',
    weatherName: 'Chuva & Poças d’água',
    tempFeeling: 'chuva',
    question:
      'Está chovendo lá fora e o chão está molhado! 🌧️ O que precisamos para não se molhar?',
    description: 'Chuvinha caindo! Precisamos nos proteger da água.',
    iconEmoji: '🌧️',
    bgGradient: 'from-sky-100 via-blue-50 to-indigo-100',
    ticoPhrase: 'Ploft ploft! A chuva está caindo! Vamos pegar a capa ou guarda-chuva!',
    suitableClothes: [
      {
        id: 'guarda_chuva',
        name: 'Guarda-chuva colorido',
        emoji: '☂️',
        isCorrect: true,
        feedback: 'Isso! Abre o guarda-chuva para a água não molhar!',
      },
      {
        id: 'galocha_bota',
        name: 'Galocha de borracha',
        emoji: '🥾',
        isCorrect: true,
        feedback: 'Excelente! Pés secos mesmo pisando na poça!',
      },
      {
        id: 'biquini_sunga',
        name: 'Roupa de praia',
        emoji: '🩱',
        isCorrect: false,
        feedback: 'Roupa de praia na chuva fria não protege!',
      },
      {
        id: 'capa_chuva',
        name: 'Capa impermeável',
        emoji: '🧥',
        isCorrect: true,
        feedback: 'Maravilha! A capa protege o corpo todinho!',
      },
    ],
  },
  {
    id: 'dia_de_frio',
    weatherName: 'Dia Geladinho de Frio',
    tempFeeling: 'frio',
    question:
      'Brrr! Bateu um vento gelado e faz frio lá fora! ❄️ O que vestir para ficar quentinho?',
    description: 'Tempo gelado! Hora de se agasalhar com muito carinho.',
    iconEmoji: '❄️',
    bgGradient: 'from-blue-100 via-slate-50 to-cyan-100',
    ticoPhrase: 'Brrrr! O bico do Tico está até tremendo! Vamos botar casaco quentinho!',
    suitableClothes: [
      {
        id: 'casacao_quentinho',
        name: 'Casaco quentinho e calça',
        emoji: '🧥👖',
        isCorrect: true,
        feedback: 'Muito bem! Agasalho bem quentinho contra o frio!',
      },
      {
        id: 'gorro_luva',
        name: 'Gorro e Luvas',
        emoji: '🧤🧣',
        isCorrect: true,
        feedback: 'Perfeito! Mãos e orelhas bem protegidas!',
      },
      {
        id: 'regata_fina',
        name: 'Regata sem manga',
        emoji: '🎽',
        isCorrect: false,
        feedback: 'Regata vai deixar você com frio!',
      },
      {
        id: 'meia_sapato',
        name: 'Meia grossa e tênis',
        emoji: '🧦👟',
        isCorrect: true,
        feedback: 'Isso aí! Pés quentinhos!',
      },
    ],
  },
]

export const ClimaERoupaGame: React.FC<{ child: Child }> = ({ child }) => {
  const navigate = useNavigate()
  const { playPop, playStarReward, playVictory } = useSound()

  const [roundIdx, setRoundIdx] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [lastFeedback, setLastFeedback] = useState<string | null>(null)

  const currentScenario = WEATHER_SCENARIOS[roundIdx] || WEATHER_SCENARIOS[0]
  const requiredCorrectCount = currentScenario.suitableClothes.filter((c) => c.isCorrect).length

  useEffect(() => {
    if (isCompleted) return
    setSelectedIds([])
    setLastFeedback(null)
    speechService.speak(`${currentScenario.question} ${currentScenario.ticoPhrase}`)
  }, [roundIdx, isCompleted])

  const handleToggleCloth = (cloth: WeatherScenario['suitableClothes'][0]) => {
    playPop()

    if (cloth.isCorrect) {
      if (!selectedIds.includes(cloth.id)) {
        const nextSelected = [...selectedIds, cloth.id]
        setSelectedIds(nextSelected)
        setLastFeedback(cloth.feedback)
        playStarReward(2)
        speechService.speak(cloth.feedback)

        // If child selected all correct items for this scenario
        const correctSelected = nextSelected.filter(
          (id) => currentScenario.suitableClothes.find((c) => c.id === id)?.isCorrect,
        ).length

        if (correctSelected >= 2) {
          // Allow progression after at least 2 correct clothing items
          setTimeout(() => {
            if (roundIdx + 1 < WEATHER_SCENARIOS.length) {
              setRoundIdx((r) => r + 1)
            } else {
              finishGame()
            }
          }, 1500)
        }
      }
    } else {
      setLastFeedback(cloth.feedback)
      speechService.speak(cloth.feedback)
    }
  }

  const finishGame = async () => {
    setIsCompleted(true)
    playVictory()
    speechService.speak('Sensacional! Você sabe escolher a roupa certinha para qualquer clima!')
    await offlineSyncService.queueGameSession({
      user_id: child.user_id,
      child_id: child.id,
      module_id: 'socioemotional',
      game_id: 'clima_roupa',
      game_title: 'Clima & Roupa Adequada',
      stars: 3,
      score: 100,
      accuracy: 100,
      rounds_completed: WEATHER_SCENARIOS.length,
      total_rounds: WEATHER_SCENARIOS.length,
      details: {
        theme: 'meteorology_and_self_care',
        description: 'Associação de clima/temperatura com autonomia no vestir',
      },
    })
  }

  if (isCompleted) {
    return (
      <GameShell
        title="Clima & Roupa Adequada"
        moduleColor="#E63946"
        currentRound={WEATHER_SCENARIOS.length}
        totalRounds={WEATHER_SCENARIOS.length}
        exitPath={`/app/child/${child.id}`}
        ticoMood="celebrating"
      >
        <div className="bg-white/95 rounded-3xl p-8 border border-rose-200 shadow-2xl flex flex-col items-center text-center max-w-sm mx-auto animate-fade-in">
          <TicoMascot size="lg" mood="celebrating" />
          <h2 className="text-2xl font-black text-slate-800 mt-3">Mestre do Clima! 🌤️</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {child.name} aprendeu a se preparar para o sol, a chuva e o frio com autonomia!
          </p>
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
    if (roundIdx + 1 < WEATHER_SCENARIOS.length) {
      setRoundIdx((prev) => prev + 1)
      setSelectedIds([])
      setLastFeedback(null)
    } else {
      finishGame()
    }
  }

  return (
    <GameShell
      title="Clima & Roupa Adequada"
      moduleColor="#E63946"
      currentRound={roundIdx + 1}
      totalRounds={WEATHER_SCENARIOS.length}
      exitPath={`/app/child/${child.id}`}
      ticoMood="talking"
      ticoInstruction={currentScenario.question}
      onNextRound={handleAdvanceManually}
      nextLabel="Avançar"
    >
      <div className="w-full max-w-lg flex flex-col items-center gap-5">
        {/* Weather Banner */}
        <div
          className={`w-full bg-gradient-to-r ${currentScenario.bgGradient} p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4`}
        >
          <div className="flex items-center gap-3.5">
            <span className="text-5xl shrink-0 animate-bounce">{currentScenario.iconEmoji}</span>
            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/80 text-slate-700 shadow-sm">
                Cenário {roundIdx + 1} de {WEATHER_SCENARIOS.length}
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-0.5">
                {currentScenario.weatherName}
              </h3>
              <p className="text-xs text-slate-600 font-medium line-clamp-2">
                {currentScenario.description}
              </p>
            </div>
          </div>
        </div>

        {/* Question Prompt */}
        <p className="text-sm sm:text-base font-extrabold text-slate-800 text-center px-2">
          Toque nas <span className="text-rose-600">roupas certas</span> para vestir o Tico:
        </p>

        {/* Clothing Options Grid */}
        <div className="grid grid-cols-2 gap-3.5 w-full">
          {currentScenario.suitableClothes.map((cloth) => {
            const isSelected = selectedIds.includes(cloth.id)
            return (
              <button
                key={cloth.id}
                onClick={() => handleToggleCloth(cloth)}
                className={`p-4 rounded-3xl bg-white border-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 text-center relative ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 shadow-emerald-100 scale-102'
                    : 'border-slate-200 hover:border-rose-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <span className="text-4xl sm:text-5xl">{cloth.emoji}</span>
                <span className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                  {cloth.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Feedback pill */}
        {lastFeedback && (
          <div className="bg-white/95 px-4 py-2 rounded-2xl border border-rose-200 shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{lastFeedback}</span>
          </div>
        )}
      </div>
    </GameShell>
  )
}
