import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Users, Mic, WifiOff, Sparkles, ArrowRight, Star, Heart, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const IndexPage: React.FC = () => {
  const { isValid, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isValid) {
      navigate('/app', { replace: true })
    }
  }, [isValid, isLoading, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 flex flex-col justify-between items-center p-4 sm:p-8 select-none relative overflow-hidden">
      {/* Background Floats */}
      <div className="absolute top-[-80px] left-[-60px] w-96 h-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center relative z-10 pt-2">
        <div className="flex items-center gap-2">
          <TicoMascot size="sm" mood="happy" animate={false} />
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 bg-clip-text text-transparent">
            CogniKids
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/demo" className="hidden sm:inline-block">
            <Button
              variant="outline"
              className="rounded-full border-indigo-300 bg-white/80 hover:bg-indigo-50 text-indigo-700 font-extrabold text-xs shadow-xs"
            >
              🎭 Kit Apresentação
            </Button>
          </Link>
          <Link to="/escola?code=ESCOLA-DEMO01">
            <Button
              variant="outline"
              className="rounded-full border-indigo-200 bg-white/70 hover:bg-white text-indigo-800 font-bold text-xs"
            >
              🏫 Portal Escola
            </Button>
          </Link>
          <Link to="/login">
            <Button
              variant="ghost"
              className="rounded-full text-slate-700 font-bold hover:bg-white/60 text-xs sm:text-sm"
            >
              Entrar
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20 text-xs sm:text-sm">
              Criar conta
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-4xl mx-auto my-auto py-8 sm:py-12 flex flex-col items-center text-center relative z-10">
        <div className="mb-4 relative">
          <TicoMascot size="xl" mood="waving" />
          <div className="absolute -top-2 -right-4 bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-full shadow-md animate-bounce">
            0 a 60 meses
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-3xl leading-tight sm:leading-tight">
          Desenvolvimento cognitivo e da fala{' '}
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 bg-clip-text text-transparent">
            comprovado e lúdico
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-xl text-slate-600 max-w-2xl font-medium">
          A criança escuta, aprende a falar, grava a própria voz e recebe feedback automático do
          mascote Tico.
        </p>

        {/* Categories Strip */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
          <span className="bg-white/80 text-orange-800 text-xs font-black px-3 py-1 rounded-full border border-orange-200">
            🐮 Animais da Fazenda
          </span>
          <span className="bg-white/80 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
            🦖 Dinossauros
          </span>
          <span className="bg-white/80 text-rose-800 text-xs font-black px-3 py-1 rounded-full border border-rose-200">
            🍎 Frutas & Alimentos
          </span>
          <span className="bg-white/80 text-purple-800 text-xs font-black px-3 py-1 rounded-full border border-purple-200">
            🎨 Cores & Formas
          </span>
          <span className="bg-white/80 text-sky-800 text-xs font-black px-3 py-1 rounded-full border border-sky-200">
            🔢 Números de 1 a 10
          </span>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-orange-100 shadow-sm flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Sessão Diária</p>
              <p className="text-sm font-bold text-slate-800">Rotina Guiada por Idade</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-sky-100 shadow-sm flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Fala & Voz</p>
              <p className="text-sm font-bold text-slate-800">Reconhecimento de fala</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Modo Híbrido</p>
              <p className="text-sm font-bold text-slate-800">100% offline no PWA</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <Link to="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full h-14 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <span>Começar agora</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 px-8 rounded-2xl border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-base bg-white/70"
            >
              Já tenho conta
            </Button>
          </Link>
        </div>

        {/* Highlighted School Demo Direct Access Card */}
        <div className="mt-6 w-full max-w-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-400/30">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">🏫</span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Apresentação Escolar Imediata
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-tight">
              Acesso direto para diretores, coordenadores e pedagogos
            </p>
            <p className="text-xs text-indigo-200">
              Código ativo:{' '}
              <code className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold text-white">
                ESCOLA-DEMO01
              </code>{' '}
              (sem precisar logar)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Link to="/escola?code=ESCOLA-DEMO01" className="flex-1 sm:flex-initial">
              <Button
                size="sm"
                className="w-full h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black text-xs shadow-md"
              >
                <span>Ver demonstração escolar</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/demo" className="sm:inline-block">
              <Button
                size="sm"
                variant="outline"
                className="h-11 px-3 rounded-xl border-white/30 text-white bg-white/10 hover:bg-white/20 font-bold text-xs"
                title="Roteiro do Kit de Apresentação"
              >
                Roteiro
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl relative z-10 py-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>📱</span>
          <span>CogniKids PWA — instale no seu celular para jogar offline</span>
        </div>
        <div>
          <span>Desenvolvido com carinho para a primeira infância</span>
        </div>
      </footer>
    </div>
  )
}

export default IndexPage
