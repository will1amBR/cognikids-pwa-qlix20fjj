import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '@/context/SoundContext'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { X, Volume2, VolumeX, Sparkles } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface GameShellProps {
  title: string
  moduleColor?: string
  currentRound: number
  totalRounds: number
  childName?: string
  exitPath: string
  children: React.ReactNode
  ticoMood?: 'happy' | 'talking' | 'celebrating' | 'listening' | 'waving'
  ticoInstruction?: string
}

export const GameShell: React.FC<GameShellProps> = ({
  title,
  moduleColor = '#FF7A45',
  currentRound,
  totalRounds,
  childName,
  exitPath,
  children,
  ticoMood = 'talking',
  ticoInstruction,
}) => {
  const navigate = useNavigate()
  const { isMuted, toggleMute, playPop } = useSound()
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const handleExitClick = () => {
    playPop()
    setShowExitConfirm(true)
  }

  const confirmExit = () => {
    navigate(exitPath)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 z-50 flex flex-col select-none overflow-hidden font-sans">
      {/* Background Soft Blobs */}
      <div
        className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: moduleColor }}
      />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />

      {/* Immersive Top Bar */}
      <header className="relative z-20 h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between">
        {/* Exit Button */}
        <button
          onClick={handleExitClick}
          className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95"
          aria-label="Sair do jogo"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Center Progress: Round indicator and dots */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: totalRounds }).map((_, idx) => {
              const isPassed = idx < currentRound
              const isCurrent = idx === currentRound - 1
              return (
                <div
                  key={idx}
                  className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'w-6 sm:w-8 bg-orange-500 ring-2 ring-orange-200 shadow-sm'
                      : isPassed
                        ? 'w-2.5 sm:w-3 bg-emerald-500'
                        : 'w-2.5 sm:w-3 bg-slate-200'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Right Audio Controls */}
        <button
          onClick={toggleMute}
          className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-all active:scale-95"
          aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-slate-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-orange-500" />
          )}
        </button>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-3 sm:p-6 max-w-4xl w-full mx-auto">
        <div className="w-full h-full flex flex-col items-center justify-between relative">
          {/* Tico Speech Balloon in top corner */}
          {ticoInstruction && (
            <div className="w-full flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-orange-100 shadow-lg max-w-lg mx-auto mb-2 animate-fade-in">
              <TicoMascot size="sm" mood={ticoMood} className="shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  Tico diz:
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                  {ticoInstruction}
                </p>
              </div>
            </div>
          )}

          {/* Central Stage */}
          <div className="flex-1 w-full flex items-center justify-center">{children}</div>
        </div>
      </main>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="rounded-3xl p-6 max-w-sm">
          <AlertDialogHeader>
            <div className="flex justify-center mb-2">
              <TicoMascot size="md" mood="talking" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold text-slate-800">
              Sair do jogo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-slate-500">
              Se você sair agora, o progresso desta rodada não será salvo. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="rounded-2xl font-semibold border-slate-200">
              Continuar jogando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="rounded-2xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Sim, quero sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
