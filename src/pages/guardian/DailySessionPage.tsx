import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchChildById, fetchChildModuleProgress, getChildAvatarUrl } from '@/services/children'
import type { Child, DailyActivityItem } from '@/types/cognikids'
import { COGNIKIDS_MODULES, calculateAgeMonths, formatChildAge } from '@/types/cognikids'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { useSound } from '@/context/SoundContext'
import { speechService } from '@/lib/speechSynthesis'
import { Button } from '@/components/ui/button'
import { CelebrationScreen } from '@/components/celebration/CelebrationScreen'
import {
  Sparkles,
  Play,
  CheckCircle2,
  Trophy,
  Star,
  ArrowRight,
  Flame,
  RotateCcw,
  Calendar,
  X,
  Target,
} from 'lucide-react'

// Game component imports
import { FazendaFalanteGame } from '@/components/games/FazendaFalanteGame'
import { CadeOBichinhoGame } from '@/components/games/CadeOBichinhoGame'
import { SomDoBichoGame } from '@/components/games/SomDoBichoGame'
import { RimaDivertidaGame } from '@/components/games/RimaDivertidaGame'
import { ParDosAnimaisGame } from '@/components/games/ParDosAnimaisGame'
import { MemoriaDinosGame } from '@/components/games/MemoriaDinosGame'
import { CaixaDasFormasGame } from '@/components/games/CaixaDasFormasGame'
import { ContaDinosGame } from '@/components/games/ContaDinosGame'
import { SequenciaPadroesGame } from '@/components/games/SequenciaPadroesGame'
import { SequenciaCoresGame } from '@/components/games/SequenciaCoresGame'
import { EstouraBolhasGame } from '@/components/games/EstouraBolhasGame'
import { TrilhaDasLetrasGame } from '@/components/games/TrilhaDasLetrasGame'
import { ClimaERoupaGame } from '@/components/games/ClimaERoupaGame'
import { CarinhasFelizesGame } from '@/components/games/CarinhasFelizesGame'

export const DailySessionPage: React.FC = () => {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { playPop, playVictory, playStarReward } = useSound()

  const [child, setChild] = useState<Child | null>(null)
  const [dailyPlan, setDailyPlan] = useState<DailyActivityItem[]>([])
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0)
  const [sessionState, setSessionState] = useState<
    'intro' | 'playing' | 'step_completed' | 'all_completed'
  >('intro')
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    const load = async () => {
      setIsLoading(true)
      const kid = await fetchChildById(childId)
      setChild(kid)

      if (kid) {
        const ageMonths = calculateAgeMonths(kid.birth_date)
        const progressList = await fetchChildModuleProgress(kid.id)
        const progMap: Record<string, number> = {}
        progressList.forEach((p) => {
          progMap[p.module_id] = p.mastery_percentage
        })

        // Build personalized daily routine respecting child's configured activity count:
        const targetCount = kid.daily_activity_count || 3

        const sortedModules = [...COGNIKIDS_MODULES].sort((a, b) => {
          const valA = progMap[a.id] ?? 40
          const valB = progMap[b.id] ?? 40
          return valA - valB
        })

        const plan: DailyActivityItem[] = []

        // 1. Weakest area targeted game (Step 1)
        const weakestModule = sortedModules[0]
        const step1Activity = weakestModule.activities[0]
        plan.push({
          id: step1Activity.id,
          title: step1Activity.title,
          moduleId: weakestModule.id,
          moduleTitle: weakestModule.title,
          moduleColor: weakestModule.color,
          icon: weakestModule.icon,
          description: step1Activity.description,
          reason: `Pétala com menor assimilação (${progMap[weakestModule.id] ?? 40}%) — foco principal do dia!`,
        })

        // 2. Weather / Socioemotional or Speech activity (Step 2)
        if (targetCount >= 2) {
          const socioMod = COGNIKIDS_MODULES.find((m) => m.id === 'socioemotional')!
          const act2 = socioMod.activities[0] // Clima & Roupa
          plan.push({
            id: act2.id,
            title: act2.title,
            moduleId: socioMod.id,
            moduleTitle: socioMod.title,
            moduleColor: socioMod.color,
            icon: socioMod.icon,
            description: act2.description,
            reason: 'Autonomia e reconhecimento de sentimentos/clima.',
          })
        }

        // 3. Logic or Speech excitement (Step 3)
        if (targetCount >= 3) {
          const speechOrLogic =
            sortedModules.find((m) => m.id === 'speech' || m.id === 'logic') || sortedModules[1]
          const act3 =
            speechOrLogic.activities[ageMonths >= 24 && speechOrLogic.activities.length > 1 ? 1 : 0]
          plan.push({
            id: act3.id,
            title: act3.title,
            moduleId: speechOrLogic.id,
            moduleTitle: speechOrLogic.title,
            moduleColor: speechOrLogic.color,
            icon: speechOrLogic.icon,
            description: act3.description,
            reason: 'Treino de vocabulário, rimas ou padrões lógicos.',
          })
        }

        // 4. Fine motor coordination (Step 4 if configured)
        if (targetCount >= 4) {
          const motorMod = COGNIKIDS_MODULES.find((m) => m.id === 'motor')!
          const act4 = motorMod.activities[0]
          plan.push({
            id: act4.id,
            title: act4.title,
            moduleId: motorMod.id,
            moduleTitle: motorMod.title,
            moduleColor: motorMod.color,
            icon: motorMod.icon,
            description: act4.description,
            reason: 'Agilidade motora e coordenação de toque.',
          })
        }

        // 5. Memory & Retention (Step 5 if configured)
        if (targetCount >= 5) {
          const memMod = COGNIKIDS_MODULES.find((m) => m.id === 'memory')!
          const act5 = memMod.activities[0]
          plan.push({
            id: act5.id,
            title: act5.title,
            moduleId: memMod.id,
            moduleTitle: memMod.title,
            moduleColor: memMod.color,
            icon: memMod.icon,
            description: act5.description,
            reason: 'Fortalecimento da memória de trabalho.',
          })
        }

        setDailyPlan(plan.slice(0, targetCount))
      }
      setIsLoading(false)
    }
    load()
  }, [childId])

  const handleStartSession = () => {
    playPop()
    setSessionState('playing')
    speechService.speak(
      `Vamos começar a Sessão Diária com o Tico! Primeira atividade: ${dailyPlan[0]?.title}!`,
    )
  }

  const handleNextStep = () => {
    playPop()
    if (currentStepIdx + 1 < dailyPlan.length) {
      setCompletedSteps((prev) => [...prev, currentStepIdx])
      setCurrentStepIdx((prev) => prev + 1)
      setSessionState('playing')
    } else {
      setCompletedSteps((prev) => [...prev, currentStepIdx])
      setSessionState('all_completed')
      playVictory()
      speechService.speak('Parabéns! Você completou a Sessão Diária de hoje com muito sucesso!')
    }
  }

  if (isLoading || !child) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <TicoMascot size="lg" mood="talking" />
      </div>
    )
  }

  const currentActivity = dailyPlan[currentStepIdx]

  // Render active mini game in the runner container
  const renderGame = () => {
    if (!currentActivity) return null
    switch (currentActivity.id) {
      case 'fazenda_falante':
        return <FazendaFalanteGame child={child} />
      case 'rima_divertida':
        return <RimaDivertidaGame child={child} />
      case 'cade_o_bichinho':
        return <CadeOBichinhoGame child={child} />
      case 'som_do_bicho':
        return <SomDoBichoGame child={child} />
      case 'par_dos_animais':
        return <ParDosAnimaisGame child={child} />
      case 'memoria_dinos':
        return <MemoriaDinosGame child={child} />
      case 'caixa_das_formas':
        return <CaixaDasFormasGame child={child} />
      case 'conta_dinos':
        return <ContaDinosGame child={child} />
      case 'sequencia_padroes':
        return <SequenciaPadroesGame child={child} />
      case 'sequencia_cores':
        return <SequenciaCoresGame child={child} />
      case 'estoura_bolhas':
        return <EstouraBolhasGame child={child} />
      case 'trilha_das_letras':
        return <TrilhaDasLetrasGame child={child} />
      case 'clima_roupa':
        return <ClimaERoupaGame child={child} />
      case 'carinhas_felizes':
        return <CarinhasFelizesGame child={child} />
      default:
        return <FazendaFalanteGame child={child} />
    }
  }

  // Session Intro Screen
  if (sessionState === 'intro') {
    const avatarUrl = getChildAvatarUrl(child)
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 p-4 sm:p-8 flex flex-col justify-between items-center select-none">
        {/* Top Header */}
        <div className="w-full max-w-2xl flex items-center justify-between">
          <button
            onClick={() => navigate(`/app/child/${child.id}`)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm bg-white/80 px-3 py-1.5 rounded-full border border-slate-200"
          >
            <X className="w-4 h-4" />
            <span>Sair</span>
          </button>
          <div className="flex items-center gap-1.5 bg-orange-100 text-orange-800 font-black text-xs px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>
              Sessão Diária • {child.daily_minutes || 15} min ({dailyPlan.length} atividades)
            </span>
          </div>
        </div>

        {/* Center Content */}
        <div className="w-full max-w-lg my-auto py-6 flex flex-col items-center text-center animate-fade-in">
          <div className="relative mb-3">
            <TicoMascot size="lg" mood="talking" />
            <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md">
              Hoje
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Sessão Diária de {child.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
            Sugestão personalizada para a idade ({formatChildAge(child.birth_date)}) focada nas
            áreas com mais potencial de evolução!
          </p>

          {/* 3 Step Roadmap */}
          <div className="w-full mt-6 space-y-3 text-left">
            {dailyPlan.map((step, idx) => (
              <div
                key={step.id}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-sm flex items-start gap-3.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
                  style={{ backgroundColor: `${step.moduleColor}20`, color: step.moduleColor }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Passo {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400 truncate">
                      {step.moduleTitle}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 mt-0.5">{step.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{step.reason}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            onClick={handleStartSession}
            className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-xl shadow-orange-500/25 mt-6 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Iniciar Sessão Diária</span>
          </Button>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400">
          Recomendado pelos especialistas em desenvolvimento infantil do CogniKids
        </div>
      </div>
    )
  }

  // All Completed Trophy Screen
  if (sessionState === 'all_completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 p-4 sm:p-8 flex flex-col justify-center items-center select-none">
        <CelebrationScreen
          title="Sessão Diária Concluída! 🏆"
          subtitle={`${child.name} completou todos os ${dailyPlan.length} passos do treino diário!`}
          childName={child.name}
          score={98}
          accuracy={96}
          stars={3}
          roundsCompleted={dailyPlan.length}
          totalRounds={dailyPlan.length}
          practicedWords={dailyPlan.map((p) => p.title)}
          onPlayAgain={() => {
            setCurrentStepIdx(0)
            setSessionState('intro')
          }}
          onExit={() => navigate(`/app/child/${child.id}`)}
          exitLabel="Ver Cérebro em Flor"
          isJunior={false}
          customPraise={`Parabéns, ${child.name}! Você cumpriu sua meta diária de hoje com nota máxima!`}
        />
      </div>
    )
  }

  // Active playing step
  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col">
      {/* Top Session Progress Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
            Sessão Diária: Passo {currentStepIdx + 1} de {dailyPlan.length}
          </span>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">
            {currentActivity?.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentStepIdx + 1 < dailyPlan.length && (
            <Button
              size="sm"
              onClick={handleNextStep}
              className="h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
            >
              <span>Próxima atividade</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/app/child/${child.id}`)}
            className="h-8 text-xs text-slate-500 font-bold"
          >
            Encerrar
          </Button>
        </div>
      </div>

      {/* Embedded Game */}
      <div className="flex-1">{renderGame()}</div>
    </div>
  )
}
