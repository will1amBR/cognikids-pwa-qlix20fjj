import React, { useState, useEffect } from 'react'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import {
  Download,
  Smartphone,
  Sparkles,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface TicoWelcomeInviteModalProps {
  guardianName?: string
}

export const TicoWelcomeInviteModal: React.FC<TicoWelcomeInviteModalProps> = ({
  guardianName = 'Família',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android')
  const [inviteCodeUsed, setInviteCodeUsed] = useState<string>('')
  const [turmaName, setTurmaName] = useState<string>('')

  useEffect(() => {
    // Check if user came from invite/coupon registration
    const signedUpWithInvite = localStorage.getItem('cognikids_signed_up_with_invite')
    const alreadyDismissed = localStorage.getItem('cognikids_tico_welcome_dismissed')

    if (signedUpWithInvite && !alreadyDismissed) {
      const code = localStorage.getItem('cognikids_pending_invite_code') || ''
      const turma = localStorage.getItem('cognikids_pending_class_group') || ''
      setInviteCodeUsed(code)
      setTurmaName(turma)

      // Detect iOS vs Android for tab default
      const ua = navigator.userAgent || ''
      if (/iPad|iPhone|iPod/.test(ua)) {
        setActiveTab('ios')
      } else {
        setActiveTab('android')
      }

      setIsOpen(true)
    }

    // Check if already in standalone PWA mode
    const standaloneCheck =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    setIsStandalone(Boolean(standaloneCheck))

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        handleDismiss()
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('cognikids_tico_welcome_dismissed', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-orange-200 relative my-8">
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          aria-label="Fechar boas-vindas"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot & Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2">
            <TicoMascot size="lg" mood="celebrating" />
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow uppercase">
              🎉 Convite Ativo!
            </div>
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full mt-2">
            Matrícula Conectada à Escola
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-2">
            Boas-vindas ao CogniKids, {guardianName}! 🦜
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-md">
            {turmaName ? (
              <span>
                Seu cadastro na turma <strong>{turmaName}</strong>{' '}
                {inviteCodeUsed ? `(${inviteCodeUsed})` : ''} foi realizado com sucesso!
              </span>
            ) : (
              <span>Seu acesso via convite escolar/turma foi validado com sucesso!</span>
            )}{' '}
            Para ter a melhor experiência pedagógica sem barra do navegador e com jogos funcionando
            offline, instale o app no seu celular:
          </p>
        </div>

        {/* Native Install Button (if Chrome / Edge triggers prompt) */}
        {deferredPrompt && !isStandalone && (
          <div className="mt-5">
            <Button
              onClick={handleInstallClick}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Instalar Aplicativo Oficial Agora</span>
            </Button>
          </div>
        )}

        {/* Platform Step-by-Step Tabs */}
        <div className="mt-5 bg-orange-50/70 rounded-2xl p-4 border border-orange-200/80">
          <div className="flex items-center justify-between pb-3 border-b border-orange-200/60">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-orange-600" />
              <span>Passo a passo no seu celular</span>
            </span>

            <div className="flex gap-1 bg-white p-1 rounded-xl border border-orange-200">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                  activeTab === 'android'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                  activeTab === 'ios'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                iPhone / iPad
              </button>
            </div>
          </div>

          <div className="pt-3 text-xs text-slate-700 space-y-2.5">
            {activeTab === 'android' ? (
              <>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    No <strong>Google Chrome</strong>, toque no menu de{' '}
                    <strong>3 pontinhos (⋮)</strong> no canto superior direito.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Selecione <strong>"Instalar aplicativo"</strong> ou{' '}
                    <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Confirme em <strong>"Instalar"</strong>. O ícone do CogniKids aparecerá junto
                    com seus outros apps!
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="flex items-center gap-1 flex-wrap">
                    No <strong>Safari</strong>, toque no botão <strong>Compartilhar</strong>
                    <Share className="w-3.5 h-3.5 inline text-blue-600" />
                    (quadrado com seta para cima na barra inferior).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="flex items-center gap-1 flex-wrap">
                    Role as opções e toque em <strong>"Adicionar à Tela de Início"</strong>
                    <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Toque em <strong>"Adicionar"</strong> no canto superior direito para finalizar.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Benefits bullets */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-600 font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Funciona 100% Offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sem barra do navegador</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Reconhecimento de Voz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sincronização com a Escola</span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-mono">kids.glikholding.com.br</span>

          <Button
            onClick={handleDismiss}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-5 shadow-sm"
          >
            Começar a Jogar! 🚀
          </Button>
        </div>
      </div>
    </div>
  )
}
