import React from 'react'
import { useNavigate } from 'react-router-dom'
import { School, ArrowRight, X, Sparkles, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TeacherNote, Child } from '@/types/cognikids'
import { compileTeacherNotesSummary } from '@/lib/teacherNotesSummary'
import { markCurrentWeeklyBulletinSeen } from '@/services/reminders'
import { useSound } from '@/context/SoundContext'

interface WeeklyBulletinBannerProps {
  childrenList: Child[]
  allNotes: TeacherNote[]
  userId?: string
  onDismiss: () => void
}

export const WeeklyBulletinBanner: React.FC<WeeklyBulletinBannerProps> = ({
  childrenList,
  allNotes,
  userId,
  onDismiss,
}) => {
  const navigate = useNavigate()
  const { playPop } = useSound()

  // Compila resumo das anotações das crianças da família
  const summary = compileTeacherNotesSummary(allNotes, 'week')

  const handleOpen = () => {
    playPop()
    markCurrentWeeklyBulletinSeen(userId)
    onDismiss()
    if (childrenList.length > 0) {
      navigate(`/app/child/${childrenList[0].id}#teacher-notes`)
    } else {
      navigate('/app/reports')
    }
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    playPop()
    markCurrentWeeklyBulletinSeen(userId)
    onDismiss()
  }

  return (
    <div
      onClick={handleOpen}
      className="cursor-pointer bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-5 sm:p-6 shadow-lg border-2 border-indigo-400/50 hover:border-indigo-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
    >
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
          <School className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-amber-950" />
              <span>Boletim da Semana Liberado!</span>
            </span>
            <span className="text-xs font-semibold text-indigo-200">
              Horário fixo semanal de acompanhamento
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Resumo Semanal do Professor & Diário Escolar
          </h3>

          <p className="text-xs text-indigo-100 line-clamp-2 leading-relaxed">
            {summary.highlightText}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-indigo-200 pt-1">
            <span className="flex items-center gap-1 font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>{summary.totalNotes} registro(s) pedagógico(s)</span>
            </span>
            {summary.teachersInvolved.length > 0 && (
              <span className="truncate">Professores: {summary.teachersInvolved.join(', ')}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end md:self-center shrink-0 w-full md:w-auto justify-end">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleOpen()
          }}
          className="h-10 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md shadow-amber-400/20 flex items-center gap-1.5"
        >
          <span>Abrir Boletim Completo</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Dispensar boletim"
          className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white flex items-center justify-center transition-colors"
          title="Já conferi o boletim desta semana"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
