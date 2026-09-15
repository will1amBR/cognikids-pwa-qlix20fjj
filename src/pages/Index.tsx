import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import {
  Sparkles,
  ArrowRight,
  Mic,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  School,
  ExternalLink,
} from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-white to-orange-50/40 flex flex-col justify-between text-slate-800 select-none relative overflow-x-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-200/30 via-amber-200/40 to-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar: Clean & Focused on Conversion */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <TicoMascot size="sm" mood="happy" animate={false} />
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 bg-clip-text text-transparent">
            CogniKids
          </span>
        </Link>

        {/* Clear Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login">
            <Button
              variant="ghost"
              className="rounded-full text-slate-700 hover:text-slate-900 font-bold hover:bg-slate-100/70 text-xs sm:text-sm px-4 h-10"
            >
              Entrar
            </Button>
          </Link>

          <Link to="/signup">
            <Button className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black shadow-md shadow-orange-500/25 text-xs sm:text-sm px-5 h-10 transition-transform active:scale-95">
              Criar conta
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Hero: Ultra Clean, High Conversion */}
      <main className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-14 flex flex-col items-center text-center relative z-10 my-auto">
        {/* Mascot Greeting */}
        <div className="mb-4 relative">
          <TicoMascot size="xl" mood="happy" animate={true} />
          <div className="absolute -top-1 -right-3 bg-amber-400 text-amber-950 font-black text-[11px] px-3 py-0.5 rounded-full shadow-md animate-bounce">
            0 a 10 anos
          </div>
        </div>

        {/* Catchy headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-3xl leading-tight sm:leading-tight">
          O estímulo cognitivo e da fala que{' '}
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 bg-clip-text text-transparent">
            as crianças adoram
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-xl text-slate-600 max-w-2xl font-medium leading-relaxed">
          Jogos interativos de 15 minutos ao dia com inteligência fonética, reconhecimento de voz e
          o mascote Tico, que ganha roupinhas e acessórios conforme a criança aprende.
        </p>

        {/* Main CTAs: Big & Focused on Signup */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
          <Link to="/signup" className="w-full sm:w-auto flex-1">
            <Button
              size="lg"
              className="w-full h-14 px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 group transition-all"
            >
              <span>Criar conta gratuita</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 px-7 rounded-2xl border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-base bg-white shadow-xs"
            >
              Entrar
            </Button>
          </Link>
        </div>

        {/* 3 Core Value Props Pills */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl text-left">
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Fala & Pronúncia</p>
              <p className="text-xs sm:text-sm font-black text-slate-800">
                A criança fala e o app avalia com IA fonética
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 fill-amber-400 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Gamificação com Moedas</p>
              <p className="text-xs sm:text-sm font-black text-slate-800">
                Ganha moedas para vestir e equipar o Tico
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">100% Seguro & BNCC</p>
              <p className="text-xs sm:text-sm font-black text-slate-800">
                Sem anúncios, offline no PWA e relatórios em PDF
              </p>
            </div>
          </div>
        </div>

        {/* Discreet School / Presentation Strip (Does NOT compete with signup) */}
        <div className="mt-8 pt-6 border-t border-slate-200/70 w-full max-w-2xl flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-600 flex items-center gap-1.5">
            <School className="w-4 h-4 text-indigo-600" />
            <span>Representa uma escola ou quer conhecer a demonstração?</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/demo"
              className="text-indigo-600 hover:text-indigo-800 font-bold underline decoration-indigo-300 underline-offset-2 flex items-center gap-1"
            >
              <span>Ver apresentação / Kit demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to="/escola?code=ESCOLA-DEMO01"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Portal da Escola
            </Link>
          </div>
        </div>
      </main>

      {/* Footer: Simple, clean and trustworthy */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>🦜</span>
          <span>CogniKids PWA — Primeira infância e alfabetização bilíngue</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link to="/demo" className="hover:text-slate-700">
            Apresentação Escolar
          </Link>
          <Link to="/login" className="hover:text-slate-700">
            Login
          </Link>
          <Link to="/signup" className="hover:text-slate-700 font-bold text-orange-600">
            Cadastre-se grátis
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default IndexPage
