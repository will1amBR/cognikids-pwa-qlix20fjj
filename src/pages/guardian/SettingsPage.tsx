import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, ShieldCheck, HardDrive, RefreshCw, Smartphone, BellRing } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { offlineSyncService } from '@/lib/offlineSync'
import { RoutineReminderSettings } from '@/components/reminders/RoutineReminderSettings'

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

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
