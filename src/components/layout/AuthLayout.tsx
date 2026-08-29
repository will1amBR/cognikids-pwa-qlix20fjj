import React from 'react'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-sky-50 to-rose-50 flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      {/* Playful Floating Background Blobs */}
      <div className="absolute top-[-80px] left-[-60px] w-72 h-72 rounded-full bg-orange-200/40 blur-3xl pointer-events-none animate-pulse" />
      <div
        className="absolute bottom-[-100px] right-[-60px] w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div className="absolute top-1/3 right-[-40px] w-64 h-64 rounded-full bg-emerald-200/30 blur-2xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-[-40px] w-64 h-64 rounded-full bg-rose-200/30 blur-2xl pointer-events-none" />

      {/* Decorative floating cute icons */}
      <div className="absolute top-12 left-10 text-3xl opacity-30 animate-float pointer-events-none hidden sm:block">
        🦁
      </div>
      <div
        className="absolute bottom-16 left-12 text-3xl opacity-30 animate-float pointer-events-none hidden sm:block"
        style={{ animationDelay: '1.5s' }}
      >
        🧩
      </div>
      <div
        className="absolute top-20 right-14 text-3xl opacity-30 animate-float pointer-events-none hidden sm:block"
        style={{ animationDelay: '2.5s' }}
      >
        🌟
      </div>
      <div
        className="absolute bottom-20 right-16 text-3xl opacity-30 animate-float pointer-events-none hidden sm:block"
        style={{ animationDelay: '3s' }}
      >
        🎨
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <Link
          to="/"
          className="flex flex-col items-center gap-1.5 mb-6 group transition-transform hover:scale-105"
        >
          <div className="relative">
            <TicoMascot size="lg" mood="happy" />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              0–5 ANOS
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 bg-clip-text text-transparent">
              CogniKids
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 text-center">
            Desenvolvimento cognitivo e da fala infantil
          </span>
        </Link>

        {/* Card */}
        <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-orange-100/80 p-6 sm:p-8">
          {(title || subtitle) && (
            <div className="text-center mb-6">
              {title && (
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
              )}
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>

        {/* PWA Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>📱</span>
          <span>CogniKids PWA — 100% em Português e funciona offline</span>
        </div>
      </div>
    </div>
  )
}
