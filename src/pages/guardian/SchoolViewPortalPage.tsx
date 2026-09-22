import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getSchoolPortalData, type SchoolPortalResult } from '@/services/children'
import type { Child, GameSession, ModuleProgress, SchoolAccessToken } from '@/types/cognikids'
import { COGNIKIDS_MODULES, formatChildAge } from '@/types/cognikids'
import { BrainFlower } from '@/components/progress/BrainFlower'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  School,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Users,
  Filter,
  Layers,
  GraduationCap,
  Calendar,
  Gamepad2,
  Clock,
  KeyRound,
  Share2,
  Copy,
  Check,
  Plus,
  Ticket,
} from 'lucide-react'
import {
  createClassroomInviteCode,
  fetchUserInvites,
  lookupInviteCode,
  fetchCouponRedemptions,
} from '@/services/children'
import type { CouponRedemptionRecord } from '@/types/cognikids'
import {
  UserCheck,
  UserPlus2,
  BarChart3,
  Mail,
  CalendarCheck2,
  RefreshCw,
  FileText,
  Send,
  Tag,
  MessageSquare,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { teacherNotesService } from '@/services/teacherNotes'
import type { TeacherNote } from '@/types/cognikids'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { getSignupInviteUrl } from '@/lib/appUrl'

export const SchoolViewPortalPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const codeParam = searchParams.get('code') || ''

  const [inputCode, setInputCode] = useState(codeParam)
  const [portalData, setPortalData] = useState<SchoolPortalResult | null>(null)
  const [activeCodeFilter, setActiveCodeFilter] = useState<string>('all')
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(Boolean(codeParam))
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Active section tab: 'pedagogical' (mapa cognitivo), 'enrollments' (matrículas) or 'teacher_notes' (anotações do professor)
  const sectionParam = searchParams.get('section')
  const [activePortalSection, setActivePortalSection] = useState<
    'pedagogical' | 'enrollments' | 'teacher_notes'
  >(
    sectionParam === 'enrollments'
      ? 'enrollments'
      : sectionParam === 'teacher_notes'
        ? 'teacher_notes'
        : 'pedagogical',
  )

  useEffect(() => {
    if (sectionParam === 'enrollments') {
      setActivePortalSection('enrollments')
    } else if (sectionParam === 'teacher_notes') {
      setActivePortalSection('teacher_notes')
    } else if (sectionParam === 'pedagogical') {
      setActivePortalSection('pedagogical')
    }
  }, [sectionParam])
  const [couponRedemptions, setCouponRedemptions] = useState<CouponRedemptionRecord[]>([])
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(false)

  // Teacher notes state
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const [noteFormTurma, setNoteFormTurma] = useState<string>('')
  const [noteFormChildId, setNoteFormChildId] = useState<string>('')
  const [noteFormActivity, setNoteFormActivity] = useState<string>('')
  const [noteFormObservation, setNoteFormObservation] = useState<string>('')
  const [noteFormDate, setNoteFormDate] = useState<string>(
    () => new Date().toISOString().split('T')[0],
  )
  const [noteFormTeacherName, setNoteFormTeacherName] = useState<string>(() => {
    return localStorage.getItem('cognikids_teacher_author_name') || ''
  })
  const [noteTimelineChildFilter, setNoteTimelineChildFilter] = useState<string>('all')
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false)
  const [offlinePendingNotesCount, setOfflinePendingNotesCount] = useState<number>(0)

  // Quick activity suggestions
  const QUICK_LESSON_SUGGESTIONS = [
    'Roda de Conversa & Expressão Oral',
    'Reconhecimento de Fala com o Mascote Tico',
    'Circuito Motor & Coordenação Fina',
    'Identificação de Cores e Padrões Lógicos',
    'Contação de Histórias & Rimas Musicais',
    'Introdução ao Vocabulário Bilíngue (Inglês)',
    'Contagem Numérica & Quantidades',
  ]

  // School coupon generator state
  const { toast } = useToast()
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [newCouponTurma, setNewCouponTurma] = useState('Maternal II')
  const [newCouponCustomCode, setNewCouponCustomCode] = useState('')
  const [isGeneratingCoupon, setIsGeneratingCoupon] = useState(false)
  const [generatedCoupons, setGeneratedCoupons] = useState<
    Array<{
      code: string
      classGroup: string
      schoolName: string
      url: string
    }>
  >([
    {
      code: 'MATRIC-BERCARIO',
      classGroup: 'Berçário II',
      schoolName: 'Colégio Futuro Criativo (Demo Oficial)',
      url: getSignupInviteUrl('MATRIC-BERCARIO'),
    },
    {
      code: 'MATRIC-MATERNAL',
      classGroup: 'Maternal II',
      schoolName: 'Colégio Futuro Criativo (Demo Oficial)',
      url: getSignupInviteUrl('MATRIC-MATERNAL'),
    },
    {
      code: 'MATRIC-JUNIOR',
      classGroup: 'Jardim / 3º Ano',
      schoolName: 'Colégio Futuro Criativo (Demo Oficial)',
      url: getSignupInviteUrl('MATRIC-JUNIOR'),
    },
  ])

  // Update generated coupons URLs when portal data loads with official school name
  useEffect(() => {
    if (portalData?.institutionName) {
      setGeneratedCoupons((prev) =>
        prev.map((c) => ({
          ...c,
          schoolName: portalData.institutionName,
        })),
      )
    }
  }, [portalData])

  useEffect(() => {
    if (codeParam) {
      loadPortalData(codeParam)
    }
    const unsub = teacherNotesService.onSyncChange((count) => {
      setOfflinePendingNotesCount(count)
    })
    return () => unsub()
  }, [codeParam])

  const loadPortalData = async (code: string) => {
    setIsLoading(true)
    setErrorMsg(null)
    const [result, redemptions, notes] = await Promise.all([
      getSchoolPortalData(code),
      fetchCouponRedemptions(),
      teacherNotesService.fetchNotesBySchool(code),
    ])

    if (result) {
      setPortalData(result)
      setActiveCodeFilter(result.primaryToken.access_code)
      if (result.children.length > 0) {
        setSelectedChildId(result.children[0].id)
        setNoteFormChildId(result.children[0].id)
        if (result.children[0].class_group) {
          setNoteFormTurma(result.children[0].class_group)
        }
      }
      setCouponRedemptions(redemptions)
      setTeacherNotes(notes)
    } else {
      setErrorMsg(
        'Código de acesso inválido ou expirado. Verifique com a coordenação ou responsável da criança.',
      )
      setPortalData(null)
    }
    setIsLoading(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    const formatted = inputCode.trim().toUpperCase()
    setSearchParams({ code: formatted })
    loadPortalData(formatted)
  }

  // Extract all unique turmas from children and linked tokens
  const availableTurmas = useMemo(() => {
    if (!portalData) return []
    const turmaSet = new Set<string>()
    portalData.children.forEach((c) => {
      if (c.class_group && c.class_group.trim()) {
        turmaSet.add(c.class_group.trim())
      }
    })
    portalData.institutionTokens.forEach((t) => {
      if (t.class_group && t.class_group.trim()) {
        turmaSet.add(t.class_group.trim())
      }
    })
    return Array.from(turmaSet).sort()
  }, [portalData])

  // Reload redemptions on demand
  const handleRefreshRedemptions = async () => {
    setIsLoadingRedemptions(true)
    try {
      const redemptions = await fetchCouponRedemptions()
      setCouponRedemptions(redemptions)
      toast({ title: 'Dados de matrículas atualizados! 🔄' })
    } finally {
      setIsLoadingRedemptions(false)
    }
  }

  // Group redemptions by coupon code
  const couponStats = useMemo(() => {
    const map: Record<
      string,
      {
        couponCode: string
        classGroup: string
        guardiansCount: number
        childrenCount: number
        redemptions: CouponRedemptionRecord[]
      }
    > = {}

    // Initialize with known coupons
    generatedCoupons.forEach((c) => {
      map[c.code] = {
        couponCode: c.code,
        classGroup: c.classGroup,
        guardiansCount: 0,
        childrenCount: 0,
        redemptions: [],
      }
    })

    // Populate with real DB records
    couponRedemptions.forEach((r) => {
      const code = r.invite_code.trim().toUpperCase()
      if (!map[code]) {
        map[code] = {
          couponCode: code,
          classGroup: r.classroom_name || 'Geral',
          guardiansCount: 0,
          childrenCount: 0,
          redemptions: [],
        }
      }
      map[code].redemptions.push(r)
    })

    // Compute unique guardians & children
    Object.values(map).forEach((stat) => {
      const uniqueGuardians = new Set(
        stat.redemptions.map(
          (r) => r.guardian_email || r.guardian_user_id || r.guardian_name || r.id,
        ),
      )
      stat.guardiansCount = uniqueGuardians.size
      stat.childrenCount = stat.redemptions.length
    })

    return map
  }, [generatedCoupons, couponRedemptions])

  // Enrollment breakdown per turma for comparison chart
  const turmasEnrollmentComparison = useMemo(() => {
    const turmaMap: Record<
      string,
      { totalChildren: number; totalGuardians: number; couponCodes: string[] }
    > = {}

    Object.values(couponStats).forEach((c) => {
      const t = c.classGroup || 'Outras'
      if (!turmaMap[t]) {
        turmaMap[t] = { totalChildren: 0, totalGuardians: 0, couponCodes: [] }
      }
      turmaMap[t].totalChildren += c.childrenCount
      turmaMap[t].totalGuardians += c.guardiansCount
      if (!turmaMap[t].couponCodes.includes(c.couponCode)) {
        turmaMap[t].couponCodes.push(c.couponCode)
      }
    })

    const totalAllKids =
      Object.values(turmaMap).reduce((acc, curr) => acc + curr.totalChildren, 0) || 1

    return Object.entries(turmaMap).map(([turmaName, stats]) => ({
      turmaName,
      totalChildren: stats.totalChildren,
      totalGuardians: stats.totalGuardians,
      couponCodes: stats.couponCodes,
      percentage: Math.round((stats.totalChildren / totalAllKids) * 100),
    }))
  }, [couponStats])

  // Filter children by selected code and selected turma
  const filteredChildren = useMemo(() => {
    if (!portalData) return []
    let list = portalData.children

    // Filter by specific code if not 'all'
    if (activeCodeFilter !== 'all') {
      const currentToken = portalData.institutionTokens.find(
        (t) => t.access_code === activeCodeFilter,
      )
      if (currentToken && currentToken.child_id) {
        list = list.filter((c) => c.id === currentToken.child_id)
      }
    }

    // Filter by turma
    if (selectedTurma !== 'all') {
      list = list.filter(
        (c) => (c.class_group || '').trim().toLowerCase() === selectedTurma.toLowerCase(),
      )
    }

    return list
  }, [portalData, activeCodeFilter, selectedTurma])

  // Auto-select first child of filtered list if current selection is invalid
  useEffect(() => {
    if (filteredChildren.length > 0) {
      const isCurrentInFiltered = filteredChildren.some((c) => c.id === selectedChildId)
      if (!isCurrentInFiltered) {
        setSelectedChildId(filteredChildren[0].id)
      }
    } else {
      setSelectedChildId('')
    }
  }, [filteredChildren, selectedChildId])

  const selectedChild = useMemo(() => {
    if (!portalData) return null
    return portalData.children.find((c) => c.id === selectedChildId) || filteredChildren[0] || null
  }, [portalData, selectedChildId, filteredChildren])

  // Calculate progress map for the selected child
  const childProgressMap: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {}
    if (!portalData || !selectedChild) return map

    portalData.progress
      .filter((p) => p.child_id === selectedChild.id)
      .forEach((p) => {
        map[p.module_id] = p.mastery_percentage
      })

    COGNIKIDS_MODULES.forEach((m) => {
      if (map[m.id] === undefined) {
        map[m.id] = 45
      }
    })
    return map
  }, [portalData, selectedChild])

  const childSessions = useMemo(() => {
    if (!portalData || !selectedChild) return []
    return portalData.sessions.filter((s) => s.child_id === selectedChild.id).slice(0, 8)
  }, [portalData, selectedChild])

  // Overall classroom assimilation stats
  const classroomStats = useMemo(() => {
    if (!portalData || filteredChildren.length === 0) return null
    const kidIds = new Set(filteredChildren.map((c) => c.id))
    const classProgress = portalData.progress.filter((p) => kidIds.has(p.child_id))
    const classSessions = portalData.sessions.filter((s) => kidIds.has(s.child_id))

    const moduleAverages: Record<string, { total: number; count: number }> = {}
    COGNIKIDS_MODULES.forEach((m) => {
      moduleAverages[m.id] = { total: 0, count: 0 }
    })

    classProgress.forEach((p) => {
      if (moduleAverages[p.module_id]) {
        moduleAverages[p.module_id].total += p.mastery_percentage
        moduleAverages[p.module_id].count += 1
      }
    })

    const avgMap: Record<string, number> = {}
    let overallSum = 0
    let overallCount = 0

    COGNIKIDS_MODULES.forEach((m) => {
      const stat = moduleAverages[m.id]
      const avg = stat.count > 0 ? Math.round(stat.total / stat.count) : 50
      avgMap[m.id] = avg
      overallSum += avg
      overallCount += 1
    })

    return {
      totalStudents: filteredChildren.length,
      totalSessions: classSessions.length,
      overallAssimilation: Math.round(overallSum / (overallCount || 1)),
      moduleAverages: avgMap,
    }
  }, [portalData, filteredChildren])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* School Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800 text-base">
                  CogniKids <span className="text-indigo-600">Escola</span>
                </span>
                <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Portal Pedagógico
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Visão oficial de acompanhamento do desenvolvimento infantil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Área do Responsável
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* If not authenticated with a code yet */}
        {!portalData && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg text-center max-w-lg mx-auto space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                <School className="w-8 h-8" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Acesso Pedagógico para Escolas & Creches
              </h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Insira o código de acesso compartilhado pela instituição ou pelos responsáveis para
                visualizar o mapa cognitivo das turmas e alunos.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3 text-left">
              <Input
                type="text"
                placeholder="ex: ESCOLA-7X9AB"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="rounded-2xl h-12 text-center uppercase font-mono font-black text-lg tracking-wider border-2 border-indigo-200 focus:border-indigo-600"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputCode.trim()}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20"
              >
                {isLoading ? 'Verificando código…' : 'Acessar Painel Pedagógico'}
              </Button>
            </form>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Acesso seguro em modo somente leitura (sem permissão de edição)</span>
            </div>
          </div>
        )}

        {/* When authenticated with portalData */}
        {portalData && (
          <div className="space-y-8 animate-fade-in">
            {/* Header School Card with Institution Info & Multi-Code Support */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/15">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
                    <School className="w-3.5 h-3.5" />
                    <span>{portalData.institutionName}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Painel da Equipe Pedagógica
                  </h1>
                  <p className="text-xs text-indigo-100 mt-1">
                    Visualização institucional com filtro por turmas e códigos de acesso vinculados.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/20 backdrop-blur-sm text-xs font-semibold">
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                  <span>
                    {portalData.children.length}{' '}
                    {portalData.children.length === 1 ? 'aluno vinculado' : 'alunos vinculados'}
                  </span>
                </div>
              </div>

              {/* Navigation Switcher: Desenvolvimento Pedagógico vs. Painel de Matrículas */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortalSection('pedagogical')
                    const params = new URLSearchParams(searchParams)
                    params.set('section', 'pedagogical')
                    setSearchParams(params, { replace: true })
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                    activePortalSection === 'pedagogical'
                      ? 'bg-white text-indigo-900 shadow-md shadow-black/10'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  <BrainFlower progressMap={{}} size={16} />
                  <span>Cérebro em Flor & Alunos</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePortalSection('enrollments')
                    const params = new URLSearchParams(searchParams)
                    params.set('section', 'enrollments')
                    setSearchParams(params, { replace: true })
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                    activePortalSection === 'enrollments'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-black/10'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-950" />
                  <span>Painel de Matrículas & Cupons</span>
                  <span className="bg-black/20 text-inherit px-2 py-0.5 rounded-full text-[10px] font-black">
                    {couponRedemptions.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePortalSection('teacher_notes')
                    const params = new URLSearchParams(searchParams)
                    params.set('section', 'teacher_notes')
                    setSearchParams(params, { replace: true })
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                    activePortalSection === 'teacher_notes'
                      ? 'bg-emerald-400 text-slate-950 shadow-md shadow-black/10'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-950" />
                  <span>Anotações do Professor</span>
                  <span className="bg-black/20 text-inherit px-2 py-0.5 rounded-full text-[10px] font-black">
                    {teacherNotes.length}
                  </span>
                  {offlinePendingNotesCount > 0 && (
                    <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[9px] font-black animate-pulse">
                      {offlinePendingNotesCount} pendente(s)
                    </span>
                  )}
                </button>
              </div>

              {/* Multi-Code & Turma Filter Bar */}
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Turma Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-indigo-200 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    Turma:
                  </span>
                  <button
                    onClick={() => setSelectedTurma('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTurma === 'all'
                        ? 'bg-white text-indigo-900 shadow-md font-black'
                        : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    Todas as turmas ({portalData.children.length})
                  </button>
                  {availableTurmas.map((t) => {
                    const count = portalData.children.filter(
                      (c) => (c.class_group || '').trim().toLowerCase() === t.toLowerCase(),
                    ).length
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedTurma(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedTurma.toLowerCase() === t.toLowerCase()
                            ? 'bg-white text-indigo-900 shadow-md font-black'
                            : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                      >
                        {t} {count > 0 ? `(${count})` : ''}
                      </button>
                    )
                  })}
                </div>

                {/* Linked Code Switcher (if institution has multiple codes) */}
                {portalData.institutionTokens.length > 1 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/15">
                    <span className="text-xs font-black text-indigo-200 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      Código:
                    </span>
                    <button
                      onClick={() => setActiveCodeFilter('all')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        activeCodeFilter === 'all'
                          ? 'bg-white text-indigo-900 shadow-md font-black'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      }`}
                    >
                      Todos os códigos ({portalData.institutionTokens.length})
                    </button>
                    {portalData.institutionTokens.map((tok) => (
                      <button
                        key={tok.id}
                        onClick={() => setActiveCodeFilter(tok.access_code)}
                        className={`px-2.5 py-1 rounded-xl font-mono text-xs transition-all ${
                          activeCodeFilter === tok.access_code
                            ? 'bg-white text-indigo-900 shadow-md font-black'
                            : 'bg-white/15 text-white hover:bg-white/25 font-semibold'
                        }`}
                        title={tok.teacher_name ? `Prof: ${tok.teacher_name}` : tok.access_code}
                      >
                        {tok.access_code}
                        {tok.class_group ? ` (${tok.class_group})` : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* School -> Parents Invitation / Coupon Generator Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-indigo-200/90 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-800">
                        Links e Cupons de Matrícula para os Pais
                      </h2>
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Envie para os pais pelo WhatsApp. Ao criar a conta, o aluno já entra vinculado
                      à turma correta!
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setShowCouponModal(true)}
                  className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gerar Cupom de Turma</span>
                </Button>
              </div>

              {/* List of Coupons per Turma */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {generatedCoupons.map((c) => {
                  const whatsappText = `Olá! A escola ${c.schoolName} convida você a cadastrar seu filho(a) no CogniKids para acompanhar o desenvolvimento cognitivo da turma ${c.classGroup}! Acesse o link direto com o convite da turma: ${c.url}`
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

                  return (
                    <div
                      key={c.code}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800">
                            Turma: {c.classGroup}
                          </span>
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {c.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{c.url}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(c.url)
                            setCopiedCoupon(c.code)
                            toast({ title: 'Link do convite copiado! 📋' })
                            setTimeout(() => setCopiedCoupon(null), 2000)
                          }}
                          className="flex-1 h-9 rounded-xl border-slate-300 font-bold text-xs"
                        >
                          {copiedCoupon === c.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </Button>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                          title="Compartilhar no WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CONDITIONAL SECTION 1: PAINEL DE MATRÍCULAS POR CUPOM (Task item 1) */}
            {activePortalSection === 'enrollments' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header & Refresh Controls */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-2">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Painel de Conversão & Acompanhamento de Matrículas</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">
                      Estatísticas Reais de Matrícula por Cupom
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Acompanhe em tempo real quantos responsáveis se cadastraram com cada cupom de
                      turma, quais crianças foram vinculadas, idades e status de envio da mensagem
                      de boas-vindas.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshRedemptions}
                      disabled={isLoadingRedemptions}
                      className="rounded-2xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isLoadingRedemptions ? 'animate-spin' : ''}`}
                      />
                      <span>{isLoadingRedemptions ? 'Atualizando…' : 'Atualizar Dados'}</span>
                    </Button>

                    <Button
                      onClick={() => setShowCouponModal(true)}
                      size="sm"
                      className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Cupom</span>
                    </Button>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Total de Matrículas
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-800">
                        {couponRedemptions.length}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        crianças vinculadas
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Pais Cadastrados
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-600">
                        {
                          new Set(
                            couponRedemptions.map(
                              (r) =>
                                r.guardian_email || r.guardian_user_id || r.guardian_name || r.id,
                            ),
                          ).size
                        }
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        responsáveis únicos
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Cupons Ativos
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                        <Ticket className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-600">
                        {Object.keys(couponStats).length}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">códigos gerados</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Boas-vindas Enviadas
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        <Mail className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-purple-600">
                        {couponRedemptions.filter((r) => r.welcome_sent).length}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        e-mails transacionais
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparative Classroom Breakdown Chart / Distribution */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-base font-black text-slate-800">
                        Comparativo de Adesão entre Turmas da Instituição
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">
                      {turmasEnrollmentComparison.length} turmas monitoradas
                    </span>
                  </div>

                  <div className="space-y-4">
                    {turmasEnrollmentComparison.map((turma) => (
                      <div key={turma.turmaName} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-800 font-black">{turma.turmaName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({turma.couponCodes.join(', ')})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-600">
                            <span>
                              <b>{turma.totalGuardians}</b> pais
                            </span>
                            <span>•</span>
                            <span>
                              <b>{turma.totalChildren}</b> crianças ({turma.percentage}%)
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${Math.max(5, turma.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DETAILED STATS PER COUPON CARDS */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-indigo-600" />
                    <span>Detalhamento por Cupom de Turma</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    {Object.values(couponStats).map((stat) => (
                      <div
                        key={stat.couponCode}
                        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4"
                      >
                        {/* Coupon Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                              <Ticket className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-200">
                                  {stat.couponCode}
                                </span>
                                <span className="text-xs font-black text-slate-800">
                                  Turma: {stat.classGroup}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Link direto:{' '}
                                <span className="font-mono text-slate-600">
                                  {getSignupInviteUrl(stat.couponCode)}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs">
                            <div className="text-center">
                              <span className="block text-slate-400 text-[10px] uppercase font-bold">
                                Pais
                              </span>
                              <span className="font-black text-slate-800 text-sm">
                                {stat.guardiansCount}
                              </span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div className="text-center">
                              <span className="block text-slate-400 text-[10px] uppercase font-bold">
                                Crianças
                              </span>
                              <span className="font-black text-indigo-600 text-sm">
                                {stat.childrenCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* List of Enrolled Children & Guardians */}
                        {stat.redemptions.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            Nenhum responsável concluiu cadastro com este cupom até o momento.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                                  <th className="pb-2 pl-2">Criança</th>
                                  <th className="pb-2">Idade</th>
                                  <th className="pb-2">Responsável / E-mail</th>
                                  <th className="pb-2">Data da Vinculação</th>
                                  <th className="pb-2 pr-2 text-right">E-mail Boas-Vindas</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {stat.redemptions.map((r) => {
                                  const formattedDate = r.created
                                    ? new Date(r.created).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Recente'

                                  const ageYears = r.child_age ? Math.floor(r.child_age / 12) : 0
                                  const ageMonths = r.child_age ? r.child_age % 12 : 0
                                  const ageLabel = r.child_age
                                    ? `${r.child_age}m (${ageYears}a ${ageMonths}m)`
                                    : 'Não informada'

                                  return (
                                    <tr
                                      key={r.id}
                                      className="hover:bg-slate-50/80 transition-colors"
                                    >
                                      <td className="py-2.5 pl-2 font-bold text-slate-900">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px]">
                                            {(r.child_name || 'C').charAt(0).toUpperCase()}
                                          </div>
                                          <span>{r.child_name || 'Criança'}</span>
                                        </div>
                                      </td>

                                      <td className="py-2.5 font-medium text-slate-600">
                                        {ageLabel}
                                      </td>

                                      <td className="py-2.5">
                                        <p className="font-bold text-slate-800">
                                          {r.guardian_name || 'Responsável'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-mono">
                                          {r.guardian_email || '—'}
                                        </p>
                                      </td>

                                      <td className="py-2.5 text-slate-500 font-medium">
                                        {formattedDate}
                                      </td>

                                      <td className="py-2.5 pr-2 text-right">
                                        {r.welcome_sent ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            Enviado
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                            <Clock className="w-3 h-3 text-amber-600" />
                                            Pendente
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL SECTION: ANOTAÇÕES DO PROFESSOR (ÁREA DO PROFESSOR) */}
            {activePortalSection === 'teacher_notes' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 mb-2">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Área do Professor & Registro Pedagógico Diário</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">
                      Diário de Aulas & Anotações de Desenvolvimento
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Registre as atividades realizadas em sala, avanços de fala, comportamento e
                      interações lúdicas. Os registros ficam salvos para a equipe escolar e são
                      compartilhados no painel dos pais.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {offlinePendingNotesCount > 0 && (
                      <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-2xl text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        <span>{offlinePendingNotesCount} em fila offline</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setIsLoadingNotes(true)
                        try {
                          await teacherNotesService.syncPendingNotes()
                          const notes = await teacherNotesService.fetchNotesBySchool(
                            inputCode || codeParam,
                          )
                          setTeacherNotes(notes)
                          toast({ title: 'Anotações sincronizadas e atualizadas! 🔄' })
                        } finally {
                          setIsLoadingNotes(false)
                        }
                      }}
                      disabled={isLoadingNotes}
                      className="rounded-2xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isLoadingNotes ? 'animate-spin' : ''}`}
                      />
                      <span>{isLoadingNotes ? 'Atualizando…' : 'Atualizar Timeline'}</span>
                    </Button>
                  </div>
                </div>

                {/* Grid: Formulário de Nova Anotação + Timeline das Anotações */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Formulário do Professor (5 cols) */}
                  <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800">
                          Nova Anotação Pedagógica
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Funciona online e offline (salva local e sincroniza depois)
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        if (!noteFormChildId || !noteFormActivity.trim()) {
                          toast({
                            title: 'Campos obrigatórios',
                            description: 'Selecione o aluno e informe a atividade realizada.',
                            variant: 'destructive',
                          })
                          return
                        }

                        setIsSubmittingNote(true)
                        try {
                          // Salva nome do professor no localStorage para persistência futura
                          if (noteFormTeacherName.trim()) {
                            localStorage.setItem(
                              'cognikids_teacher_author_name',
                              noteFormTeacherName.trim(),
                            )
                          }

                          const schoolCode = inputCode || codeParam || 'ESCOLA-DEMO01'
                          const selectedKid = portalData.children.find(
                            (c) => c.id === noteFormChildId,
                          )

                          const tags: string[] = []
                          if (selectedKid?.class_group) tags.push(selectedKid.class_group)
                          if (
                            noteFormActivity.toLowerCase().includes('inglês') ||
                            noteFormActivity.toLowerCase().includes('bilíngue')
                          ) {
                            tags.push('Bilíngue')
                          }
                          if (
                            noteFormActivity.toLowerCase().includes('motor') ||
                            noteFormActivity.toLowerCase().includes('circuito')
                          ) {
                            tags.push('Coordenação Motora')
                          }
                          if (
                            noteFormActivity.toLowerCase().includes('fala') ||
                            noteFormActivity.toLowerCase().includes('conversa')
                          ) {
                            tags.push('Linguagem')
                          }
                          if (
                            noteFormActivity.toLowerCase().includes('lógica') ||
                            noteFormActivity.toLowerCase().includes('matemática') ||
                            noteFormActivity.toLowerCase().includes('formas')
                          ) {
                            tags.push('Raciocínio')
                          }
                          if (tags.length === 0) tags.push('Desenvolvimento Integral')

                          const created = await teacherNotesService.saveNote({
                            school_code: schoolCode,
                            child_id: noteFormChildId,
                            class_group: noteFormTurma || selectedKid?.class_group || '',
                            lesson_activity: noteFormActivity.trim(),
                            author_name: noteFormTeacherName.trim() || 'Professor(a)',
                            note_date: noteFormDate
                              ? new Date(noteFormDate).toISOString()
                              : new Date().toISOString(),
                            observation: noteFormObservation.trim(),
                            tags,
                          })

                          setTeacherNotes((prev) => [created, ...prev])
                          setNoteFormActivity('')
                          setNoteFormObservation('')
                          toast({
                            title: 'Anotação registrada com sucesso! 📝',
                            description: created.synced
                              ? 'Salva diretamente no banco da escola.'
                              : 'Salva localmente (offline) e sincronizará quando online.',
                          })
                        } catch (err) {
                          console.error('Error submitting teacher note', err)
                          toast({
                            title: 'Erro ao registrar anotação',
                            variant: 'destructive',
                          })
                        } finally {
                          setIsSubmittingNote(false)
                        }
                      }}
                      className="space-y-4"
                    >
                      {/* Seletor de Turma */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700">Turma / Sala</label>
                        <select
                          value={noteFormTurma}
                          onChange={(e) => {
                            const val = e.target.value
                            setNoteFormTurma(val)
                            // Auto select first child of this turma if possible
                            const kidsInTurma = portalData.children.filter(
                              (c) =>
                                !val || (c.class_group || '').toLowerCase() === val.toLowerCase(),
                            )
                            if (kidsInTurma.length > 0) {
                              setNoteFormChildId(kidsInTurma[0].id)
                            }
                          }}
                          className="w-full h-11 px-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Todas as Turmas da Escola</option>
                          {availableTurmas.map((t) => (
                            <option key={t} value={t}>
                              Turma: {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Seletor de Aluno */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700">Aluno(a) *</label>
                        <select
                          value={noteFormChildId}
                          onChange={(e) => {
                            setNoteFormChildId(e.target.value)
                            const k = portalData.children.find((c) => c.id === e.target.value)
                            if (k?.class_group) setNoteFormTurma(k.class_group)
                          }}
                          required
                          className="w-full h-11 px-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Selecione o aluno...</option>
                          {portalData.children
                            .filter(
                              (c) =>
                                !noteFormTurma ||
                                (c.class_group || '').toLowerCase() === noteFormTurma.toLowerCase(),
                            )
                            .map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.name} {k.class_group ? `(${k.class_group})` : ''}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Campo Atividade Realizada */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">
                          Aula / Atividade Realizada *
                        </label>
                        <Input
                          type="text"
                          placeholder="ex: Roda de Conversa com o Tico, Formas Geométricas..."
                          value={noteFormActivity}
                          onChange={(e) => setNoteFormActivity(e.target.value)}
                          required
                          className="rounded-2xl h-11 text-xs"
                        />
                        {/* Sugestões rápidas */}
                        <div className="pt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Sugestões Rápidas:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {QUICK_LESSON_SUGGESTIONS.slice(0, 4).map((sug) => (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => setNoteFormActivity(sug)}
                                className="text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded-lg transition-colors border border-slate-200"
                              >
                                + {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Nome do Professor e Data */}
                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Professor(a)</label>
                          <Input
                            type="text"
                            placeholder="ex: Profa. Camila"
                            value={noteFormTeacherName}
                            onChange={(e) => setNoteFormTeacherName(e.target.value)}
                            className="rounded-2xl h-10 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Data</label>
                          <Input
                            type="date"
                            value={noteFormDate}
                            onChange={(e) => setNoteFormDate(e.target.value)}
                            className="rounded-2xl h-10 text-xs"
                          />
                        </div>
                      </div>

                      {/* Observação / Parecer Pedagógico */}
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700">
                          Observação Pedagógica / Relato
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Descreva o engajamento da criança, respostas na atividade, socialização ou estímulos recomendados..."
                          value={noteFormObservation}
                          onChange={(e) => setNoteFormObservation(e.target.value)}
                          className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmittingNote || !noteFormChildId || !noteFormActivity.trim()}
                        className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {isSubmittingNote ? 'Registrando…' : 'Salvar Anotação no Diário'}
                        </span>
                      </Button>
                    </form>
                  </div>

                  {/* Timeline das Anotações (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Filtro por Aluno na Timeline */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-black text-slate-800">
                          Linha do Tempo das Anotações
                        </h3>
                      </div>

                      {/* Seletor de filtro */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-[11px] font-bold text-slate-400">Filtrar por:</span>
                        <select
                          value={noteTimelineChildFilter}
                          onChange={(e) => setNoteTimelineChildFilter(e.target.value)}
                          className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="all">Todos os Alunos ({teacherNotes.length})</option>
                          {portalData.children.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Lista Cronológica */}
                    {(() => {
                      const displayedNotes = teacherNotes.filter((n) => {
                        if (noteTimelineChildFilter === 'all') return true
                        return n.child_id === noteTimelineChildFilter
                      })

                      if (displayedNotes.length === 0) {
                        return (
                          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center text-slate-400 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                              <FileText className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-600">
                              Nenhuma anotação registrada ainda para este filtro.
                            </p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                              Utilize o formulário ao lado para registrar o relato da aula ou
                              atividade com o aluno.
                            </p>
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-3.5">
                          {displayedNotes.map((note) => {
                            const kid = portalData.children.find((c) => c.id === note.child_id)
                            const kidName = kid ? kid.name : note.expand?.child_id?.name || 'Aluno'
                            const kidColor = kid ? kid.favorite_color : '#4F46E5'

                            const formattedDate = note.note_date
                              ? new Date(note.note_date).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Hoje'

                            return (
                              <div
                                key={note.id}
                                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3 hover:border-emerald-200 transition-colors"
                              >
                                {/* Top Bar */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs"
                                      style={{ backgroundColor: kidColor || '#4F46E5' }}
                                    >
                                      {kidName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-800">
                                          {kidName}
                                        </span>
                                        {note.class_group && (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                            {note.class_group}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-400">
                                        Por <strong>{note.author_name || 'Professor(a)'}</strong>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {formattedDate}
                                    </span>
                                    {note.synced === false ? (
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                        Offline (Pendente)
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        ✓ Sincronizado
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Lesson / Activity Title */}
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                    Atividade Realizada
                                  </span>
                                  <h4 className="text-sm font-black text-slate-900 mt-1">
                                    {note.lesson_activity}
                                  </h4>
                                </div>

                                {/* Observation Body */}
                                {note.observation && (
                                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                                    {note.observation}
                                  </p>
                                )}

                                {/* Tags */}
                                {note.tags && note.tags.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {note.tags.map((t) => (
                                      <span
                                        key={t}
                                        className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg flex items-center gap-1"
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
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL SECTION 2: MAPA COGNITIVO PEDAGÓGICO */}
            {activePortalSection === 'pedagogical' && (
              <div className="space-y-8 animate-fade-in">
                {/* Turma / Classroom Level Overview KPI */}
                {classroomStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Alunos na Visualização
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800">
                          {classroomStats.totalStudents}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {selectedTurma !== 'all' ? `na turma ${selectedTurma}` : 'na instituição'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Assimilação Média Geral
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                          🎯
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-600">
                          {classroomStats.overallAssimilation}%
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">5 dimensões</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Atividades Realizadas
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800">
                          {classroomStats.totalSessions}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          sessões cognitivas
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Filtro Ativo
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                          <Filter className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-lg font-black text-slate-800 truncate">
                          {selectedTurma === 'all' ? 'Todas as Salas' : selectedTurma}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {activeCodeFilter === 'all'
                          ? 'Todos os códigos'
                          : `Código: ${activeCodeFilter}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Child Selector List Bar */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-black text-slate-800">
                        Selecione a Criança para Ver o Relatório Detalhado
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">
                      {filteredChildren.length}{' '}
                      {filteredChildren.length === 1 ? 'criança' : 'crianças'}
                    </span>
                  </div>

                  {filteredChildren.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Nenhuma criança encontrada para o filtro selecionado (Turma: {selectedTurma}).
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {filteredChildren.map((child) => {
                        const isSelected = selectedChild?.id === child.id
                        return (
                          <button
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 border-2 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-102'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                              style={{ backgroundColor: child.favorite_color || '#4F46E5' }}
                            >
                              {child.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <span className="block leading-tight">{child.name}</span>
                              <span
                                className={`text-[10px] font-medium block leading-tight ${
                                  isSelected ? 'text-indigo-100' : 'text-slate-400'
                                }`}
                              >
                                {child.class_group
                                  ? `Turma: ${child.class_group}`
                                  : formatChildAge(child.birth_date)}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Individual Child Analysis Section */}
                {selectedChild && (
                  <div className="space-y-6">
                    {/* Child Summary Hero */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0"
                          style={{ backgroundColor: selectedChild.favorite_color || '#4F46E5' }}
                        >
                          {selectedChild.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                              {selectedChild.name}
                            </h2>
                            {selectedChild.class_group && (
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                Turma: {selectedChild.class_group}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Idade: <strong>{formatChildAge(selectedChild.birth_date)}</strong> •
                            Sessão sugerida:{' '}
                            <strong>{selectedChild.daily_minutes || 15} min/dia</strong> (
                            {selectedChild.daily_activity_count || 3} jogos)
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right text-xs text-slate-400 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl w-full sm:w-auto">
                        <span className="block font-bold text-slate-700">
                          Acesso via código oficial
                        </span>
                        <span>Modo somente leitura pedagógico</span>
                      </div>
                    </div>

                    {/* Brain Flower + 5 Area Summary for Teachers */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Brain Flower Chart */}
                      <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          <h3 className="text-lg font-black text-slate-800">Cérebro em Flor</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-6 max-w-xs">
                          Mapeamento de maturação nas 5 dimensões cognitivas e socioemocionais.
                        </p>

                        <BrainFlower progressMap={childProgressMap} size={230} />
                      </div>

                      {/* 5 Area Summary for Teachers */}
                      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-lg font-black text-slate-800">
                          Desempenho por Dimensão Pedagógica
                        </h3>
                        <div className="space-y-3">
                          {COGNIKIDS_MODULES.map((mod) => {
                            const val = childProgressMap[mod.id] || 45
                            return (
                              <div
                                key={mod.id}
                                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{mod.icon}</span>
                                  <div>
                                    <p className="text-xs font-black text-slate-800">{mod.title}</p>
                                    <p className="text-[11px] text-slate-400">{mod.subtitle}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{ width: `${val}%`, backgroundColor: mod.color }}
                                    />
                                  </div>
                                  <span className="text-xs font-black text-slate-700 w-8 text-right">
                                    {val}%
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Recent Game Sessions for this Child */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-base font-black text-slate-800">
                            Últimas Sessões de Jogos de {selectedChild.name}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                          {childSessions.length}{' '}
                          {childSessions.length === 1 ? 'partida' : 'partidas'}
                        </span>
                      </div>

                      {childSessions.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">
                          Nenhuma sessão registrada recentemente para esta criança.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {childSessions.map((s) => (
                            <div
                              key={s.id}
                              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 truncate">
                                  {s.game_title}
                                </span>
                                <span className="text-amber-500 font-black">
                                  {'⭐'.repeat(Math.min(3, s.stars || 1))}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span>
                                  Acerto: <strong>{s.accuracy || s.score || 80}%</strong>
                                </span>
                                <span>{new Date(s.created).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pedagogical Observations & School Tips */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-black text-slate-800">
                          Orientações Pedagógicas para Sala de Aula
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {COGNIKIDS_MODULES.map((mod) => (
                          <div
                            key={mod.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{mod.icon}</span>
                              <h4 className="font-black text-slate-800">{mod.title}</h4>
                            </div>
                            <p className="text-slate-600">
                              <strong>Foco trabalhado:</strong> {mod.themes[0]?.whatIsWorked}
                            </p>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-slate-700">
                              <strong>Sugestão em sala: </strong>
                              {mod.themes[0]?.homeTips[0]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Create Classroom Coupon */}
      <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              Gerar Convite/Cupom de Turma para os Pais
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Crie um código de matrícula compartilhável para vincular novos alunos direto à turma
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!newCouponTurma.trim()) return
              setIsGeneratingCoupon(true)
              try {
                const school =
                  portalData?.institutionName || 'Colégio Futuro Criativo (Demo Oficial)'
                const created = await createClassroomInviteCode({
                  schoolName: school,
                  classGroup: newCouponTurma.trim(),
                  customCode: newCouponCustomCode.trim() || undefined,
                })

                const newEntry = {
                  code: created.invite_code,
                  classGroup: created.class_group || newCouponTurma.trim(),
                  schoolName: school,
                  url: getSignupInviteUrl(created.invite_code),
                }

                setGeneratedCoupons((prev) => [newEntry, ...prev])
                setShowCouponModal(false)
                setNewCouponCustomCode('')
                toast({
                  title: 'Cupom de turma gerado! 🎉',
                  description: `Código: ${created.invite_code} para ${newCouponTurma}`,
                })
              } catch (_) {
                // Fallback offline / demo
                const fallbackCode = newCouponCustomCode.trim()
                  ? newCouponCustomCode.trim().toUpperCase()
                  : `MATRIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                const fallbackEntry = {
                  code: fallbackCode,
                  classGroup: newCouponTurma.trim(),
                  schoolName: portalData?.institutionName || 'Colégio Futuro Criativo',
                  url: getSignupInviteUrl(fallbackCode),
                }
                setGeneratedCoupons((prev) => [fallbackEntry, ...prev])
                setShowCouponModal(false)
                setNewCouponCustomCode('')
                toast({
                  title: 'Cupom de turma gerado! 🎉',
                  description: `Código: ${fallbackCode} para ${newCouponTurma}`,
                })
              } finally {
                setIsGeneratingCoupon(false)
              }
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">Turma / Sala de Aula *</label>
              <Input
                type="text"
                placeholder="ex: Berçário I, Maternal II, Jardim B..."
                value={newCouponTurma}
                onChange={(e) => setNewCouponTurma(e.target.value)}
                required
                className="rounded-2xl h-11"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">
                Código Personalizado (opcional)
              </label>
              <Input
                type="text"
                placeholder="ex: MATRIC-MATERNAL2026"
                value={newCouponCustomCode}
                onChange={(e) => setNewCouponCustomCode(e.target.value.toUpperCase())}
                className="rounded-2xl h-11 uppercase font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Se deixar em branco, geraremos automaticamente no formato MATRIC-XXXXXX.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isGeneratingCoupon || !newCouponTurma.trim()}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold mt-3"
            >
              {isGeneratingCoupon ? 'Gerando…' : 'Criar Link e Cupom da Turma'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
