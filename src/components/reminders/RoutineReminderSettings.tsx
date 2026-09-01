import React, { useState, useEffect } from 'react'
import {
  getReminderConfig,
  saveReminderConfig,
  requestBrowserNotificationPermission,
  sendLocalNotification,
  VOCAB_DAILY_PRACTICE_TIPS,
  getRandomVocabTip,
  VocabPracticeTip,
  computeVocabReviewQueue,
} from '@/services/reminders'
import { VocabReviewQueueCard } from '@/components/reminders/VocabReviewQueueCard'
import type { GuardianReminderConfig, AppLanguage, Child } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useSound } from '@/context/SoundContext'
import {
  Bell,
  BellRing,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Languages,
  Lightbulb,
  BookOpen,
} from 'lucide-react'

interface RoutineReminderSettingsProps {
  child?: Child | null
}

export const RoutineReminderSettings: React.FC<RoutineReminderSettingsProps> = ({ child }) => {
  const { toast } = useToast()
  const { playPop, playStarReward } = useSound()

  const [config, setConfig] = useState<GuardianReminderConfig>({
    reminder_enabled: false,
    reminder_time: '18:00',
    vocab_reminder_enabled: false,
    vocab_reminder_time: '10:00',
    vocab_reminder_language: 'en',
  })
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTip, setSelectedTip] = useState<VocabPracticeTip>(() => getRandomVocabTip('en'))

  useEffect(() => {
    const load = async () => {
      const saved = await getReminderConfig()
      setConfig(saved)
      const lang = (saved.vocab_reminder_language as AppLanguage) || 'en'
      setSelectedTip(getRandomVocabTip(lang))
      if ('Notification' in window) {
        setPermissionState(Notification.permission)
      }
    }
    load()
  }, [])

  const handleVocabToggle = async (enabled: boolean) => {
    playPop()
    const updated = { ...config, vocab_reminder_enabled: enabled }

    if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
      const perm = await requestBrowserNotificationPermission()
      setPermissionState(perm)
    }

    setConfig(updated)
    await saveReminderConfig(updated)
  }

  const handleVocabLanguageChange = (lang: AppLanguage) => {
    playPop()
    setConfig((prev) => ({ ...prev, vocab_reminder_language: lang }))
    setSelectedTip(getRandomVocabTip(lang))
  }

  const handleToggle = async (enabled: boolean) => {
    playPop()
    let updated = { ...config, reminder_enabled: enabled }

    if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
      const perm = await requestBrowserNotificationPermission()
      setPermissionState(perm)
      if (perm === 'granted') {
        toast({
          title: 'Notificações ativadas no navegador! 🔔',
          description: `O Tico vai lembrar você diariamente às ${config.reminder_time}.`,
        })
      } else {
        toast({
          title: 'Lembrete in-app ativado!',
          description:
            'Notificações do navegador bloqueadas. O aviso aparecerá quando o app estiver aberto.',
        })
      }
    }

    setConfig(updated)
    await saveReminderConfig(updated)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({ ...prev, reminder_time: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    playPop()
    setIsSaving(true)
    try {
      await saveReminderConfig(config)
      playStarReward(2)
      toast({
        title: 'Lembretes atualizados! ⏰',
        description: 'Suas preferências de rotina e revisão de vocabulário foram salvas.',
      })
    } catch (_) {
      toast({ title: 'Erro ao salvar configuração', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestVocabReminder = () => {
    playPop()
    const lang = (config.vocab_reminder_language as AppLanguage) || 'en'
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === lang)
    const tip = selectedTip || getRandomVocabTip(lang)
    sendLocalNotification(
      `🗣️ Revisão de Vocabulário em ${langInfo?.label || tip.languageLabel} ${langInfo?.flag || tip.flag}`,
      `Palavras prioritárias na fila: "${tip.wordNative}" (${tip.wordTranslation}). Dica: ${tip.practicalHomeTip}`,
    )
    toast({
      title: `🗣️ Fila de Revisão em ${langInfo?.label || tip.languageLabel} (${langInfo?.flag || tip.flag})`,
      description: `Palavra em destaque: "${tip.wordNative}" • ${tip.practicalHomeTip}`,
    })
  }

  const handleTestReminder = () => {
    playPop()
    sendLocalNotification(
      '🦖 Hora da Sessão Diária CogniKids!',
      'O Tico preparou joguinhos rápidos para hoje. Vamos desenvolver o cérebro brincando?',
    )
    toast({
      title: '🦖 Hora da Sessão Diária com o Tico!',
      description: 'Lembrete disparado: 10 a 15 minutos diários fortalecem o foco e a fala!',
    })
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Lembretes de Rotina Diária</h2>
            <p className="text-xs text-slate-500">
              Notificação no horário ideal para não esquecer a sessão com o Tico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={config.reminder_enabled}
            onCheckedChange={handleToggle}
            aria-label="Ativar lembrete diário"
          />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Horário da Notificação */}
          <div className="space-y-1.5 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <Label
              htmlFor="reminderTime"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>Horário do Lembrete Diário</span>
            </Label>
            <Input
              id="reminderTime"
              type="time"
              value={config.reminder_time}
              onChange={handleTimeChange}
              disabled={!config.reminder_enabled}
              className="rounded-xl h-11 bg-white font-mono font-bold text-base"
            />
            <p className="text-[11px] text-slate-400">
              Sugerido: final da tarde ou após a escola (ex: 18:00 ou 19:30).
            </p>
          </div>

          {/* Status da Permissão do Navegador */}
          <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
            <div>
              <Label className="text-xs font-bold text-slate-700">Camadas de Alerta</Label>
              <div className="mt-1 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Lembrete In-App:</strong> Ativo quando o app estiver aberto
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {permissionState === 'granted' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span>
                    <strong>Navegador / PWA:</strong>{' '}
                    {permissionState === 'granted' ? 'Permitido ✓' : 'Aguardando permissão'}
                  </span>
                </div>
              </div>
            </div>

            {permissionState !== 'granted' && config.reminder_enabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const perm = await requestBrowserNotificationPermission()
                  setPermissionState(perm)
                }}
                className="rounded-xl text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-100/50 mt-2"
              >
                Solicitar permissão de notificação
              </Button>
            )}
          </div>
        </div>

        {/* Vocabulary Revision Reminders Section */}
        <div className="pt-6 border-t border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-800">
                    Lembretes de Revisão de Vocabulário
                  </h3>
                  <span className="text-[10px] font-black uppercase bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                    Multilíngue
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Dicas práticas e lúdicas para o responsável praticar palavras do dia a dia com a
                  criança
                </p>
              </div>
            </div>

            <Switch
              checked={Boolean(config.vocab_reminder_enabled)}
              onCheckedChange={handleVocabToggle}
              aria-label="Ativar lembretes de vocabulário"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Horário da Revisão de Vocabulário */}
            <div className="space-y-1.5 text-left bg-sky-50/50 p-4 rounded-2xl border border-sky-200/70">
              <Label
                htmlFor="vocabReminderTime"
                className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Horário da Dica de Vocabulário</span>
              </Label>
              <Input
                id="vocabReminderTime"
                type="time"
                value={config.vocab_reminder_time || '10:00'}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, vocab_reminder_time: e.target.value }))
                }
                disabled={!config.vocab_reminder_enabled}
                className="rounded-xl h-11 bg-white font-mono font-bold text-base"
              />
              <p className="text-[11px] text-slate-400">
                Sugerido: manhã ou intervalo do almoço (ex: 10:00 ou 13:00).
              </p>
            </div>

            {/* Idioma em Foco para Revisão */}
            <div className="space-y-1.5 text-left bg-sky-50/50 p-4 rounded-2xl border border-sky-200/70">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Idioma Alvo da Revisão</span>
              </Label>
              <select
                value={config.vocab_reminder_language || 'en'}
                onChange={(e) => handleVocabLanguageChange(e.target.value as AppLanguage)}
                disabled={!config.vocab_reminder_enabled}
                className="w-full rounded-xl h-11 px-3 bg-white font-bold text-sm border border-slate-200 text-slate-800 outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Receba sugestões contextualizadas com o vocabulário das brincadeiras.
              </p>
            </div>
          </div>

          {/* Fila de Palavras do Vocabulário Conectada */}
          <div className="pt-2">
            <VocabReviewQueueCard
              child={child}
              initialLanguage={(config.vocab_reminder_language as AppLanguage) || 'pt-BR'}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleTestReminder}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl flex-1 sm:flex-initial"
            >
              <Play className="w-3.5 h-3.5 mr-1 text-orange-500" />
              Testar Notificação Geral
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestVocabReminder}
              className="text-xs font-bold text-sky-700 border-sky-200 hover:bg-sky-50 rounded-xl flex-1 sm:flex-initial"
            >
              <Languages className="w-3.5 h-3.5 mr-1 text-sky-600" />
              Testar Dica de Vocabulário
            </Button>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
          >
            {isSaving ? 'Salvando…' : 'Salvar Preferências'}
          </Button>
        </div>
      </form>
    </div>
  )
}
