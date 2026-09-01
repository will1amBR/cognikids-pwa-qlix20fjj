import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  History,
  Languages,
  Calendar,
  Filter,
  Search,
  Star,
  Sparkles,
  ArrowLeft,
  RotateCw,
  TrendingUp,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BarChart2,
} from 'lucide-react'
import type { Child, GameSession, AppLanguage } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES, COGNIKIDS_MODULES } from '@/types/cognikids'
import {
  fetchChildById,
  fetchChildSessions,
  fetchChildren,
  getChildAvatarUrl,
} from '@/services/children'
import { offlineSyncService } from '@/lib/offlineSync'
import { speechService } from '@/lib/speechSynthesis'
import { BilingualBadge } from '@/components/mascot/BilingualBadge'
import { VocabReviewQueueCard } from '@/components/reminders/VocabReviewQueueCard'
import { TicoMascot } from '@/components/mascot/TicoMascot'

type PeriodFilter = 'all' | 'today' | '7days' | '30days' | 'custom'

export const GameHistoryPage: React.FC = () => {
  const { childId } = useParams<{ childId?: string }>()
  const navigate = useNavigate()

  const [childrenList, setChildrenList] = useState<Child[]>([])
  const [currentChild, setCurrentChild] = useState<Child | null>(null)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Filters state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('30days')
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [searchWord, setSearchWord] = useState<string>('')
  const [playingWord, setPlayingWord] = useState<string | null>(null)

  // Load children list and selected child
  useEffect(() => {
    const loadInit = async () => {
      try {
        const kids = await fetchChildren()
        setChildrenList(kids)

        const targetId =
          childId || localStorage.getItem('cognikids_selected_child_id') || kids[0]?.id
        if (targetId) {
          const kid = kids.find((k) => k.id === targetId) || (await fetchChildById(targetId))
          setCurrentChild(kid)
        }
      } catch (err) {
        console.warn('Error loading children in history', err)
      }
    }
    loadInit()
  }, [childId])

  // Load sessions when child changes
  const loadSessions = async () => {
    if (!currentChild?.id) return
    setLoading(true)
    try {
      const serverSessions = await fetchChildSessions(currentChild.id, 200)

      // Include offline pending sessions
      const pending = offlineSyncService
        .getPendingSessions()
        .filter((p) => p.child_id === currentChild.id)

      const formattedPending: GameSession[] = pending.map(
        (p, idx) =>
          ({
            id: `pending_${idx}`,
            user_id: p.user_id,
            child_id: p.child_id,
            module_id: p.module_id,
            game_id: p.game_id,
            game_title: p.game_title,
            stars: p.stars,
            score: p.score,
            accuracy: p.accuracy,
            rounds_completed: p.rounds_completed,
            total_rounds: p.total_rounds,
            language: p.language || 'pt-BR',
            details: p.details,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          }) as GameSession,
      )

      // Combine and sort by date descending
      const combined = [...formattedPending, ...serverSessions].sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
      )

      setSessions(combined)
    } catch (err) {
      console.warn('Error loading child sessions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [currentChild?.id])

  // Pronounce word helper
  const handleSpeakWord = async (word: string, lang?: string) => {
    setPlayingWord(word)
    try {
      const targetLang = (lang || 'pt-BR') as AppLanguage
      await speechService.speak(word, { lang: targetLang })
    } catch (_) {
      // ignore
    } finally {
      setPlayingWord(null)
    }
  }

  // Filtered sessions computation
  const filteredSessions = useMemo(() => {
    const now = new Date()
    return sessions.filter((s) => {
      // 1. Filter by language
      if (selectedLanguage !== 'all') {
        const sessLang = s.language || 'pt-BR'
        if (sessLang !== selectedLanguage) return false
      }

      // 2. Filter by module
      if (selectedModule !== 'all') {
        if (s.module_id !== selectedModule) return false
      }

      // 3. Filter by period
      const sDate = new Date(s.created)
      if (selectedPeriod === 'today') {
        const todayStr = now.toISOString().split('T')[0]
        const sessStr = sDate.toISOString().split('T')[0]
        if (sessStr !== todayStr) return false
      } else if (selectedPeriod === '7days') {
        const limit7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (sDate < limit7) return false
      } else if (selectedPeriod === '30days') {
        const limit30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        if (sDate < limit30) return false
      } else if (selectedPeriod === 'custom') {
        if (customStartDate && sDate < new Date(customStartDate)) return false
        if (customEndDate) {
          const endInclusive = new Date(customEndDate)
          endInclusive.setHours(23, 59, 59, 999)
          if (sDate > endInclusive) return false
        }
      }

      // 4. Search word filter inside details
      if (searchWord.trim()) {
        const term = searchWord.trim().toLowerCase()
        const titleMatch = (s.game_title || '').toLowerCase().includes(term)
        const details = (s.details as any) || {}
        let wordMatch = false

        if (details.wordResults && Array.isArray(details.wordResults)) {
          wordMatch = details.wordResults.some((wr: any) =>
            String(wr?.word || '')
              .toLowerCase()
              .includes(term),
          )
        }
        if (details.items && Array.isArray(details.items)) {
          wordMatch =
            wordMatch || details.items.some((it: string) => String(it).toLowerCase().includes(term))
        }

        if (!titleMatch && !wordMatch) return false
      }

      return true
    })
  }, [
    sessions,
    selectedLanguage,
    selectedPeriod,
    selectedModule,
    customStartDate,
    customEndDate,
    searchWord,
  ])

  // Summary statistics for the filtered view
  const stats = useMemo(() => {
    const count = filteredSessions.length
    const totalStars = filteredSessions.reduce((acc, s) => acc + (s.stars || 1), 0)
    const avgAccuracy =
      count > 0
        ? Math.round(
            filteredSessions.reduce((acc, s) => acc + (s.accuracy || s.score || 80), 0) / count,
          )
        : 0

    // Unique words practiced
    const wordsSet = new Set<string>()
    filteredSessions.forEach((s) => {
      const details = (s.details as any) || {}
      if (details.wordResults && Array.isArray(details.wordResults)) {
        details.wordResults.forEach((wr: any) => {
          if (wr && wr.word) wordsSet.add(wr.word)
        })
      } else if (details.items && Array.isArray(details.items)) {
        details.items.forEach((it: string) => wordsSet.add(it))
      }
    })

    // Breakdown per language
    const byLang: Record<string, { count: number; totalAcc: number; stars: number }> = {}
    filteredSessions.forEach((s) => {
      const l = s.language || 'pt-BR'
      if (!byLang[l]) {
        byLang[l] = { count: 0, totalAcc: 0, stars: 0 }
      }
      byLang[l].count += 1
      byLang[l].totalAcc += s.accuracy || s.score || 80
      byLang[l].stars += s.stars || 1
    })

    return {
      count,
      totalStars,
      avgAccuracy,
      uniqueWordsCount: wordsSet.size,
      byLang,
    }
  }, [filteredSessions])

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  const getLanguageDetails = (code?: string) => {
    const lang = code || 'pt-BR'
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === lang) || {
        code: lang as AppLanguage,
        label: lang,
        nativeName: lang,
        flag: '🌐',
      }
    )
  }

  const getModuleInfo = (moduleId: string) => {
    return (
      COGNIKIDS_MODULES.find((m) => m.id === moduleId) || {
        id: moduleId,
        title: moduleId,
        color: '#FF7A45',
        icon: '🎮',
      }
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10 relative overflow-hidden">
        <div className="absolute right-2 top-2 opacity-15 pointer-events-none hidden sm:block">
          <TicoMascot size="lg" mood="curious" animate={false} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white/90 hover:text-white hover:bg-white/20 -ml-2 h-8 px-2 rounded-xl text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Histórico de Partidas por Idioma
                </h1>
                <p className="text-white/90 text-xs sm:text-sm font-medium">
                  Acompanhe cada jogada, palavras praticadas, taxa de acerto e evolução da criança
                </p>
              </div>
            </div>
          </div>

          {/* Child Switcher if multiple */}
          {childrenList.length > 1 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 self-stretch sm:self-auto">
              <Select
                value={currentChild?.id}
                onValueChange={(id) => {
                  const found = childrenList.find((c) => c.id === id)
                  if (found) {
                    setCurrentChild(found)
                    navigate(`/app/history/${id}`)
                  }
                }}
              >
                <SelectTrigger className="h-10 bg-white text-slate-900 font-bold text-xs rounded-xl border-0 shadow-sm w-full sm:w-48">
                  <SelectValue placeholder="Escolher criança" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {childrenList.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="font-bold text-xs">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Child Profile Quick Bar with Bilingual Badge */}
        {currentChild && (
          <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md overflow-hidden border-2 border-white/40"
                style={{ backgroundColor: currentChild.favorite_color || '#FF7A45' }}
              >
                {currentChild.avatar ? (
                  <img
                    src={getChildAvatarUrl(currentChild) || ''}
                    alt={currentChild.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentChild.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-base">{currentChild.name}</span>
                  <BilingualBadge child={currentChild} showLanguages size="sm" />
                </div>
                <p className="text-xs text-white/80">
                  {currentChild.learning_languages && currentChild.learning_languages.length > 0
                    ? `Idiomas ativos: ${currentChild.learning_languages.join(', ')}`
                    : 'Português (pt-BR)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={loadSessions}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-xl text-xs font-bold h-8"
              >
                <RotateCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Atualizar dados
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
              🎮
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Partidas
              </p>
              <h3 className="text-xl font-black text-slate-900">{stats.count}</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
              ⭐
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Estrelas
              </p>
              <h3 className="text-xl font-black text-slate-900">{stats.totalStars}</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Assimilação Média
              </p>
              <h3 className="text-xl font-black text-slate-900">{stats.avgAccuracy}%</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
              🗣️
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Vocábulos Distintos
              </p>
              <h3 className="text-xl font-black text-slate-900">{stats.uniqueWordsCount}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Layout: Filters & Session List + Word Review Queue Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Filters & Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar Card */}
          <Card className="rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 bg-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-500" />
                Filtros do Histórico
              </h3>
              {(selectedLanguage !== 'all' ||
                selectedPeriod !== '30days' ||
                selectedModule !== 'all' ||
                searchWord) && (
                <button
                  onClick={() => {
                    setSelectedLanguage('all')
                    setSelectedPeriod('30days')
                    setSelectedModule('all')
                    setSearchWord('')
                    setCustomStartDate('')
                    setCustomEndDate('')
                  }}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Language filter buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Idioma da Partida
              </label>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={selectedLanguage === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedLanguage('all')}
                  className={`h-8 rounded-xl text-xs font-bold ${
                    selectedLanguage === 'all'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🌐 Todos os Idiomas
                </Button>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.code
                  const countForLang = stats.byLang[lang.code]?.count || 0
                  return (
                    <Button
                      key={lang.code}
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`h-8 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {countForLang > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                            isSelected ? 'bg-white/30 text-white' : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {countForLang}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Period filter + Module filter + Search Word */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Período
                </label>
                <Select
                  value={selectedPeriod}
                  onValueChange={(val) => setSelectedPeriod(val as PeriodFilter)}
                >
                  <SelectTrigger className="h-10 rounded-xl text-xs font-bold bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="all">Todo o Histórico</SelectItem>
                    <SelectItem value="custom">Personalizado (Datas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Módulo de Desenvolvimento
                </label>
                <Select value={selectedModule} onValueChange={(val) => setSelectedModule(val)}>
                  <SelectTrigger className="h-10 rounded-xl text-xs font-bold bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Todos os módulos" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="all">Todos os módulos</SelectItem>
                    {COGNIKIDS_MODULES.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.icon} {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Buscar Palavra / Jogo
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Ex: Borboleta, Fazenda..."
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    className="h-10 pl-8 rounded-xl text-xs font-medium bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 bg-orange-50/50 p-3 rounded-2xl">
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Data Inicial</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">Data Final</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-white"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Sessions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500">
                Exibindo <strong className="text-slate-800">{filteredSessions.length}</strong>{' '}
                partidas
              </span>
              {filteredSessions.length > 0 && (
                <span className="text-xs font-semibold text-orange-600">
                  Ordenadas da mais recente para a mais antiga
                </span>
              )}
            </div>

            {loading ? (
              <Card className="rounded-3xl p-12 text-center text-slate-400">
                <RotateCw className="w-6 h-6 animate-spin text-orange-400 mx-auto mb-2" />
                <p className="text-xs font-bold">Carregando histórico de partidas...</p>
              </Card>
            ) : filteredSessions.length === 0 ? (
              <Card className="rounded-3xl p-10 text-center bg-white border border-dashed border-slate-200">
                <div className="text-4xl mb-3">🧩</div>
                <h4 className="font-black text-slate-800 text-base">Nenhuma partida encontrada</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Não foram encontradas partidas para os filtros selecionados. Tente ajustar o
                  idioma, o período ou incentive a criança a jogar uma sessão agora!
                </p>
                {currentChild && (
                  <Button
                    onClick={() => navigate(`/app/child/${currentChild.id}`)}
                    className="mt-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                  >
                    Iniciar Jogos com o Tico
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session, idx) => {
                  const lang = getLanguageDetails(session.language)
                  const mod = getModuleInfo(session.module_id)
                  const details = (session.details as any) || {}
                  const wordResults: Array<{
                    word: string
                    score?: number
                    isRecognized?: boolean
                  }> =
                    details.wordResults ||
                    (details.items
                      ? details.items.map((it: string) => ({
                          word: it,
                          score: session.accuracy || session.score,
                          isRecognized: true,
                        }))
                      : [])

                  const isPending = session.id.startsWith('pending_')

                  return (
                    <Card
                      key={session.id || idx}
                      className="rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow bg-white overflow-hidden"
                    >
                      <div className="p-4 sm:p-5 space-y-3">
                        {/* Session Top Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs"
                              style={{ backgroundColor: `${mod.color}18`, color: mod.color }}
                            >
                              {mod.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                                  {session.game_title || 'Partida de Jogos'}
                                </h4>
                                {isPending && (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px]">
                                    Offline (Pendente Sync)
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formatDate(session.created)}
                                <span className="text-slate-300">•</span>
                                <span className="font-semibold text-slate-600">{mod.title}</span>
                              </p>
                            </div>
                          </div>

                          {/* Language Badge + Stars + Accuracy */}
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-slate-50 border-slate-200 text-slate-800 font-bold text-xs px-2.5 py-1 flex items-center gap-1"
                            >
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </Badge>

                            <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-black text-amber-900">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>{session.stars || 3}</span>
                            </div>

                            <div className="bg-orange-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-xs">
                              {session.accuracy || session.score || 80}%
                            </div>
                          </div>
                        </div>

                        {/* Words Practiced Pills */}
                        {wordResults.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                Vocábulos Praticados nesta partida ({wordResults.length})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Toque no som para escutar a pronúncia
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {wordResults.map((wr, wIdx) => {
                                const wordText = wr.word || 'Palavra'
                                const score = wr.score !== undefined ? wr.score : 80
                                const isLow = score < 75 || wr.isRecognized === false
                                const isPlaying = playingWord === wordText

                                return (
                                  <div
                                    key={`${session.id}_w_${wIdx}`}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                                      isLow
                                        ? 'bg-red-50 text-red-900 border-red-200'
                                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-orange-50 hover:border-orange-200'
                                    }`}
                                  >
                                    <span className="capitalize">{wordText}</span>
                                    {isLow && (
                                      <span className="text-[9px] bg-red-500 text-white font-black px-1 rounded-md">
                                        Revisar
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleSpeakWord(wordText, session.language)}
                                      disabled={isPlaying}
                                      className="text-slate-400 hover:text-orange-600 transition-colors p-0.5"
                                      title="Ouvir pronúncia"
                                    >
                                      <Volume2
                                        className={`w-3 h-3 ${isPlaying ? 'animate-bounce text-orange-600' : ''}`}
                                      />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Vocab Review Queue Card & Fast Practice */}
        <div className="space-y-4">
          <VocabReviewQueueCard
            child={currentChild}
            initialLanguage={
              selectedLanguage !== 'all' ? (selectedLanguage as AppLanguage) : undefined
            }
            onSelectWordToPractice={(word, lang) => {
              if (currentChild?.id) {
                navigate(`/app/game/${currentChild.id}/fazenda_falante`)
              }
            }}
          />

          {/* Quick Stats by Language Card */}
          <Card className="rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 bg-white space-y-3">
            <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-orange-500" />
              Desempenho Geral por Idioma
            </h4>

            <div className="space-y-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const langStat = stats.byLang[lang.code]
                if (!langStat || langStat.count === 0) return null
                const avg = Math.round(langStat.totalAcc / langStat.count)

                return (
                  <div
                    key={lang.code}
                    className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-800 flex items-center gap-1.5">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      <span className="font-black text-orange-600">{avg}% acerto</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, avg)}%`,
                          backgroundColor:
                            avg >= 80 ? '#10B981' : avg >= 60 ? '#F59E0B' : '#EF4444',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {langStat.count} {langStat.count === 1 ? 'partida' : 'partidas'}
                      </span>
                      <span className="flex items-center gap-1">⭐ {langStat.stars} estrelas</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
