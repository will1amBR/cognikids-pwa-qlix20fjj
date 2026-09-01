import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { fetchChildById, createChild, updateChild, getChildAvatarUrl } from '@/services/children'
import {
  COGNIKIDS_MODULES,
  calculateAgeMonths,
  SUPPORTED_LANGUAGES,
  AppLanguage,
} from '@/types/cognikids'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Upload, Trash2, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const ChildFormPage: React.FC = () => {
  const { childId } = useParams()
  const isEditing = Boolean(childId)
  const navigate = useNavigate()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [favoriteColor, setFavoriteColor] = useState('#FF7A45')
  const [classGroup, setClassGroup] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [clearAvatar, setClearAvatar] = useState(false)
  const [dailyMinutes, setDailyMinutes] = useState<number>(15)
  const [dailyActivityCount, setDailyActivityCount] = useState<number>(3)
  const [learningLanguages, setLearningLanguages] = useState<AppLanguage[]>(['pt-BR'])
  const [primaryLanguage, setPrimaryLanguage] = useState<AppLanguage>('pt-BR')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(isEditing)

  const swatchColors = COGNIKIDS_MODULES.map((m) => ({
    color: m.color,
    name: m.title,
  }))

  useEffect(() => {
    if (isEditing && childId) {
      const load = async () => {
        setIsFetching(true)
        const child = await fetchChildById(childId)
        if (child) {
          setName(child.name)
          setBirthDate(child.birth_date ? child.birth_date.split('T')[0] : '')
          if (child.favorite_color) setFavoriteColor(child.favorite_color)
          if (child.class_group) setClassGroup(child.class_group)
          if (child.daily_minutes) setDailyMinutes(child.daily_minutes)
          if (child.daily_activity_count) setDailyActivityCount(child.daily_activity_count)
          if (child.learning_languages && Array.isArray(child.learning_languages)) {
            setLearningLanguages(child.learning_languages as AppLanguage[])
          }
          if (child.primary_language) setPrimaryLanguage(child.primary_language as AppLanguage)
          const existingUrl = getChildAvatarUrl(child)
          if (existingUrl) setAvatarPreview(existingUrl)
        } else {
          toast({
            title: 'Criança não encontrada',
            variant: 'destructive',
          })
          navigate('/app/children')
        }
        setIsFetching(false)
      }
      load()
    }
  }, [childId, isEditing, navigate, toast])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A foto deve ter no máximo 2MB.',
        variant: 'destructive',
      })
      return
    }

    setAvatarFile(file)
    setClearAvatar(false)
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setClearAvatar(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' })
      return
    }
    if (!birthDate) {
      toast({ title: 'Data de nascimento obrigatória', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      if (isEditing && childId) {
        await updateChild(childId, {
          name: name.trim(),
          birth_date: new Date(birthDate).toISOString(),
          favorite_color: favoriteColor,
          class_group: classGroup.trim(),
          daily_minutes: dailyMinutes,
          daily_activity_count: dailyActivityCount,
          learning_languages: learningLanguages,
          primary_language: primaryLanguage,
          avatarFile,
          clearAvatar,
        })
        toast({ title: 'Perfil atualizado com sucesso! 🎉' })
      } else {
        const created = await createChild({
          name: name.trim(),
          birth_date: new Date(birthDate).toISOString(),
          favorite_color: favoriteColor,
          class_group: classGroup.trim(),
          daily_minutes: dailyMinutes,
          daily_activity_count: dailyActivityCount,
          learning_languages: learningLanguages,
          primary_language: primaryLanguage,
          avatarFile,
        })
        localStorage.setItem('cognikids_selected_child_id', created.id)
        toast({
          title: 'Criança cadastrada com sucesso! 🎉',
          description: isJuniorAge
            ? 'Direcionando automaticamente para o CogniKids Junior (6-10 anos)!'
            : undefined,
        })
      }
      if (isJuniorAge) {
        navigate('/junior')
      } else {
        navigate('/app')
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar perfil',
        description: 'Verifique as informações e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculatedMonths = birthDate ? calculateAgeMonths(new Date(birthDate).toISOString()) : 0
  const isJuniorAge = calculatedMonths >= 72

  if (isFetching) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link to="/app/children">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {isEditing ? 'Editar Perfil' : 'Cadastrar Criança'}
          </h1>
          <p className="text-xs text-slate-500">
            Personalize o perfil para calibrar a dificuldade dos jogos
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5"
      >
        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-2">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-md overflow-hidden relative border-2 border-dashed border-slate-300"
            style={{ backgroundColor: favoriteColor }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              (name || 'C').charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-2 items-center sm:items-start text-center sm:text-left">
            <Label className="text-xs font-bold text-slate-700">Foto da criança (opcional)</Label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Escolher foto</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remover
                </Button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">PNG, JPG ou WEBP até 2MB</p>
          </div>
        </div>
        {/* Nome */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="name" className="text-xs font-bold text-slate-700">
            Nome da criança *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="ex: Sophia ou Lucas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
            className="rounded-2xl h-11"
          />
        </div>
        {/* Data de Nascimento */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <Label htmlFor="birthDate" className="text-xs font-bold text-slate-700">
              Data de nascimento *
            </Label>
            {birthDate && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isJuniorAge
                    ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                    : 'text-orange-600 bg-orange-50 border-orange-200'
                }`}
              >
                {calculatedMonths} {calculatedMonths === 1 ? 'mês' : 'meses'}{' '}
                {isJuniorAge ? '(Junior 🎒)' : '(Infantil 👶)'}
              </span>
            )}
          </div>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={isLoading}
            required
            className="rounded-2xl h-11"
          />
          <p className="text-[11px] text-slate-400">
            A idade exata calibra o tempo de resposta, o vocabulário e o número de rodadas nos
            jogos.
          </p>
        </div>
        {/* Idiomas de Aprendizagem (Português, Inglês, Espanhol, Alemão, Francês) */}
        <div className="space-y-2 text-left">
          <Label className="text-xs font-bold text-slate-700">
            Idiomas que a criança está aprendendo
          </Label>

          {learningLanguages.length > 1 && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-center gap-2.5 text-xs text-amber-950">
              <span className="text-xl">🌍</span>
              <div>
                <p className="font-black text-amber-900">Selo Especial Concedido!</p>
                <p className="text-amber-800">
                  Com {learningLanguages.length} idiomas selecionados, a criança exibirá o selo{' '}
                  <strong>"Bilíngue em construção"</strong> no perfil e nas medalhas.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isChecked = learningLanguages.includes(lang.code)
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    if (isChecked) {
                      if (learningLanguages.length > 1) {
                        setLearningLanguages(learningLanguages.filter((l) => l !== lang.code))
                      }
                    } else {
                      setLearningLanguages([...learningLanguages, lang.code])
                    }
                  }}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                    isChecked
                      ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isChecked ? 'bg-orange-500 text-white' : 'border border-slate-300'}`}
                  >
                    {isChecked ? '✓' : ''}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-400">
            As atividades de fala e jogos adaptarão o reconhecimento e síntese de voz para esses
            idiomas.
          </p>
        </div>
        {/* Turma / Sala (Escola) */}
        <div className="space-y-1.5 text-left">
          <Label htmlFor="classGroup" className="text-xs font-bold text-slate-700">
            Turma / Sala de aula (opcional)
          </Label>
          <Input
            id="classGroup"
            type="text"
            placeholder="ex: Maternal II, Berçário A, Jardim 1..."
            value={classGroup}
            onChange={(e) => setClassGroup(e.target.value)}
            disabled={isLoading}
            className="rounded-2xl h-11"
          />
          <p className="text-[11px] text-slate-400">
            Facilita o agrupamento e filtro no Portal Pedagógico da Escola.
          </p>
        </div>
        {/* Cor Favorita (5 swatches dos módulos) */}
        <div className="space-y-2 text-left">
          <Label className="text-xs font-bold text-slate-700">Cor favorita (tema do perfil)</Label>
          <div className="flex items-center gap-3">
            {swatchColors.map((swatch) => {
              const isSelected = favoriteColor.toLowerCase() === swatch.color.toLowerCase()
              return (
                <button
                  key={swatch.color}
                  type="button"
                  onClick={() => setFavoriteColor(swatch.color)}
                  className={`w-10 h-10 rounded-2xl transition-all flex items-center justify-center ${
                    isSelected
                      ? 'scale-110 ring-4 ring-orange-200 shadow-md'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.name}
                >
                  {isSelected && <span className="text-white text-xs font-black">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
        {/* Configuração da Sessão Diária da Criança */}
        <div className="pt-2 border-t border-slate-100 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-black text-slate-800">
                ⚙️ Configuração da Sessão Diária
              </Label>
              <p className="text-[11px] text-slate-500">
                Ajuste a duração e a quantidade de atividades diárias para esta criança
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duração em minutos */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <Label htmlFor="dailyMinutes" className="text-[11px] font-bold text-slate-700">
                Duração sugerida (minutos)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="dailyMinutes"
                  type="number"
                  min={3}
                  max={60}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Math.max(3, Number(e.target.value)))}
                  className="rounded-xl h-10 bg-white"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">minutos</span>
              </div>
              <p className="text-[10px] text-slate-400">Recomendado: 10 a 20 min</p>
            </div>

            {/* Quantidade de atividades */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <Label htmlFor="dailyActivityCount" className="text-[11px] font-bold text-slate-700">
                Quantidade de atividades
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="dailyActivityCount"
                  type="number"
                  min={1}
                  max={6}
                  value={dailyActivityCount}
                  onChange={(e) =>
                    setDailyActivityCount(Math.min(6, Math.max(1, Number(e.target.value))))
                  }
                  className="rounded-xl h-10 bg-white"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">jogos</span>
              </div>
              <p className="text-[10px] text-slate-400">Padrão: 3 desafios diários</p>
            </div>
          </div>
        </div>
        {/* Junior Age Info Alert */}
        {calculatedMonths > 0 && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
              isJuniorAge
                ? 'bg-indigo-50/90 border-indigo-200 text-indigo-900'
                : 'bg-orange-50/90 border-orange-200 text-orange-900'
            }`}
          >
            <span className="text-xl shrink-0">{isJuniorAge ? '🚀' : '🌱'}</span>
            <div>
              <p className="font-bold">
                {isJuniorAge
                  ? `Criança com ${(calculatedMonths / 12).toFixed(1)} anos (${calculatedMonths}m) → Direcionamento Automático: CogniKids Junior (6 a 10 anos)`
                  : `Criança com ${(calculatedMonths / 12).toFixed(1)} anos (${calculatedMonths}m) → CogniKids Infantil (0 a 5 anos)`}
              </p>
              <p className="opacity-80 text-[11px]">
                {isJuniorAge
                  ? 'Os jogos serão calibrados com vocabulário avançado, ditado por voz, matemática e lógica.'
                  : 'Os jogos serão calibrados para primeiras palavras, Cérebro em Flor e estímulos sensoriais.'}
              </p>
            </div>
          </div>
        )}
        {/* Actions */}
        <div className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/children')}
            className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-700 font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !name.trim() || !birthDate}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black shadow-md"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : isEdit ? (
              'Salvar Alterações'
            ) : isJuniorAge ? (
              'Cadastrar & Ir para Junior 🚀'
            ) : (
              'Cadastrar Criança'
            )}
          </Button>
        </div>{' '}
      </form>
    </div>
  )
}
