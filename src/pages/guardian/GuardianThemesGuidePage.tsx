import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  fetchChildren,
  fetchChildModuleProgress,
  fetchChildSessions,
  fetchChildAchievements,
  getChildAvatarUrl,
} from '@/services/children'
import type { Child } from '@/types/cognikids'
import { COGNIKIDS_MODULES, formatChildAge, calculateAgeMonths } from '@/types/cognikids'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Sparkles,
  HeartHandshake,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  Users,
  Target,
  Smile,
  ShieldAlert,
  HelpCircle,
  Clock,
  Share2,
} from 'lucide-react'

export const GuardianThemesGuidePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [childProgressMap, setChildProgressMap] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModuleId, setSelectedModuleId] = useState<string>('speech')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const list = await fetchChildren()
      setChildrenList(list)

      const storedChildId = localStorage.getItem('cognikids_selected_child_id')
      const active = list.find((c) => c.id === storedChildId) || list[0] || null
      setSelectedChild(active)

      if (active) {
        const prog = await fetchChildModuleProgress(active.id)
        const map: Record<string, number> = {}
        prog.forEach((p) => {
          map[p.module_id] = p.mastery_percentage
        })
        setChildProgressMap(map)
      }
      setIsLoading(false)
    }
    load()
  }, [])

  const handleSelectChild = async (kid: Child) => {
    setSelectedChild(kid)
    localStorage.setItem('cognikids_selected_child_id', kid.id)
    setIsLoading(true)
    const prog = await fetchChildModuleProgress(kid.id)
    const map: Record<string, number> = {}
    prog.forEach((p) => {
      map[p.module_id] = p.mastery_percentage
    })
    setChildProgressMap(map)
    setIsLoading(false)
  }

  const activeModule =
    COGNIKIDS_MODULES.find((m) => m.id === selectedModuleId) || COGNIKIDS_MODULES[0]

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Área do Responsável • Guia Pedagógico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Temas, Assuntos & Como Incentivar em Casa
          </h1>
          <p className="text-sm text-white/90 mt-1 leading-relaxed">
            Entenda detalhadamente cada habilidade trabalhada nos jogos do CogniKids e saiba como
            potencializar a fala, lógica e emoções no cotidiano familiar.
          </p>
        </div>
      </div>

      {/* Child Switcher if multiple */}
      {childrenList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filho selecionado:</span>
          {childrenList.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectChild(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedChild?.id === c.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.name} ({formatChildAge(c.birth_date)})
            </button>
          ))}
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {COGNIKIDS_MODULES.map((m) => {
          const isSelected = selectedModuleId === m.id
          const currentMastery = childProgressMap[m.id] ?? 45

          return (
            <button
              key={m.id}
              onClick={() => setSelectedModuleId(m.id)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-white border-orange-500 shadow-md ring-2 ring-orange-200'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{m.icon}</span>
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {currentMastery}%
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 leading-tight line-clamp-1">
                  {m.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{m.subtitle}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Module Detailed Guide */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
              style={{ backgroundColor: activeModule.lightColor }}
            >
              {activeModule.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800">{activeModule.title}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Faixa {activeModule.minAgeMonths}–{activeModule.maxAgeMonths} meses
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{activeModule.description}</p>
            </div>
          </div>

          {selectedChild && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() =>
                  navigate(`/app/game/${selectedChild.id}/${activeModule.activities[0].id}`)
                }
                className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Jogar nesta área
              </Button>
            </div>
          )}
        </div>

        {/* Themes and Topics Breakdown */}
        <div className="space-y-5">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider text-slate-400">
            Temas e Assuntos Abordados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeModule.themes.map((th, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">
                    {idx + 1}
                  </div>
                  <h4 className="text-sm font-black text-slate-800">{th.title}</h4>
                </div>

                <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60">
                  <span className="font-bold text-slate-700">O que é trabalhado: </span>
                  {th.whatIsWorked}
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-black uppercase text-amber-700 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Como incentivar e reforçar em casa:</span>
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {th.homeTips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activities in this Module */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-sm font-black text-slate-800">
            Jogos e Atividades Disponíveis no CogniKids:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeModule.activities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-black text-slate-800">{act.title}</h5>
                    {act.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full">
                        {act.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {act.description}
                  </p>
                </div>
                {selectedChild && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/app/game/${selectedChild.id}/${act.id}`)}
                    className="h-8 px-2.5 text-orange-600 font-bold hover:bg-orange-50 text-xs shrink-0"
                  >
                    <span>Abrir</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
