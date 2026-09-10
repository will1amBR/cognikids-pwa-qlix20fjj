import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useSound } from '@/context/SoundContext'
import { createChild } from '@/services/children'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { SUPPORTED_LANGUAGES, AppLanguage } from '@/types/cognikids'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  Flame,
  Gamepad2,
  Calendar,
  Layers,
  Heart,
  Lightbulb,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onChildCreated: (newChildId: string) => void
}

const COLOR_OPTIONS = [
  { label: 'Laranja Tico', value: '#FF7A45', bgClass: 'bg-[#FF7A45]' },
  { label: 'Azul Céu', value: '#0EA5E9', bgClass: 'bg-[#0EA5E9]' },
  { label: 'Verde Floresta', value: '#10B981', bgClass: 'bg-[#10B981]' },
  { label: 'Rosa Suave', value: '#EC4899', bgClass: 'bg-[#EC4899]' },
  { label: 'Roxo Estelar', value: '#8B5CF6', bgClass: 'bg-[#8B5CF6]' },
  { label: 'Amarelo Sol', value: '#F59E0B', bgClass: 'bg-[#F59E0B]' },
]

export const OnboardingWizard: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onChildCreated,
}) => {
  const { user } = useAuth()
  const { language: uiLang, t } = useLanguage()
  const { playPop, playStarReward, playVictory } = useSound()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Steps: 1. Welcome -> 2. Profile Details -> 3. Languages -> 4. Recommendations & Start
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  // Form State
  const [name, setName] = useState('')
  const [ageMonths, setAgeMonths] = useState<number>(36)
  const [favoriteColor, setFavoriteColor] = useState('#FF7A45')
  const [classGroup, setClassGroup] = useState<string>(() => {
    return localStorage.getItem('cognikids_pending_class_group') || ''
  })
  const pendingSchoolName = localStorage.getItem('cognikids_pending_school_name') || ''
  const [selectedLanguages, setSelectedLanguages] = useState<AppLanguage[]>([uiLang || 'pt-BR'])
  const [isSaving, setIsSaving] = useState(false)
  const [createdChildId, setCreatedChildId] = useState<string | null>(null)

  if (!isOpen) return null

  // Calculate birthdate from age in months
  const computeBirthDate = (months: number) => {
    const d = new Date()
    d.setMonth(d.getMonth() - months)
    return d.toISOString().split('T')[0]
  }

  // Recommendations mapping according to age in months (0-60m)
  const getAgeRecommendations = (m: number) => {
    if (m <= 18) {
      return {
        stage: '0 a 18 meses (Descoberta Sensorial & Primeiras Palavras)',
        focus: 'Articulação de sílabas, reconhecimento de animais e sons da natureza',
        games: [
          {
            name: 'Cadê o Bichinho?',
            area: 'Lógica & Visão',
            icon: '🐣',
            color: 'bg-amber-100 text-amber-900',
          },
          {
            name: 'Qual é o Som?',
            area: 'Fala & Sons',
            icon: '🔔',
            color: 'bg-orange-100 text-orange-900',
          },
          {
            name: 'Estoura Bolhas',
            area: 'Motricidade',
            icon: '🫧',
            color: 'bg-sky-100 text-sky-900',
          },
        ],
        routineMin: 8,
        activitiesCount: 2,
      }
    }
    if (m <= 60) {
      return {
        stage: '37 a 60 meses (Raciocínio Lógico & Autonomia)',
        focus: 'Pronúncia avançada, rimas fonéticas, memória de pares e autonomia diária',
        games: [
          {
            name: 'Fazenda Falante (Multilíngue)',
            area: 'Fala & Linguagem',
            icon: '🌍',
            color: 'bg-orange-100 text-orange-900',
          },
          {
            name: 'Rima Divertida',
            area: 'Consciência Fonológica',
            icon: '🎵',
            color: 'bg-purple-100 text-purple-900',
          },
          {
            name: 'Memória dos Dinos',
            area: 'Memória & Atenção',
            icon: '🧩',
            color: 'bg-sky-100 text-sky-900',
          },
          {
            name: 'Sequência de Padrões',
            area: 'Lógica & Cognição',
            icon: '⭐',
            color: 'bg-indigo-100 text-indigo-900',
          },
        ],
        routineMin: 15,
        activitiesCount: 4,
      }
    }
    return {
      stage: '6 a 10 anos (CogniKids Junior: Alfabetização & Raciocínio)',
      focus: 'Vocabulário rico nos 5 idiomas, ditado por voz, cálculo mental e dedução lógica',
      games: [
        {
          name: 'Construtor de Vocabulário',
          area: 'Vocabulário Pro',
          icon: '🚀',
          color: 'bg-indigo-100 text-indigo-900',
        },
        {
          name: 'Missão Matemática',
          area: 'Matemática & Contas',
          icon: '⚡',
          color: 'bg-cyan-100 text-cyan-900',
        },
        {
          name: 'Matriz Lógica 2x2',
          area: 'Lógica & Dedução',
          icon: '🧩',
          color: 'bg-violet-100 text-violet-900',
        },
        {
          name: 'Ditado Inteligente',
          area: 'Ditado & Ortografia',
          icon: '✍️',
          color: 'bg-pink-100 text-pink-900',
        },
      ],
      routineMin: 20,
      activitiesCount: 4,
    }
  }

  const rec = getAgeRecommendations(ageMonths)

  const toggleLanguage = (code: AppLanguage) => {
    playPop()
    if (selectedLanguages.includes(code)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== code))
      } else {
        toast({
          title: 'Atenção',
          description: 'Selecione pelo menos um idioma para a criança.',
        })
      }
    } else {
      setSelectedLanguages([...selectedLanguages, code])
    }
  }

  const handleCreateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: 'Informe o nome',
        description: 'Digite o nome ou apelido da criança.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const birth_date = computeBirthDate(ageMonths)
      const newChild = await createChild({
        name: name.trim(),
        birth_date,
        favorite_color: favoriteColor,
        class_group: classGroup.trim() || undefined,
        daily_minutes: rec.routineMin,
        daily_activity_count: rec.activitiesCount,
        learning_languages: selectedLanguages,
        primary_language: selectedLanguages[0] || 'pt-BR',
      })

      // Clean up redeemed pending invite from storage
      localStorage.removeItem('cognikids_pending_invite_code')
      localStorage.removeItem('cognikids_pending_class_group')
      localStorage.removeItem('cognikids_pending_school_name')

      playVictory()
      setCreatedChildId(newChild.id)
      onChildCreated(newChild.id)
      setCurrentStep(4)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao criar perfil',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartDailySession = () => {
    playPop()
    const isJunior = ageMonths >= 72
    if (createdChildId) {
      localStorage.setItem('cognikids_selected_child_id', createdChildId)
      onClose()
      if (isJunior) {
        navigate('/junior')
      } else {
        navigate(`/app/daily/${createdChildId}`)
      }
    } else {
      onClose()
    }
  }

  const handleGoToDashboard = () => {
    playPop()
    const isJunior = ageMonths >= 72
    if (createdChildId) {
      localStorage.setItem('cognikids_selected_child_id', createdChildId)
      onClose()
      if (isJunior) {
        navigate('/junior')
      } else {
        navigate(`/app/child/${createdChildId}`)
      }
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 max-w-xl w-full p-6 sm:p-8 relative overflow-hidden my-6">
        {/* Progress Bar in Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black text-xs flex items-center justify-center">
              {currentStep}/4
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {currentStep === 1 && 'Boas-vindas'}
              {currentStep === 2 && 'Dados da Criança'}
              {currentStep === 3 && 'Idiomas de Aprendizagem'}
              {currentStep === 4 && 'Plano Personalizado'}
            </span>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all duration-300 ${
                  s <= currentStep ? 'bg-orange-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Welcome with Tico */}
        {currentStep === 1 && (
          <div className="text-center flex flex-col items-center space-y-4 animate-fade-in">
            <div className="relative">
              <TicoMascot size="lg" mood="talking" />
              <div className="absolute -top-1 -right-2 text-2xl animate-bounce">✨</div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              {t('onboarding.stepWelcomeTitle')}
            </h2>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Olá, {user?.name?.split(' ')[0] || 'responsável'}! Eu sou o <strong>Tico</strong>! Vou
              guiar a jornada neurológica e de fala do seu pequeno(a) dos{' '}
              <strong>0 aos 60 meses</strong>.
            </p>

            <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-4 text-left w-full space-y-2 mt-2">
              <div className="flex items-start gap-2 text-xs text-orange-950 font-semibold">
                <span className="text-base">🎯</span>
                <span>Calibração automática de atividades pela idade em meses.</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-orange-950 font-semibold">
                <span className="text-base">🗣️</span>
                <span>Jogos de fala com reconhecimento de voz em 5 idiomas.</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-orange-950 font-semibold">
                <span className="text-base">🌸</span>
                <span>
                  Cérebro em Flor com diagnóstico claro: <em>"indo bem"</em> vs{' '}
                  <em>"precisa melhorar"</em>.
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                playPop()
                setCurrentStep(2)
              }}
              size="lg"
              className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-500/25 mt-4"
            >
              <span>Vamos começar!</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 2: Child Profile (Name, Age in Months, Color) */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in text-left">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                {t('onboarding.stepProfileTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t('onboarding.stepProfileSubtitle')}
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                {t('onboarding.childName')} <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder={t('onboarding.childNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-2xl text-base font-semibold border-slate-200 focus:border-orange-500"
                autoFocus
              />
            </div>

            {/* Pending School Invite Banner if active */}
            {classGroup && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-indigo-700 flex items-center gap-1.5">
                    <span>🏫</span>
                    <span>Turma Escolar Vinculada</span>
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                    {classGroup}
                  </span>
                </div>
                {pendingSchoolName && (
                  <p className="text-xs font-semibold text-slate-700">{pendingSchoolName}</p>
                )}
                <p className="text-[10px] text-indigo-900/70">
                  A criança já aparecerá no portal pedagógico da escola com esta turma.
                </p>
              </div>
            )}

            {/* Age Slider in Months (0 to 60) */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>Idade da Criança</span>
                </Label>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-orange-500 text-white shadow-xs">
                  {ageMonths} meses ({Math.floor(ageMonths / 12)}a {ageMonths % 12}m)
                </span>
              </div>

              <Slider
                value={[ageMonths]}
                min={2}
                max={120}
                step={1}
                onValueChange={(val) => setAgeMonths(val[0])}
                className="py-3"
              />

              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>0m (Bebê)</span>
                <span>60m (5a Infantil)</span>
                <span className="text-indigo-600 font-black">72–120m (6–10a Junior)</span>
              </div>
            </div>

            {/* Favorite Color Theme */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">
                {t('onboarding.favoriteColor')}
              </Label>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      playPop()
                      setFavoriteColor(c.value)
                    }}
                    className={`w-9 h-9 rounded-2xl transition-all flex items-center justify-center text-white ${c.bgClass} ${
                      favoriteColor === c.value
                        ? 'ring-4 ring-orange-200 scale-110 shadow-md'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    title={c.label}
                  >
                    {favoriteColor === c.value && <Check className="w-5 h-5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1 h-12 rounded-2xl font-bold border-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('onboarding.previous')}
              </Button>
              <Button
                type="button"
                disabled={!name.trim()}
                onClick={() => {
                  playPop()
                  setCurrentStep(3)
                }}
                className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/25"
              >
                <span>{t('onboarding.next')}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Multi-Language Selection */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in text-left">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                {t('onboarding.stepLanguagesTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t('onboarding.stepLanguagesSubtitle')}
              </p>
            </div>

            <p className="text-xs text-orange-800 bg-orange-50 p-3 rounded-2xl border border-orange-200/80">
              💡 {t('onboarding.stepLanguagesHint')}
            </p>

            {/* Languages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.code)
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{lang.label}</p>
                        <p className="text-xs text-slate-500">{lang.nativeName}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                        isSelected ? 'bg-orange-500' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1 h-12 rounded-2xl font-bold border-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('onboarding.previous')}
              </Button>
              <Button
                type="button"
                disabled={isSaving || selectedLanguages.length === 0}
                onClick={handleCreateProfile}
                className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/25"
              >
                {isSaving ? t('onboarding.saving') : t('onboarding.next')}
                {!isSaving && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Age-Adapted Recommendations & Start */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in text-left">
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-2 shadow-sm animate-bounce">
                🎉
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                Perfil de {name} criado com sucesso!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-0.5">
                O Tico adaptou a rotina neurológica para a faixa de{' '}
                <strong>{ageMonths} meses</strong>.
              </p>
            </div>

            {/* Recommendation Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Faixa de Desenvolvimento:</span>
                <span className="text-orange-600">{rec.stage}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                🎯 <strong>Foco sugerido:</strong> {rec.focus}
              </p>

              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">
                  {t('onboarding.recommendedActivitiesList')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {rec.games.map((g, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${g.color}`}
                    >
                      <span className="text-lg">{g.icon}</span>
                      <div className="truncate">
                        <p className="truncate">{g.name}</p>
                        <p className="text-[10px] opacity-75 font-normal truncate">{g.area}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-200/80">
                <span>⏱️ Rotina diária sugerida:</span>
                <span className="font-bold text-slate-800">
                  {rec.routineMin} min/dia ({rec.activitiesCount} jogos)
                </span>
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleStartDailySession}
                size="lg"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                <Flame className="w-5 h-5 fill-current" />
                <span>{t('onboarding.startDailySession')}</span>
              </Button>

              <Button
                onClick={handleGoToDashboard}
                variant="outline"
                className="w-full h-11 rounded-2xl font-bold border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <span>{t('onboarding.goToDashboard')}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
