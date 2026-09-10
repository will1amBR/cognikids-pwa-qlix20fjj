import React, { useState, useEffect } from 'react'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import { useSound } from '@/context/SoundContext'
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  CheckCircle2,
  Calendar,
  Gamepad2,
  TrendingUp,
  Settings,
  Rocket,
  Users,
} from 'lucide-react'

export interface TourStep {
  id: string
  title: string
  subtitle: string
  mascotMood: 'happy' | 'talking' | 'celebrating' | 'listening' | 'waving'
  icon: string
  badgeText: string
  description: string
  highlightTip?: string
  targetHint?: string
  onlyIfJunior?: boolean
}

const TOUR_STORAGE_KEY = 'cognikids_guided_tour_completed_v1'

interface GuidedTourProps {
  hasJuniorChild?: boolean
  isOpen?: boolean
  onComplete?: () => void
  onDismiss?: () => void
}

export const GuidedTourOverlay: React.FC<GuidedTourProps> = ({
  hasJuniorChild = false,
  isOpen,
  onComplete,
  onDismiss,
}) => {
  const { playPop, playStarReward, playVictory } = useSound()

  // Base tour steps in pt-BR with Tico's voice
  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao CogniKids!',
      subtitle: 'Visão Geral do Painel',
      mascotMood: 'waving',
      icon: '👋',
      badgeText: 'Passo 1 de 7',
      description:
        'Oi! Eu sou o Tico, seu mascote guia! Este é o painel principal do responsável. Aqui você vê o progresso de cada criança, atividades recentes e o atalho para a sessão de hoje.',
      highlightTip: 'Tudo no CogniKids funciona também sem internet (100% offline no celular)!',
    },
    {
      id: 'child_selector',
      title: 'Seletor e Perfis de Crianças',
      subtitle: 'Alterne entre os filhos facilmente',
      mascotMood: 'happy',
      icon: '🧒',
      badgeText: 'Passo 2 de 7',
      description:
        'Na barra superior, você pode trocar rapidamente entre seus filhos cadastrados ou adicionar um novo irmãozinho. Cada criança tem idade em meses e calibração própria.',
      highlightTip: 'Você também pode editar o nome, turma escolar e cores favoritas da criança.',
    },
    {
      id: 'daily_session',
      title: 'Sessão Diária Recomendada',
      subtitle: 'Rotina neurológica sem esforço',
      mascotMood: 'talking',
      icon: '🔥',
      badgeText: 'Passo 3 de 7',
      description:
        'O botão "Sessão Diária" seleciona automaticamente os 2 a 4 jogos mais indicados para a idade da criança hoje. São apenas 10 a 20 minutinhos que estimulam fala, memória e lógica sem sobrecarregar a visão!',
      highlightTip:
        'Dica do Tico: faça 1 sessão por dia para desbloquear medalhas e manter o ritmo!',
    },
    {
      id: 'modules_five_areas',
      title: 'Os 5 Módulos Cognitivos',
      subtitle: 'Fala, Memória, Lógica, Motricidade e Emoções',
      mascotMood: 'talking',
      icon: '🌸',
      badgeText: 'Passo 4 de 7',
      description:
        'Nosso radar Cérebro em Flor acompanha 5 pilares fundamentais da infância. Na Fazenda Falante, a criança usa o microfone para gravar a voz em português ou em outros 4 idiomas!',
      highlightTip:
        'O algoritmo fonético avalia a pronúncia e incentiva a criança com estrelinhas.',
    },
    {
      id: 'history_and_review',
      title: 'Histórico & Fila de Palavras',
      subtitle: 'Acompanhe cada tentativa e vocábulo',
      mascotMood: 'listening',
      icon: '📜',
      badgeText: 'Passo 5 de 7',
      description:
        'No menu Histórico, você revê os resultados de cada partida, palavras acertadas e termos que precisam de um reforço lúdico no dia a dia da família.',
      highlightTip: 'Veja a evolução bilíngue da criança com o ranking semanal de palavras!',
    },
    {
      id: 'reports_and_pdf',
      title: 'Relatórios & Exportação em PDF',
      subtitle: 'Ideal para levar à escola e neuropediatra',
      mascotMood: 'celebrating',
      icon: '📊',
      badgeText: 'Passo 6 de 7',
      description:
        'Gere relatórios evolutivos com diagnóstico claro: quais dimensões estão "Indo bem" e onde "Vale estimular mais", com botão para imprimir ou baixar um PDF profissional.',
      highlightTip:
        'Você também pode gerar um código seguro somente leitura para a escola da criança!',
    },
    {
      id: 'junior_or_settings',
      title: hasJuniorChild
        ? 'Área CogniKids Junior (6 a 10 anos)'
        : 'Ajustes, Idiomas & Lembretes',
      subtitle: hasJuniorChild ? 'Modo avançado para alfabetização' : 'Configure no seu tempo',
      mascotMood: hasJuniorChild ? 'celebrating' : 'happy',
      icon: hasJuniorChild ? '🚀' : '⚙️',
      badgeText: 'Passo 7 de 7',
      description: hasJuniorChild
        ? 'Identificamos que você tem criança na faixa de 6 a 10 anos! A área Junior traz ditado inteligente por voz, desafios matemáticos, matriz lógica e vocabulário avançado.'
        : 'Em Configurações você escolhe o idioma da interface, horários dos lembretes no celular e pode forçar sincronização offline a qualquer momento.',
      highlightTip:
        'Você pode rever este tour quando quiser indo em Configurações > Ver Tour Novamente.',
    },
  ]

  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const currentStep = steps[activeStepIndex] || steps[0]

  const handleNext = () => {
    playPop()
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrev = () => {
    playPop()
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1)
    }
  }

  const handleFinish = () => {
    playVictory()
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    if (onComplete) onComplete()
    if (onDismiss) onDismiss()
  }

  const handleSkip = () => {
    playPop()
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    if (onDismiss) onDismiss()
  }

  if (isOpen === false) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-orange-200/80 max-w-lg w-full p-6 sm:p-7 overflow-hidden text-slate-800">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200/40 via-amber-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-black shadow-xs">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                Tour Guiado CogniKids
              </span>
              <p className="text-xs font-bold text-slate-500">{currentStep.badgeText}</p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            title="Pular tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mascot & Main Step Content */}
        <div className="py-5 flex flex-col items-center text-center space-y-4 relative z-10">
          <div className="relative">
            <TicoMascot size="lg" mood={currentStep.mascotMood} />
            <span className="absolute -bottom-1 -right-1 text-2xl animate-bounce">
              {currentStep.icon}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
              {currentStep.subtitle}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentStep.title}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
            {currentStep.description}
          </p>

          {currentStep.highlightTip && (
            <div className="w-full bg-orange-50 border border-orange-200/80 rounded-2xl p-3 text-left flex items-start gap-2.5 text-xs text-orange-950 font-medium">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span>{currentStep.highlightTip}</span>
            </div>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center items-center gap-1.5 py-2 relative z-10">
          {steps.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                playPop()
                setActiveStepIndex(idx)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeStepIndex
                  ? 'w-7 bg-orange-500'
                  : idx < activeStepIndex
                    ? 'w-2 bg-orange-300'
                    : 'w-2 bg-slate-200'
              }`}
              title={st.title}
            />
          ))}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            Pular Tour
          </button>

          <div className="flex items-center gap-2">
            {activeStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="rounded-xl border-slate-200 text-slate-700 font-bold text-xs h-10 px-3"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Anterior</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs h-10 px-4 shadow-md shadow-orange-500/25 flex items-center gap-1"
            >
              <span>{activeStepIndex === steps.length - 1 ? 'Concluir Tour 🎉' : 'Próximo'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage whether guided tour should be presented
 */
export function useGuidedTour() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!hasSeen) {
      // Small timeout so initial page animation finishes
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [])

  const startTour = () => setIsOpen(true)
  const closeTour = () => setIsOpen(false)

  return {
    isOpen,
    startTour,
    closeTour,
  }
}
