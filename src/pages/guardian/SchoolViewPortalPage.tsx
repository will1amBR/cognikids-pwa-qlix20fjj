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
} from 'lucide-react'

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

  useEffect(() => {
    if (codeParam) {
      loadPortalData(codeParam)
    }
  }, [codeParam])

  const loadPortalData = async (code: string) => {
    setIsLoading(true)
    setErrorMsg(null)
    const result = await getSchoolPortalData(code)

    if (result) {
      setPortalData(result)
      setActiveCodeFilter(result.primaryToken.access_code)
      if (result.children.length > 0) {
        setSelectedChildId(result.children[0].id)
      }
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
            <Link to="/auth/login">
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
                    <span className="text-xs text-slate-400 font-semibold">sessões cognitivas</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Filtro Ativo</span>
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
                  {filteredChildren.length} {filteredChildren.length === 1 ? 'criança' : 'crianças'}
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
                        Idade: <strong>{formatChildAge(selectedChild.birth_date)}</strong> • Sessão
                        sugerida: <strong>{selectedChild.daily_minutes || 15} min/dia</strong> (
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
                      {childSessions.length} {childSessions.length === 1 ? 'partida' : 'partidas'}
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
      </main>
    </div>
  )
}
