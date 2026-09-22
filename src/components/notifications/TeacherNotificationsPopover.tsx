import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  School,
  Check,
  CheckCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { TeacherNoteNotification } from '@/services/teacherNotificationService'
import { teacherNotificationService } from '@/services/teacherNotificationService'
import { useSound } from '@/context/SoundContext'

interface TeacherNotificationsPopoverProps {
  notifications: TeacherNoteNotification[]
  unreadCount: number
  userId?: string
  className?: string
  align?: 'end' | 'start' | 'center'
}

export const TeacherNotificationsPopover: React.FC<TeacherNotificationsPopoverProps> = ({
  notifications,
  unreadCount,
  userId,
  className = '',
  align = 'end',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { playPop } = useSound()

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      playPop()
    }
  }

  const handleNotificationClick = (item: TeacherNoteNotification) => {
    teacherNotificationService.markAsRead(item.noteId, userId)
    setIsOpen(false)
    playPop()
    // Navega para o dashboard da criança com a âncora/seção de anotações
    navigate(`/app/child/${item.childId}#teacher-notes`)
  }

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    playPop()
    teacherNotificationService.markAllAsRead(userId)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notificações da escola (${unreadCount} novas)`}
          className={`relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors ${className}`}
        >
          <Bell className="w-5 h-5 text-indigo-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={8}
        className="w-[360px] sm:w-[400px] p-0 rounded-3xl shadow-2xl border-slate-200/90 overflow-hidden z-50 bg-white"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <School className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>Anotações da Escola</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-500 text-white px-2 py-0.2 rounded-full font-bold">
                      {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-indigo-100">
                  Novidades pedagógicas enviadas pelos professores
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-indigo-100 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Ler todas</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <School className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">Nenhuma anotação no momento</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Quando os professores registrarem aulas ou observações na escola, você receberá aqui
                em primeira mão.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const formattedDate = item.noteDate
                ? new Date(item.noteDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recente'

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition-colors cursor-pointer hover:bg-indigo-50/60 flex items-start gap-3 text-left relative ${
                    !item.isRead ? 'bg-indigo-50/30' : 'bg-white'
                  }`}
                >
                  {/* Indicator Dot */}
                  {!item.isRead && (
                    <span
                      className="absolute top-4 left-2 w-2 h-2 rounded-full bg-indigo-600"
                      title="Não lida"
                    />
                  )}

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 ml-1">
                    <School className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-indigo-700 truncate">
                        {item.childName} • {item.authorName}
                      </span>
                      <span className="text-slate-400 text-[10px] shrink-0 ml-1">
                        {formattedDate}
                      </span>
                    </div>

                    <p className="text-xs font-black text-slate-800 line-clamp-1">
                      {item.lessonActivity}
                    </p>

                    {item.observation && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                        {item.observation}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 hover:underline">
                        <span>Ver Diário</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              navigate('/escola')
            }}
            className="text-[11px] font-bold text-slate-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Portal da Escola</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {notifications.length > 0 && (
            <span className="text-[10px] text-slate-400 font-semibold">
              {notifications.length} anotaç{notifications.length === 1 ? 'ão' : 'ões'}
            </span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
