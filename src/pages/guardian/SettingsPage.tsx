import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Smartphone,
  BellRing,
  Globe,
  Compass,
} from 'lucide-react'
import { GuidedTourOverlay } from '@/components/tour/GuidedTourOverlay'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { offlineSyncService } from '@/lib/offlineSync'
import { RoutineReminderSettings } from '@/components/reminders/RoutineReminderSettings'
import { useLanguage } from '@/context/LanguageContext'
import { SUPPORTED_LANGUAGES, AppLanguage } from '@/types/cognikids'

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const { language, setLanguage, t } = useLanguage()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSavingLanguage, setIsSavingLanguage] = useState(false)
  const [showTourModal, setShowTourModal] = useState(false)

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSavingName(true)
    try {
      await pb.collection('users').update(user.id, { name: name.trim() })
      await refreshUser()
      toast({ title: 'Nome atualizado com sucesso!' })
    } catch (_) {
      toast({ title: 'Erro ao atualizar nome.', variant: 'destructive' })
    } finally {
      setIsSavingName(false)
    }
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || email === user?.email) return
    setIsRequestingEmailChange(true)
    try {
      await pb.collection('users').requestEmailChange(email.trim())
      toast({
        title: 'Confirmação enviada',
        description: `Enviamos um link de confirmação para ${email}.`,
      })
    } catch (_) {
      toast({ title: 'Não foi possível solicitar alteração de email.', variant: 'destructive' })
    } finally {
      setIsRequestingEmailChange(false)
    }
  }

  const handleForceSync = async () => {
    setIsSyncing(true)
    const res = await offlineSyncService.syncQueue()
    setIsSyncing(false)
    toast({
      title: 'Sincronização manual',
      description: `${res.syncedCount} jogada(s) enviadas para a nuvem.`,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Ajustes & Conta</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configurações da conta do responsável e sincronização offline
        </p>
      </div>

      {/* Guided Tour Reset Card */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100 rounded-3xl p-6 sm:p-8 border border-orange-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Tour Guiado do Aplicativo</h2>
              <p className="text-xs text-slate-600">
                Conheça passo a passo os módulos, a rotina diária e as novidades
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowTourModal(true)}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 shadow-sm"
          >
            Ver tour novamente
          </Button>
        </div>
      </div>

      {showTourModal && (
        <GuidedTourOverlay
          isOpen={showTourModal}
          onDismiss={() => setShowTourModal(false)}
          onComplete={() => {
            setShowTourModal(false)
            toast({ title: 'Tour concluído! 🎉' })
          }}
        />
      )}

      {/* Interface Language Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Globe className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-black text-slate-800">{t('settings.interfaceLanguage')}</h2>
        </div>
        <p className="text-xs text-slate-500">{t('settings.interfaceLanguageDesc')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {SUPPORTED_LANGUAGES.map((opt) => {
            const isSelected = language === opt.code
            return (
              <button
                key={opt.code}
                type="button"
                onClick={async () => {
                  setIsSavingLanguage(true)
                  await setLanguage(opt.code)
                  setIsSavingLanguage(false)
                  toast({
                    title: 'Idioma atualizado',
                    description: `Interface configurada para ${opt.nativeName}.`,
                  })
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.flag}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.nativeName}</p>
                  </div>
                </div>
                {isSelected && <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Routine Daily Reminder Card */}
      <RoutineReminderSettings />

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <User className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-black text-slate-800">Meus Dados</h2>
        </div>

        <form onSubmit={handleSaveName} className="space-y-3">
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-slate-700">Nome do responsável</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl h-11"
              />
              <Button
                type="submit"
                disabled={isSavingName || name === user?.name}
                className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shrink-0"
              >
                {isSavingName ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>

        <form onSubmit={handleRequestEmailChange} className="space-y-3 pt-2">
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-bold text-slate-700">Email de login</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl h-11"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isRequestingEmailChange || email === user?.email}
                className="rounded-2xl border-slate-300 font-bold shrink-0"
              >
                {isRequestingEmailChange ? 'Enviando…' : 'Alterar email'}
              </Button>
            </div>
            <p className="text-[11px] text-slate-400">
              Ao alterar, você receberá uma confirmação no novo endereço.
            </p>
          </div>
        </form>
      </div>

      {/* PWA & Offline Sync Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HardDrive className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-black text-slate-800">Armazenamento & Offline</h2>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            O CogniKids foi feito para funcionar em viagens, no carro ou sem conexão. Todas as
            jogadas da criança ficam salvas no dispositivo e sobem automaticamente para a nuvem
            quando houver internet.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div>
              <p className="text-xs font-bold text-slate-800">Forçar sincronização manual</p>
              <p className="text-[11px] text-slate-400">
                Verifica se há partidas pendentes e sincroniza com o servidor
              </p>
            </div>
            <Button
              onClick={handleForceSync}
              disabled={isSyncing}
              variant="outline"
              className="rounded-2xl border-slate-300 font-bold shrink-0"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
