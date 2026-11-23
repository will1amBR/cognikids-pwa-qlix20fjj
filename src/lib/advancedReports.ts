/**
 * Sistema de Relatórios Avançados — motor de análise (offline-first).
 * Calcula tudo a partir do histórico local (game_sessions / module_progress),
 * sem chamadas de rede: funciona offline como o resto do app.
 */
import type { Child, GameSession, ModuleProgress } from '@/types/cognikids'
import { COGNIKIDS_MODULES } from '@/types/cognikids'

export type AreaStatus = 'below' | 'expected' | 'above'

export interface WeeklyBucket {
  label: string // "12/05" (semana iniciando)
  start: Date
  end: Date
  sessions: number
  minutes: number
  stars: number
  accuracy: number | null
  moduleAccuracy: Record<string, number | null>
  languageAccuracy: Record<string, number | null>
  activeChildIds: Set<string>
}

export interface AreaTrend {
  moduleId: string
  title: string
  icon: string
  color: string
  series: (number | null)[] // por semana (mesmo índice de weeks)
  current: number
  changePct: number // variação recente vs 4 semanas anteriores
  declining: boolean // piora em 2 semanas seguidas
}

export interface AutoInsight {
  id: string
  icon: string
  text: string
  tone: 'positive' | 'neutral' | 'warning'
}

export interface DeclineAlert {
  moduleId: string
  title: string
  icon: string
  color: string
  dropPct: number
  suggestion: string
  gamePath: string
  tip: string
}

export interface AgeComparisonItem {
  moduleId: string
  title: string
  icon: string
  color: string
  childMastery: number
  expectedMastery: number
  status: AreaStatus
}

export interface LanguageEvolutionItem {
  code: string
  label: string
  flag: string
  series: (number | null)[]
  current: number
  totalSessions: number
}

export interface AdvancedReport {
  weeks: WeeklyBucket[]
  areaTrends: AreaTrend[]
  insights: AutoInsight[]
  alerts: DeclineAlert[]
  ageComparison: AgeComparisonItem[]
  languageEvolution: LanguageEvolutionItem[]
  totals: {
    sessions: number
    minutes: number
    stars: number
    activeDays: number
    languagesThisWeek: number
  }
}

const AREA_IDS = ['speech', 'memory', 'logic', 'motor', 'socioemotional']

/** Mapeia module_id da sessão para uma das 5 áreas cognitivas. */
export function mapModuleToArea(moduleId: string): string {
  const id = (moduleId || '').toLowerCase()
  if (AREA_IDS.includes(id)) return id
  if (id.startsWith('junior_vocab') || id.startsWith('junior_dictation')) return 'speech'
  if (id.startsWith('junior_math') || id.startsWith('junior_logic')) return 'logic'
  if (id.startsWith('junior_runner') || id.startsWith('junior_snake')) return 'motor'
  if (id.startsWith('junior_goal') || id.startsWith('junior_vocab_builder')) return 'memory'
  return 'memory'
}

const GAME_BY_AREA: Record<string, { name: string; path: string }> = {
  speech: { name: 'A Fazenda Falante', path: 'fazenda_falante' },
  memory: { name: 'Memória dos Dinos', path: 'memoria_dinos' },
  logic: { name: 'Sequência de Padrões', path: 'sequencia_padroes' },
  motor: { name: 'Estoura Bolhas', path: 'estoura_bolhas' },
  socioemotional: { name: 'Carinhas Felizes', path: 'carinhas_felizes' },
}

function sessionAccuracy(s: GameSession): number {
  return Math.round(s.accuracy ?? s.score ?? 80)
}

function sessionMinutes(s: GameSession): number {
  const details = (s.details as any) || {}
  if (typeof details.durationSeconds === 'number' && details.durationSeconds > 0) {
    return Math.max(1, Math.round(details.durationSeconds / 60))
  }
  return Math.max(1, Math.round((s.rounds_completed || 3) * 1.5))
}

function sessionLanguage(s: GameSession): string {
  const raw = (s as any).language || ((s.details as any) || {}).language
  if (!raw) return 'pt-BR'
  const norm = String(raw).toLowerCase()
  if (norm.startsWith('pt')) return 'pt-BR'
  if (norm.startsWith('en')) return 'en'
  if (norm.startsWith('es')) return 'es'
  if (norm.startsWith('de')) return 'de'
  if (norm.startsWith('fr')) return 'fr'
  return 'pt-BR'
}

function childAgeMonths(child: Child): number {
  return Math.max(
    1,
    (Date.now() - new Date(child.birth_date).getTime()) / (30.4375 * 24 * 3600 * 1000),
  )
}

/** Expectativa de assimilação por idade (meses) — curva pedagógica aproximada. */
export function expectedMasteryForAge(ageMonths: number, moduleId: string): number {
  const base = 38 + ageMonths * 0.62
  const offsets: Record<string, number> = {
    speech: 2,
    memory: 0,
    logic: -4,
    motor: 4,
    socioemotional: -2,
  }
  return Math.round(Math.min(92, Math.max(35, base + (offsets[moduleId] || 0))))
}

/** Cria N baldes semanais (mais antigo → mais recente), terminando hoje. */
export function buildWeeklyBuckets(sessions: GameSession[], weeksCount: number): WeeklyBucket[] {
  const now = new Date()
  const buckets: WeeklyBucket[] = []
  for (let i = weeksCount - 1; i >= 0; i--) {
    const end = new Date(now.getTime() - i * 7 * 24 * 3600 * 1000)
    const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000)
    buckets.push({
      label: `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth() + 1).padStart(2, '0')}`,
      start,
      end,
      sessions: 0,
      minutes: 0,
      stars: 0,
      accuracy: null,
      moduleAccuracy: {},
      languageAccuracy: {},
      activeChildIds: new Set(),
    })
  }

  sessions.forEach((s) => {
    const d = new Date(s.created).getTime()
    const bucket = buckets.find((b) => d >= b.start.getTime() && d < b.end.getTime())
    if (!bucket) return
    const acc = sessionAccuracy(s)
    const area = mapModuleToArea(s.module_id)
    bucket.sessions += 1
    bucket.minutes += sessionMinutes(s)
    bucket.stars += s.stars || 1
    bucket.activeChildIds.add(s.child_id)
    bucket.accuracy = bucket.accuracy == null ? acc : Math.round((bucket.accuracy + acc) / 2)
    const prevMod = bucket.moduleAccuracy[area]
    bucket.moduleAccuracy[area] = prevMod == null ? acc : Math.round((prevMod + acc) / 2)
    const lang = sessionLanguage(s)
    const prevLang = bucket.languageAccuracy[lang]
    bucket.languageAccuracy[lang] = prevLang == null ? acc : Math.round((prevLang + acc) / 2)
  })

  return buckets
}

function avgOfSeries(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v != null)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

export function buildAdvancedReport(
  child: Child,
  sessions: GameSession[],
  progress: ModuleProgress[],
  weeksCount: number = 8,
): AdvancedReport {
  const weeks = buildWeeklyBuckets(sessions, weeksCount)
  const areaTrends: AreaTrend[] = COGNIKIDS_MODULES.filter((m) => AREA_IDS.includes(m.id)).map(
    (mod) => {
      const series = weeks.map((w) => w.moduleAccuracy[mod.id] ?? null)
      const recent = avgOfSeries(series.slice(-2))
      const previous = avgOfSeries(series.slice(0, Math.max(0, series.length - 2)))
      const current =
        progress.find((p) => p.module_id === mod.id)?.mastery_percentage ?? recent ?? 45
      let changePct = 0
      if (recent != null && previous != null && previous > 0) {
        changePct = Math.round(((recent - previous) / previous) * 100)
      }
      const last3 = series.slice(-3)
      const declining =
        last3.length === 3 &&
        last3[0] != null &&
        last3[1] != null &&
        last3[2] != null &&
        (last3[1] as number) < (last3[0] as number) - 1 &&
        (last3[2] as number) < (last3[1] as number) - 1
      return {
        moduleId: mod.id,
        title: mod.title,
        icon: mod.icon,
        color: mod.color,
        series,
        current,
        changePct,
        declining,
      }
    },
  )

  // Alertas de queda: 2 semanas seguidas de piora
  const alerts: DeclineAlert[] = areaTrends
    .filter((a) => a.declining)
    .map((a) => {
      const game = GAME_BY_AREA[a.moduleId] || { name: 'Sessão Diária', path: 'fazenda_falante' }
      const moduleDef = COGNIKIDS_MODULES.find((m) => m.id === a.moduleId)
      const tip =
        moduleDef?.themes?.[0]?.homeTips?.[0] ||
        'Reforce a área com uma sessão curta de 10 minutos hoje.'
      return {
        moduleId: a.moduleId,
        title: a.title,
        icon: a.icon,
        color: a.color,
        dropPct: Math.abs(Math.min(0, a.changePct)),
        suggestion: `Sugestão: jogar "${game.name}" 2x nesta semana`,
        gamePath: game.path,
        tip,
      }
    })

  // Insights automáticos em linguagem simples
  const insights: AutoInsight[] = []
  const improved = [...areaTrends].sort((a, b) => b.changePct - a.changePct)[0]
  if (improved && improved.changePct >= 3) {
    insights.push({
      id: 'improve',
      icon: '📈',
      text: `${improved.title} melhorou ${improved.changePct}% nas últimas 4 semanas`,
      tone: 'positive',
    })
  }
  const worsened = [...areaTrends].sort((a, b) => a.changePct - b.changePct)[0]
  if (
    worsened &&
    worsened.changePct <= -3 &&
    (!improved || worsened.moduleId !== improved.moduleId)
  ) {
    insights.push({
      id: 'worsen',
      icon: '📉',
      text: `${worsened.title} caiu ${Math.abs(worsened.changePct)}% — vale reforçar com jogos desta área`,
      tone: 'warning',
    })
  }
  const lastWeek = weeks[weeks.length - 1]
  const languagesThisWeek = Object.keys(lastWeek?.languageAccuracy || {}).length
  if (languagesThisWeek > 0) {
    insights.push({
      id: 'langs',
      icon: '🌍',
      text: `${child.name.split(' ')[0]} praticou ${languagesThisWeek} ${
        languagesThisWeek === 1 ? 'idioma' : 'idiomas'
      } esta semana`,
      tone: 'positive',
    })
  }
  const lastSessionTime = sessions.length
    ? Math.max(...sessions.map((s) => new Date(s.created).getTime()))
    : 0
  const daysSince = lastSessionTime
    ? Math.floor((Date.now() - lastSessionTime) / (24 * 3600 * 1000))
    : 999
  if (daysSince >= 3) {
    insights.push({
      id: 'inactive',
      icon: '⏰',
      text: `${daysSince >= 999 ? 'Muitos' : daysSince} dias sem jogar — vamos retomar?`,
      tone: 'warning',
    })
  }
  if (lastWeek && lastWeek.sessions > 0) {
    insights.push({
      id: 'playtime',
      icon: '🎮',
      text: `${lastWeek.sessions} ${lastWeek.sessions === 1 ? 'partida' : 'partidas'} e ~${lastWeek.minutes} min de jogo na última semana`,
      tone: 'neutral',
    })
  }
  const best = [...areaTrends].sort((a, b) => b.current - a.current)[0]
  if (best && best.current > 0) {
    insights.push({
      id: 'best',
      icon: '⭐',
      text: `Maior destaque: ${best.title} com ${best.current}% de assimilação`,
      tone: 'positive',
    })
  }

  // Comparação com a expectativa da faixa etária
  const ageMonths = childAgeMonths(child)
  const ageComparison: AgeComparisonItem[] = areaTrends.map((a) => {
    const expected = expectedMasteryForAge(ageMonths, a.moduleId)
    const status: AreaStatus =
      a.current < expected - 10 ? 'below' : a.current > expected + 5 ? 'above' : 'expected'
    return {
      moduleId: a.moduleId,
      title: a.title,
      icon: a.icon,
      color: a.color,
      childMastery: a.current,
      expectedMastery: expected,
      status,
    }
  })

  // Evolução por idioma ao longo do tempo
  const languageEvolution: LanguageEvolutionItem[] = [
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'Inglês', flag: '🇺🇸' },
    { code: 'es', label: 'Espanhol', flag: '🇪🇸' },
    { code: 'de', label: 'Alemão', flag: '🇩🇪' },
    { code: 'fr', label: 'Francês', flag: '🇫🇷' },
  ]
    .map((lang) => {
      const series = weeks.map((w) => w.languageAccuracy[lang.code] ?? null)
      const totalSessions = sessions.filter((s) => sessionLanguage(s) === lang.code).length
      const current = avgOfSeries(series) ?? 0
      return { ...lang, series, current, totalSessions }
    })
    .filter((l) => l.totalSessions > 0 || l.code === 'pt-BR')

  const activeDays = new Set(sessions.map((s) => new Date(s.created).toDateString())).size

  return {
    weeks,
    areaTrends,
    insights,
    alerts,
    ageComparison,
    languageEvolution,
    totals: {
      sessions: sessions.length,
      minutes: sessions.reduce((acc, s) => acc + sessionMinutes(s), 0),
      stars: sessions.reduce((acc, s) => acc + (s.stars || 1), 0),
      activeDays,
      languagesThisWeek,
    },
  }
}

/** Texto curto para compartilhar por WhatsApp/texto (3 principais conclusões). */
export function buildShareText(child: Child, report: AdvancedReport): string {
  const top = report.insights.slice(0, 3)
  const lines = top.map((i) => `• ${i.text}`)
  return `🧠 Relatório Avançado CogniKids — ${child.name}\n${lines.join('\n')}\n\nGerado pelo app CogniKids.`
}

// ==================== AGREGAÇÕES PARA O PORTAL DA ESCOLA ====================

export interface ClassGroupReport {
  turma: string
  childrenCount: number
  areaAverages: { moduleId: string; title: string; icon: string; color: string; avg: number }[]
  weeklyParticipation: number[] // % de crianças ativas por semana (últimas 4)
  weeklyAdhesion: number // % de crianças com ≥3 sessões nos últimos 7 dias
  overallAvg: number
}

export interface StudentSemaphoreRow {
  childId: string
  name: string
  turma: string
  cells: { moduleId: string; title: string; status: 'green' | 'yellow' | 'red' | 'none' }[]
}

export interface SchoolAdvancedAnalysis {
  classGroups: ClassGroupReport[]
  institutionRanking: {
    moduleId: string
    title: string
    icon: string
    color: string
    avg: number
  }[]
  weeklyEvolution: { label: string; accuracy: number | null; sessions: number }[]
  studentRows: StudentSemaphoreRow[]
}

export function computeSchoolAdvancedAnalysis(
  children: Child[],
  sessions: GameSession[],
  progress: ModuleProgress[],
  turmaFilter: string = 'all',
): SchoolAdvancedAnalysis {
  const filtered =
    turmaFilter === 'all'
      ? children
      : children.filter(
          (c) => (c.class_group || '').trim().toLowerCase() === turmaFilter.trim().toLowerCase(),
        )
  const filteredIds = new Set(filtered.map((c) => c.id))
  const fSessions = sessions.filter((s) => filteredIds.has(s.child_id))
  const fProgress = progress.filter((p) => filteredIds.has(p.child_id))

  const masteryByChildArea = new Map<string, Record<string, number>>()
  fProgress.forEach((p) => {
    const area = mapModuleToArea(p.module_id)
    const cur = masteryByChildArea.get(p.child_id) || {}
    cur[area] = Math.max(cur[area] || 0, p.mastery_percentage)
    masteryByChildArea.set(p.child_id, cur)
  })
  fSessions.forEach((s) => {
    const area = mapModuleToArea(s.module_id)
    const cur = masteryByChildArea.get(s.child_id) || {}
    cur[area] = Math.max(cur[area] || 0, sessionAccuracy(s))
    masteryByChildArea.set(s.child_id, cur)
  })

  const areaAvg = (childIds: Set<string>) =>
    AREA_IDS.map((areaId) => {
      const mod = COGNIKIDS_MODULES.find((m) => m.id === areaId)
      const values: number[] = []
      childIds.forEach((id) => {
        const v = masteryByChildArea.get(id)?.[areaId]
        if (v != null) values.push(v)
      })
      return {
        moduleId: areaId,
        title: mod?.title || areaId,
        icon: mod?.icon || '🧠',
        color: mod?.color || '#94a3b8',
        avg: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
      }
    })

  // Turmas
  const turmaSet = new Set<string>()
  filtered.forEach((c) => turmaSet.add((c.class_group || '').trim() || 'Sem turma'))

  const now = Date.now()
  const classGroups: ClassGroupReport[] = Array.from(turmaSet).map((turma) => {
    const kids = filtered.filter((c) => ((c.class_group || '').trim() || 'Sem turma') === turma)
    const kidIds = new Set(kids.map((c) => c.id))
    const areaAverages = areaAvg(kidIds)
    const weeklyParticipation = [3, 2, 1, 0].map((weeksAgo) => {
      const start = now - (weeksAgo + 1) * 7 * 24 * 3600 * 1000
      const end = now - weeksAgo * 7 * 24 * 3600 * 1000
      const active = new Set(
        fSessions
          .filter((s) => {
            const t = new Date(s.created).getTime()
            return t >= start && t < end && kidIds.has(s.child_id)
          })
          .map((s) => s.child_id),
      )
      return kidIds.size ? Math.round((active.size / kidIds.size) * 100) : 0
    })
    const last7 = fSessions.filter(
      (s) => now - new Date(s.created).getTime() <= 7 * 24 * 3600 * 1000 && kidIds.has(s.child_id),
    )
    const perChildCount = new Map<string, number>()
    last7.forEach((s) => perChildCount.set(s.child_id, (perChildCount.get(s.child_id) || 0) + 1))
    const adherent = Array.from(perChildCount.values()).filter((n) => n >= 3).length
    const overallAvg = Math.round(
      areaAverages.reduce((a, b) => a + b.avg, 0) / Math.max(1, areaAverages.length),
    )
    return {
      turma,
      childrenCount: kids.length,
      areaAverages,
      weeklyParticipation,
      weeklyAdhesion: kidIds.size ? Math.round((adherent / kidIds.size) * 100) : 0,
      overallAvg,
    }
  })

  const allIds = new Set(filtered.map((c) => c.id))
  const institutionRanking = [...areaAvg(allIds)].sort((a, b) => b.avg - a.avg)

  // Evolução semanal agregada (8 semanas)
  const weeklyBuckets = buildWeeklyBuckets(fSessions, 8)
  const weeklyEvolution = weeklyBuckets.map((w) => ({
    label: w.label,
    accuracy: w.accuracy,
    sessions: w.sessions,
  }))

  // Semáforo por aluno/área
  const studentRows: StudentSemaphoreRow[] = filtered
    .map((c) => ({
      childId: c.id,
      name: c.name,
      turma: (c.class_group || '').trim() || 'Sem turma',
      cells: AREA_IDS.map((areaId) => {
        const mod = COGNIKIDS_MODULES.find((m) => m.id === areaId)
        const v = masteryByChildArea.get(c.id)?.[areaId]
        const status = v == null ? 'none' : v >= 70 ? 'green' : v >= 50 ? 'yellow' : 'red'
        return { moduleId: areaId, title: mod?.title || areaId, status }
      }),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  return { classGroups, institutionRanking, weeklyEvolution, studentRows }
}
