import React, { useState, useEffect } from 'react'
import {
  MessageCircle,
  Send,
  User,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Smile,
  Heart,
  ThumbsUp,
  Clock,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { NoteReply, TeacherNote } from '@/types/cognikids'
import { noteRepliesService } from '@/services/noteReplies'
import { useSound } from '@/context/SoundContext'
import { useToast } from '@/hooks/use-toast'

interface NoteRepliesThreadProps {
  note: TeacherNote
  currentRole: 'parent' | 'teacher'
  currentUserName?: string
  initialOpen?: boolean
  onReplyAdded?: (reply: NoteReply) => void
}

const QUICK_REACTIONS = [
  { emoji: '❤️', label: 'Amamos!' },
  { emoji: '👏', label: 'Parabéns!' },
  { emoji: '🙏', label: 'Obrigado(a)!' },
  { emoji: '🏠', label: 'Vou reforçar em casa' },
]

export const NoteRepliesThread: React.FC<NoteRepliesThreadProps> = ({
  note,
  currentRole,
  currentUserName,
  initialOpen = false,
  onReplyAdded,
}) => {
  const [replies, setReplies] = useState<NoteReply[]>([])
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { playPop } = useSound()
  const { toast } = useToast()

  const loadReplies = async () => {
    try {
      const list = await noteRepliesService.fetchRepliesByNote(note.id)
      setReplies(list)
    } catch (err) {
      console.warn('Could not load replies for note', note.id, err)
    }
  }

  useEffect(() => {
    loadReplies()
    const unsub = noteRepliesService.onSyncChange(() => {
      loadReplies()
    })
    return () => unsub()
  }, [note.id])

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || message).trim()
    if (!textToSend) return

    playPop()
    setIsSending(true)
    try {
      const defaultName =
        currentUserName?.trim() || (currentRole === 'parent' ? 'Família' : 'Professor(a)')
      const created = await noteRepliesService.addReply({
        note_id: note.id,
        author_role: currentRole,
        author_name: defaultName,
        message: textToSend,
      })

      setReplies((prev) => [...prev, created])
      setMessage('')
      setIsOpen(true)

      if (onReplyAdded) {
        onReplyAdded(created)
      }

      toast({
        title:
          currentRole === 'parent'
            ? 'Mensagem enviada à escola! 💬'
            : 'Resposta enviada aos pais! 💬',
        description: created.synced
          ? 'Salva em tempo real.'
          : 'Salva offline — sincronizará assim que houver rede.',
      })
    } catch (err) {
      console.error('Error posting reply', err)
      toast({
        title: 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const roleLabel = currentRole === 'parent' ? 'pais' : 'escola'
  const parentRepliesCount = replies.filter((r) => r.author_role === 'parent').length
  const teacherRepliesCount = replies.filter((r) => r.author_role === 'teacher').length

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
      {/* Toggle Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playPop()
            setIsOpen(!isOpen)
          }}
          className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {replies.length === 0
              ? 'Conversar sobre este registro'
              : `${replies.length} ${replies.length === 1 ? 'comentário' : 'comentários'}`}
          </span>
          {replies.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-extrabold">
              {parentRepliesCount} pais / {teacherRepliesCount} prof
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-3 h-3 ml-0.5" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-0.5" />
          )}
        </button>

        {/* Quick Reactions for Parents */}
        {currentRole === 'parent' && !isOpen && (
          <div className="flex items-center gap-1">
            {QUICK_REACTIONS.slice(0, 3).map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={() => handleSend(`${r.emoji} ${r.label}`)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-[11px] transition-colors"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Thread */}
      {isOpen && (
        <div className="mt-3 space-y-3 pl-1 sm:pl-2">
          {/* Quick reactions toolbar */}
          {currentRole === 'parent' && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {QUICK_REACTIONS.map((r) => (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => handleSend(`${r.emoji} ${r.label}`)}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <span>{r.emoji}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* List of Messages */}
          {replies.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic py-1">
              Nenhuma mensagem ainda. Inicie o diálogo sobre este registro abaixo.
            </p>
          ) : (
            <div className="space-y-2">
              {replies.map((reply) => {
                const isParent = reply.author_role === 'parent'
                const formattedTime = new Date(reply.created).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={reply.id}
                    className={`p-2.5 rounded-2xl flex items-start gap-2.5 ${
                      isParent
                        ? 'bg-amber-50/70 border border-amber-200/80'
                        : 'bg-indigo-50/70 border border-indigo-200/80'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isParent ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isParent ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-black text-slate-800 text-[11px]">
                          {reply.author_name || (isParent ? 'Família' : 'Professor(a)')}
                          <span
                            className={`ml-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                              isParent
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {isParent ? 'Família' : 'Escola'}
                          </span>
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          {reply.synced === false && (
                            <span className="text-amber-600 font-bold flex items-center gap-0.5">
                              <WifiOff className="w-2.5 h-2.5" />
                              offline
                            </span>
                          )}
                          <span>{formattedTime}</span>
                        </div>
                      </div>

                      <p className="text-slate-700 text-xs mt-0.5 whitespace-pre-wrap leading-relaxed">
                        {reply.message}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Form to post reply */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 pt-1"
          >
            <Input
              type="text"
              placeholder={
                currentRole === 'parent'
                  ? 'Responder à escola (dúvida, relato de casa ou agradecimento)...'
                  : 'Responder à família do aluno...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-10 text-xs rounded-xl bg-white"
            />
            <Button
              type="submit"
              disabled={isSending || !message.trim()}
              size="sm"
              className={`h-10 px-4 rounded-xl text-white font-bold text-xs shrink-0 ${
                currentRole === 'parent'
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>{isSending ? 'Enviando…' : 'Enviar'}</span>
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
