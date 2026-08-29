import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchChildById, fetchChildModuleProgress, getChildAvatarUrl } from '@/services/children'
import type { Child, ModuleProgress } from '@/types/cognikids'
import { COGNIKIDS_MODULES, formatChildAge } from '@/types/cognikids'
import { BrainFlower } from '@/components/progress/BrainFlower'
import { TicoMascot } from '@/components/mascot/TicoMascot'
import { Button } from '@/components/ui/button'
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Trophy,
  Star,
  Activity,
  Calendar,
  CheckCircle2,
  Play,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useSound } from '@/context/SoundContext'

export const ChildDashboardPage: React.FC = () => {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { playPop } = useSound()

  const [child, setChild] = useState<Child | null>(null)
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [showGamePicker, setShowGamePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    const load = async () => {
      setIsLoading(true)
      const kid = await fetchChildById(childId)
      setChild(kid)

      if (kid) {
        const progList = await fetchChildModuleProgress(kid.id)
        const map: Record<string, number> = {}
        progList.forEach((p) => {
          map[p.module_id] = p.mastery_percentage
        })
        // Default base values
        COGNIKIDS_MODULES.forEach((m) => {
          if (map[m.id] === undefined) {
            map[m.id] = 40
          }
        })
        setProgressMap(map)
      }
      setIsLoading(false)
    }
    load()
  }, [childId])

  if (isLoading || !child) {
    return (
      <div className="py-20 flex justify-center">
        <TicoMascot size="lg" mood="talking" />
      </div>
    )
  }

  // Calculate overall assimilation average
  const moduleValues = Object.values(progressMap)
  const overallAssimilation = moduleValues.length
    ? Math.round(moduleValues.reduce((a, b) => a + b, 0) / moduleValues.length)
    : 50

  // Find lowest mastery module to suggest
  let lowestModule = COGNIKIDS_MODULES[0]
  let minMastery = 101
  COGNIKIDS_MODULES.forEach((m) => {
    const val = progressMap[m.id] || 0
    if (val < minMastery) {
      minMastery = val
      lowestModule = m
    }
  })

  const handleQuickPlay = () => {
    playPop()
    navigate(`/app/game/${child.id}/${lowestModule.activities[0].id}`)
  }

  const handleSelectActivity = (activityId: string) => {
    playPop()
    setShowGamePicker(false)
    navigate(`/app/game/${child.id}/${activityId}`)
  }

  const avatarUrl = getChildAvatarUrl(child)

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md relative overflow-hidden">
        {/* Decorative background accent */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: child.favorite_color || '#FF7A45' }}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Child Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden shrink-0 ring-4 ring-orange-100"
              style={{ backgroundColor: child.favorite_color || '#FF7A45' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={child.name} className="w-full h-full object-cover" />
              ) : (
                child.name.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">{child.name}</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                  {formatChildAge(child.birth_date)}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Jornada de desenvolvimento cognitivo e vocal em 5 áreas essenciais.
              </p>
            </div>
          </div>

          {/* Assimilation Conic Progress Ring + CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Assimilation Conic Ring */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center relative shadow-sm"
                style={{
                  background: `conic-gradient(#FF7A45 ${overallAssimilation * 3.6}deg, #E2E8F0 0deg)`,
                }}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xs font-black text-slate-800">
                  {overallAssimilation}%
                </div>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase text-slate-400">Assimilação Geral</p>
                <p className="text-xs font-extrabold text-slate-700">Média dos Módulos</p>
              </div>
            </div>

            {/* Big Action Button */}
            <Button
              onClick={() => setShowGamePicker(true)}
              className="h-14 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-lg shadow-orange-500/25 flex items-center gap-2"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>🎮 Jogar agora</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Cérebro em Flor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Flower Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-800">Cérebro em Flor</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6 max-w-xs">
            Cada pétala cresce conforme {child.name} assimila novas palavras, reflexos e padrões.
          </p>

          <BrainFlower
            progressMap={progressMap}
            size={240}
            onSelectModule={(modId) => {
              const mod = COGNIKIDS_MODULES.find((m) => m.id === modId)
              if (mod && mod.activities[0]) {
                handleSelectActivity(mod.activities[0].id)
              }
            }}
          />
        </div>

        {/* 5 Development Modules Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Módulos de Aprendizagem</h2>
            <span className="text-xs font-semibold text-slate-400">Clique para jogar</span>
          </div>

          <div className="space-y-3">
            {COGNIKIDS_MODULES.map((mod) => {
              const mastery = progressMap[mod.id] || 40
              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: mod.lightColor }}
                      >
                        {mod.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-slate-800">{mod.title}</h3>
                          <span
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: mod.color }}
                          >
                            {mastery}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activities inside this module */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                    {mod.activities.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => handleSelectActivity(act.id)}
                        className="flex-1 p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/70 border border-slate-200/60 hover:border-orange-200 transition-colors flex items-center justify-between text-left group/btn"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-800 group-hover/btn:text-orange-600">
                              {act.title}
                            </span>
                            {act.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full">
                                {act.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{act.ageRange}</p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/btn:text-orange-600 group-hover/btn:bg-orange-500 group-hover/btn:text-white transition-colors shrink-0">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Game Picker Modal */}
      <Dialog open={showGamePicker} onOpenChange={setShowGamePicker}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader>
            <div className="flex justify-center mb-1">
              <TicoMascot size="sm" mood="talking" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-800">
              Escolha uma atividade para {child.name}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Jogos adaptados com reconhecimento de fala e estímulo cognitivo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-1">
            {COGNIKIDS_MODULES.flatMap((m) =>
              m.activities.map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleSelectActivity(act.id)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 transition-all flex items-center gap-3 text-left group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: m.lightColor }}
                  >
                    {m.icon}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-orange-600 truncate">
                        {act.title}
                      </p>
                      {act.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded-full shrink-0">
                          {act.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {m.title} • {act.ageRange}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors shrink-0" />
                </button>
              )),
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
