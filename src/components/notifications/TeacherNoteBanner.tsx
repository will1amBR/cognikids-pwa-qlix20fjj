import React from 'react'
import { useNavigate } from 'react-router-dom'
import { School, ArrowRight, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TeacherNoteNotification } from '@/services/teacherNotificationService'
import { teacherNotificationService } from '@/services/teacherNotificationService'
import { useSound } from '@/context/SoundContext'

interface TeacherNoteBannerProps {
  notification: TeacherNoteNotification
  onDismiss?: () => void
  userId?: string
}

export const TeacherNoteBanner: React.FC<TeacherNoteBannerProps> = ({
  notification,
  onDismiss,
  userId,
}) => {
  const navigate = useNavigate()
  const { playPop } = useSound()

  const handleOpen = () => {
    playPop()
    teacherNotificationService.markAsRead(notification.noteId, userId)
    navigate(`/app/child/${notification.childId}#teacher-notes`)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    playPop()
    teacherNotificationService.markAsRead(notification.noteId, userId)
    if (onDismiss) onDismiss()
  }

  return (
    <div
      onClick={handleOpen}
      className="cursor-pointer bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-50/70 border border-indigo-200/90 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shrink-0 shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
          <School className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Nova Anotação da Escola 📝
            </span>
            <span className="text-xs font-bold text-slate-500">
              {notification.childName} • {notification.authorName}
            </span>
          </div>

          <h4 className="text-sm font-black text-slate-800 mt-1 truncate">
            {notification.lessonActivity}
          </h4>

          {notification.observation && (
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
              "{notification.observation}"
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleOpen()
          }}
          className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <span>Ver no Diário</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Dispensar aviso"
          className="w-8 h-8 rounded-xl hover:bg-indigo-100/70 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
