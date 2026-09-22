import React, { useState } from 'react'
import {
  School,
  Calendar,
  Sparkles,
  BookOpen,
  Share2,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
  FileText,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TeacherNote, Child } from '@/types/cognikids'
import { compileTeacherNotesSummary } from '@/lib/teacherNotesSummary'
import { useSound } from '@/context/SoundContext'
import { useToast } from '@/hooks/use-toast'

interface TeacherWeeklySummaryCardProps {
  child: Child
  teacherNotes: TeacherNote[]
  period: 'week' | 'month'
  onExportPdf?: () => void
}

export const TeacherWeeklySummaryCard: React.FC<TeacherWeeklySummaryCardProps> = ({
  child,
  teacherNotes,
  period,
  onExportPdf,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const { playPop } = useSound()
  const { toast } = useToast()

  const summary = compileTeacherNotesSummary(teacherNotes, period)
  const periodTitle = period === 'week' ? 'Semanal' : 'Mensal'

  const handleShareSummary = async () => {
    playPop()
    const textToShare = `📋 Resumo ${periodTitle} do Professor - ${child.name} (CogniKids)\n${summary.highlightText}\n\nAtividades: ${summary.mainActivities.join(', ')}\nProfessores: ${summary.teachersInvolved.join(', ')}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resumo do Professor - ${child.name}`,
          text: textToShare,
        })
        toast({
          title: 'Resumo compartilhado com sucesso! 📤',
        })
      } catch (err) {
        // Ignora cancelamento pelo usuário
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare)
        toast({
          title: 'Copiado para a área de transferência! 📋',
          description: 'Você pode colar e enviar no WhatsApp ou e-mail.',
        })
      } catch {
        toast({
          title: 'Não foi possível copiar',
          variant: 'destructive',
        })
      }
    }
  }

  if (summary.notes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Resumo {periodTitle} do Professor</h2>
            <p className="text-xs text-slate-500">
              Ainda não há registros da escola para {child.name} neste período.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-md space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/25 shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                Relatório da Escola
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Resumo {periodTitle} do Professor
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compilado pedagógico das anotações da equipe escolar para {child.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareSummary}
            className="rounded-2xl border-indigo-200 text-indigo-700 hover:bg-indigo-100/60 font-bold text-xs flex items-center gap-1.5 h-9"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              playPop()
              setIsExpanded(!isExpanded)
            }}
            className="rounded-2xl text-slate-500 hover:text-slate-800 text-xs font-bold h-9 px-2.5"
          >
            {isExpanded ? (
              <>
                <span>Recolher</span>
                <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                <span>Ver detalhes ({summary.notes.length})</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Destaque Executivo Compilado */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900">
            Parecer Pedagógico Integrado
          </h3>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed font-medium">
          {summary.highlightText}
        </p>

        {/* Indicadores do Compilado */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/80">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Professores</span>
            <p className="text-xs font-black text-slate-800 truncate mt-0.5">
              {summary.teachersInvolved.join(', ') || 'Equipe Escolar'}
            </p>
          </div>

          <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/80">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">
              Anotações Feitas
            </span>
            <p className="text-xs font-black text-slate-800 mt-0.5">
              {summary.notes.length} registro{summary.notes.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80">
            <span className="text-[10px] font-bold text-amber-800 uppercase">
              Áreas Estimuladas
            </span>
            <p className="text-xs font-black text-slate-800 truncate mt-0.5">
              {summary.allTags.slice(0, 3).join(', ') || 'Integral'}
            </p>
          </div>
        </div>
      </div>

      {/* Lista detalhada das anotações agrupadas (expandível) */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Anotações e Diário das Aulas</span>
            <span className="text-[11px] font-normal text-slate-400">Ordem cronológica</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {summary.notes.map((note) => {
              const formattedDate = note.note_date
                ? new Date(note.note_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recente'

              return (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 text-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-indigo-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{note.author_name || 'Professor(a)'}</span>
                        {note.class_group && (
                          <span className="text-slate-400 font-normal">({note.class_group})</span>
                        )}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Aula / Atividade
                      </span>
                      <h4 className="font-black text-slate-900 text-sm mt-0.5">
                        {note.lesson_activity}
                      </h4>
                    </div>

                    {note.observation && (
                      <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        "{note.observation}"
                      </p>
                    )}
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-100">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-0.5"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
