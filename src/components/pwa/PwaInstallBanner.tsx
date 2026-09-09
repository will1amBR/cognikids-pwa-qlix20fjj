import React, { useState, useEffect } from 'react'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import { Download, Share, PlusSquare, X, Smartphone, Sparkles, Check } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'cognikids_pwa_prompt_dismissed_until'
const DISMISS_DAYS = 3 // Lembrar após 3 dias se dispensar

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)
  const [isInstalledJustNow, setIsInstalledJustNow] = useState(false)

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed PWA)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    setIsStandalone(isInStandaloneMode)
    if (isInStandaloneMode) return

    // 2. Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isSafari =
      /safari/.test(userAgent) && !/chrome|crios|fxios|edgios|android/.test(userAgent)
    setIsIos(isIosDevice && isSafari)

    // 3. Check dismissed state from localStorage
    const dismissedUntil = localStorage.getItem(DISMISS_KEY)
    if (dismissedUntil) {
      const dismissTime = parseInt(dismissedUntil, 10)
      if (Date.now() < dismissTime) {
        setIsDismissed(true)
        return
      }
    }
    setIsDismissed(false)

    // 4. Capture native beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsDismissed(false)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstalledJustNow(true)
      setIsStandalone(true)
      setTimeout(() => setIsDismissed(true), 4000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    const nextCheck = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, nextCheck.toString())
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setIsInstalledJustNow(true)
        setDeferredPrompt(null)
      } else {
        handleDismiss()
      }
    } else if (isIos) {
      setShowIosGuide(true)
    } else {
      // General instructions fallback
      setShowIosGuide(true)
    }
  }

  // Do not display if app is standalone or prompt is dismissed and not just installed
  if (isStandalone && !isInstalledJustNow) return null
  if (isDismissed && !isInstalledJustNow) return null

  // Success State right after installing
  if (isInstalledJustNow) {
    return (
      <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <p className="font-black text-sm sm:text-base">CogniKids instalado com sucesso! 🎉</p>
            <p className="text-xs text-emerald-100">
              Agora você pode jogar 100% offline direto da tela inicial do seu celular.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-sky-50 rounded-3xl p-4 sm:p-6 border-2 border-orange-200/90 shadow-xl shadow-orange-500/10 animate-fade-in">
      {/* Decorative Blob */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-300/20 rounded-full blur-2xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all shadow-xs"
        aria-label="Dispensar banner de instalação"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side: Mascot + Text */}
        <div className="flex items-center gap-3.5 sm:gap-4 pr-6 sm:pr-0">
          <div className="relative shrink-0">
            <TicoMascot size="sm" mood="celebrating" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
              ★
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                Instale no Celular
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Modo Offline Real
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 mt-1">
              Adicione o CogniKids à Tela Inicial 📱
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl leading-relaxed">
              Tenha tela cheia sem barras do navegador, carregamento instantâneo e jogos que
              funcionam mesmo sem sinal de internet ou no modo avião!
            </p>
          </div>
        </div>

        {/* Right Side: Install Button & Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-none h-11 px-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Instalar CogniKids</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="h-11 px-3 rounded-2xl text-slate-500 hover:text-slate-800 text-xs font-bold"
          >
            Agora não
          </Button>
        </div>
      </div>

      {/* iOS Safari Fallback Step-by-Step Guide */}
      {showIosGuide && (
        <div className="mt-4 pt-4 border-t border-orange-200/80 bg-white/70 rounded-2xl p-4 text-slate-800 animate-fade-in text-xs sm:text-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-black text-orange-700 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              Como instalar no iPhone / iPad (Safari) ou navegador móvel:
            </span>
            <button
              onClick={() => setShowIosGuide(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Fechar
            </button>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </span>
              <span>
                Toque no botão de <b>Compartilhar</b>{' '}
                <Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> na barra inferior do
                Safari.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </span>
              <span>
                Role a lista de opções para baixo e selecione <b>Adicionar à Tela de Início</b>{' '}
                <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" />.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </span>
              <span>
                Toque em <b>Adicionar</b> no canto superior direito. Pronto! O ícone do CogniKids
                aparecerá no seu celular.
              </span>
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
