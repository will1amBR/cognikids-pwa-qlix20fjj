import React, { useState, useEffect } from 'react'
import {
  getReminderConfig,
  saveReminderConfig,
  requestBrowserNotificationPermission,
  sendLocalNotification,
} from '@/services/reminders'
import type { GuardianReminderConfig } from '@/types/cognikids'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useSound } from '@/context/SoundContext'
import { Bell, BellRing, Sparkles, Clock, CheckCircle2, AlertCircle, Play } from 'lucide-react'

export const RoutineReminderSettings: React.FC = () => {
  const { toast } = useToast()
  const { playPop, playStarReward } = useSound()

  const [config, setConfig] = useState<GuardianReminderConfig>({
    reminder_enabled: false,
    reminder_time: '18:00',
  })
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const saved = await getReminderConfig()
      setConfig(saved)
      if ('Notification' in window) {
        setPermissionState(Notification.permission)
      }
    }
    load()
  }, [])

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
        title: 'Lembrete de rotina salvo! ⏰',
        description: config.reminder_enabled
          ? `Lembrete diário agendado para às ${config.reminder_time}.`
          : 'Lembrete diário desativado.',
      })
    } catch (_) {
      toast({ title: 'Erro ao salvar configuração', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
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

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleTestReminder}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          >
            <Play className="w-3.5 h-3.5 mr-1 text-orange-500" />
            Testar Notificação Agora
          </Button>

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
