import type { TeacherNote, Child } from '@/types/cognikids'

export interface TeacherNotesWeeklySummary {
  periodDays: number
  totalNotes: number
  teachersInvolved: string[]
  mainActivities: string[]
  allTags: string[]
  notes: TeacherNote[]
  hasNotesInPeriod: boolean
  highlightText: string
}

/**
 * Filtra e compila as anotações feitas pelos professores para a criança no período especificado (semanal 7d ou mensal 30d).
 * Caso não haja anotações no intervalo estrito de 7 dias, inclui as anotações mais recentes disponíveis
 * com aviso claro de data, garantindo que o responsável sempre veja o parecer pedagógico escolar.
 */
export function compileTeacherNotesSummary(
  notes: TeacherNote[],
  period: 'week' | 'month' = 'week',
): TeacherNotesWeeklySummary {
  const days = period === 'week' ? 7 : 30
  const now = new Date().getTime()
  const periodCutoff = now - days * 24 * 60 * 60 * 1000

  // Anotações dentro do período exato
  const inPeriod = notes.filter((n) => {
    const time = new Date(n.note_date || n.created).getTime()
    return time >= periodCutoff
  })

  // Se não houver no período estrito, utiliza as anotações disponíveis mais recentes (até 5)
  const targetNotes = inPeriod.length > 0 ? inPeriod : notes.slice(0, 5)
  const hasNotesInPeriod = inPeriod.length > 0

  const teachersSet = new Set<string>()
  const activities: string[] = []
  const tagsSet = new Set<string>()

  targetNotes.forEach((n) => {
    if (n.author_name) teachersSet.add(n.author_name)
    if (n.lesson_activity && !activities.includes(n.lesson_activity)) {
      activities.push(n.lesson_activity)
    }
    if (n.tags && Array.isArray(n.tags)) {
      n.tags.forEach((t) => tagsSet.add(t))
    }
  })

  // Monta texto compilado de destaque
  let highlightText = ''
  if (targetNotes.length === 0) {
    highlightText = 'Nenhuma anotação escolar registrada até o momento.'
  } else if (hasNotesInPeriod) {
    const profs = Array.from(teachersSet).join(', ')
    highlightText = `Nesta semana, os professores (${profs}) trabalharam ${activities.length} atividade(s) pedagógica(s) focadas em ${Array.from(tagsSet).slice(0, 4).join(', ') || 'desenvolvimento integral'}.`
  } else {
    highlightText = `Compilado dos últimos registros pedagógicos realizados pela equipe escolar (${Array.from(teachersSet).join(', ') || 'Professores'}).`
  }

  return {
    periodDays: days,
    totalNotes: targetNotes.length,
    teachersInvolved: Array.from(teachersSet),
    mainActivities: activities,
    allTags: Array.from(tagsSet),
    notes: targetNotes,
    hasNotesInPeriod,
    highlightText,
  }
}
