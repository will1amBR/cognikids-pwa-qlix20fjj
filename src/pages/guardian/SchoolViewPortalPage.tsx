import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getSchoolPortalData } from '@/services/children'
import type { Child, GameSession, ModuleProgress, SchoolAccessToken } from '@/types/cognikids'
import { COGNIKIDS_MODULES, formatChildAge } from '@/types/cognikids'
import { BrainFlower } from '@/components/progress/BrainFlower'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  School,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'

export const SchoolViewPortalPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const codeParam = searchParams.get('code') || ''

  const [inputCode, setInputCode] = useState(codeParam)
  const [activeToken, setActiveToken] = useState<SchoolAccessToken | null>(null)
  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [progress, setProgress] = useState<ModuleProgress[]>([])
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
      setActiveToken(result.token)
      setChildrenList(result.children)
      setSelectedChild(result.children[0] || null)
      setSessions(result.sessions)
      setProgress(result.progress)
    } else {
      setErrorMsg('Código de acesso inválido ou expirado. Verifique com o responsável da criança.')
      setActiveToken(null)
      setChildrenList([])
    }
    setIsLoading(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    setSearchParams({ code: inputCode.trim().toUpperCase() })
    loadPortalData(inputCode.trim().toUpperCase())
  }

  // Calculate progress map for the selected child
  const childProgressMap: Record<string, number> = {}
  if (selectedChild) {
    progress
      .filter((p) => p.child_id === selectedChild.id)
      .forEach((p) => {
        childProgressMap[p.module_id] = p.mastery_percentage
      })
    COGNIKIDS_MODULES.forEach((m) => {
      if (childProgressMap[m.id] === undefined) {
        childProgressMap[m.id] = 45
      }
    })
  }

  const childSessions = selectedChild ? sessions.filter((s) => s.child_id === selectedChild.id) : []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* School Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-800 text-base">
                CogniKids <span className="text-indigo-600">Escola</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full ml-2">
                Portal Pedagógico
              </span>
            </div>
          </div>

          <Link to="/auth/login">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-xs font-bold text-slate-700"
            >
              Área do Responsável
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* If not authenticated with a code yet or searching */}
        {!activeToken && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md text-center max-w-lg mx-auto space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <School className="w-8 h-8" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-800">
                Acesso Pedagógico para Escolas & Creches
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Insira o código de acesso compartilhado pelo responsável da criança para visualizar
                os relatórios de desenvolvimento.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3 text-left">
              <Input
                type="text"
                placeholder="ex: ESCOLA-7X9AB"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="rounded-2xl h-12 text-center uppercase font-mono font-black text-lg tracking-wider"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputCode.trim()}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20"
              >
                {isLoading ? 'Verificando código…' : 'Acessar Relatório da Criança'}
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

        {/* When activeToken is found */}
        {activeToken && selectedChild && (
          <div className="space-y-8 animate-fade-in">
            {/* Header School Card */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  <School className="w-3.5 h-3.5" />
                  <span>{activeToken.school_name || 'Instituição Escolar'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  Relatório Pedagógico: {selectedChild.name}
                </h1>
                <p className="text-xs text-indigo-100 mt-1">
                  Idade: {formatChildAge(selectedChild.birth_date)} • Visualização oficial somente
                  leitura
                </p>
                {activeToken.note && (
                  <p className="text-xs bg-black/20 text-white/90 p-2.5 rounded-xl mt-3 inline-block">
                    Nota do responsável: "{activeToken.note}"
                  </p>
                )}
              </div>

              {/* Child Switcher if multiple */}
              {childrenList.length > 1 && (
                <div className="flex gap-2">
                  {childrenList.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => setSelectedChild(k)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                        selectedChild.id === k.id
                          ? 'bg-white text-indigo-900 shadow-md'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {k.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Visual Progress: Brain Flower + Pedagogical Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Brain Flower Chart */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-black text-slate-800">Cérebro em Flor</h2>
                </div>
                <p className="text-xs text-slate-500 mb-6 max-w-xs">
                  Mapeamento de maturação nas 5 dimensões cognitivas e socioemocionais.
                </p>

                <BrainFlower progressMap={childProgressMap} size={230} />
              </div>

              {/* 5 Area Summary for Teachers */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-slate-800">
                  Desempenho por Dimensão Pedagógica
                </h2>
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

            {/* Pedagogical Observations & School Tips */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-800">
                  Orientações para o Ambiente Escolar
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COGNIKIDS_MODULES.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mod.icon}</span>
                      <h3 className="font-black text-slate-800">{mod.title}</h3>
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
      </main>
    </div>
  )
}
