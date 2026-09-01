import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Volume2,
  Sparkles,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  Flame,
} from 'lucide-react'
import type { AppLanguage, GameSession, Child } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import {
  computeVocabReviewQueue,
  WordReviewItem,
  getRandomVocabTip,
  getReminderConfig,
  markWordAsReviewed,
  getReviewedWords,
} from '@/services/reminders'
import { Check, BookmarkCheck, ArrowDownRight, CheckCircle } from 'lucide-react'
import { speechService } from '@/lib/speechSynthesis'
import { offlineSyncService } from '@/lib/offlineSync'
import { fetchChildSessions } from '@/services/children'

interface VocabReviewQueueCardProps {
  child?: Child | null
  initialLanguage?: AppLanguage
  className?: string
  compact?: boolean
  onSelectWordToPractice?: (word: string, lang: AppLanguage) => void
}

export const VocabReviewQueueCard: React.FC<VocabReviewQueueCardProps> = ({
  child,
  initialLanguage,
  className = '',
  compact = false,
  onSelectWordToPractice,
}) => {
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(initialLanguage || 'pt-BR')
  const [queueByLang, setQueueByLang] = useState<Record<AppLanguage, WordReviewItem[]>>({
    'pt-BR': [],
    en: [],
    es: [],
    fr: [],
    de: [],
    it: [],
  })
  const [weeklyReviewedCount, setWeeklyReviewedCount] = useState<number>(0)
  const [totalReviewedCount, setTotalReviewedCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [playingWord, setPlayingWord] = useState<string | null>(null)

  // Get active languages configured for child
  const childLanguages: AppLanguage[] = (
    child?.learning_languages &&
    Array.isArray(child.learning_languages) &&
    child.learning_languages.length > 0
      ? child.learning_languages
      : child?.primary_language
        ? [child.primary_language as AppLanguage]
        : ['pt-BR']
  ) as AppLanguage[]

  // Sync initial language if child config changes
  useEffect(() => {
    if (initialLanguage && childLanguages.includes(initialLanguage)) {
      setSelectedLang(initialLanguage)
    } else if (childLanguages.length > 0 && !childLanguages.includes(selectedLang)) {
      setSelectedLang(childLanguages[0])
    }
  }, [child?.id, initialLanguage])

  // Load sessions from PocketBase + offline queue to compute real error queue
  const loadReviewData = async () => {
    setLoading(true)
    try {
      let sessions: GameSession[] = []
      if (child?.id) {
        sessions = await fetchChildSessions(child.id, 100)
      }

      // Merge pending offline sessions
      const pending = offlineSyncService.getPendingSessions()
      const childPending = child?.id ? pending.filter((p) => p.child_id === child.id) : pending

      const combined: GameSession[] = [
        ...childPending.map(
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
        ),
        ...sessions,
      ]

      const computed = computeVocabReviewQueue(combined, childLanguages, child?.id)
      setQueueByLang(computed.queue)
      setWeeklyReviewedCount(computed.reviewedCountThisWeek)
      setTotalReviewedCount(computed.totalReviewedCount)
    } catch (err) {
      console.warn('Failed to load vocab review sessions', err)
      const fallback = computeVocabReviewQueue([], childLanguages, child?.id)
      setQueueByLang(fallback.queue)
      setWeeklyReviewedCount(fallback.reviewedCountThisWeek)
      setTotalReviewedCount(fallback.totalReviewedCount)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviewData()
  }, [child?.id])

  const handleSpeakWord = async (word: string, lang: AppLanguage) => {
    setPlayingWord(word)
    try {
      await speechService.speak(word, { lang })
    } catch (_) {
      // ignore
    } finally {
      setPlayingWord(null)
    }
  }

  const handleMarkAsReviewed = (item: WordReviewItem) => {
    if (!child?.id) return
    markWordAsReviewed(child.id, item.word, item.language)
    // Reload queue state to show immediate reduction/reordering
    loadReviewData()
  }

  const currentWords = queueByLang[selectedLang] || []
  const unreviewedCount = currentWords.filter((w) => !w.isReviewed).length
  const reviewedInLangCount = currentWords.filter((w) => w.isReviewed).length
  const availableLangs = SUPPORTED_LANGUAGES.filter((l) => childLanguages.includes(l.code))

  const activeTip = getRandomVocabTip(selectedLang)

  return (
    <Card
      className={`border-2 border-orange-200/80 shadow-md bg-gradient-to-b from-white to-amber-50/40 rounded-3xl overflow-hidden ${className}`}
    >
      <CardHeader className="pb-3 border-b border-orange-100/80 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-sm text-white">
              🗣️
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                Fila de Palavras a Revisar
                <Badge
                  variant="outline"
                  className="text-[10px] bg-orange-100/80 text-orange-800 border-orange-300 font-bold"
                >
                  Por Idioma
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Vocábulos priorizados pelos erros e assimilação da criança nas jogadas
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadReviewData}
            disabled={loading}
            className="h-8 px-2 text-xs font-bold text-orange-700 hover:text-orange-800 hover:bg-orange-100/60 rounded-xl"
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Language switcher tabs if multiple languages */}
        {availableLangs.length > 1 && (
          <div className="pt-2">
            <Tabs
              value={selectedLang}
              onValueChange={(val) => setSelectedLang(val as AppLanguage)}
              className="w-full"
            >
              <TabsList
                className="grid w-full bg-orange-100/60 p-1 rounded-2xl h-auto"
                style={{ gridTemplateColumns: `repeat(${availableLangs.length}, minmax(0, 1fr))` }}
              >
                {availableLangs.map((lang) => {
                  const count = (queueByLang[lang.code] || []).length
                  return (
                    <TabsTrigger
                      key={lang.code}
                      value={lang.code}
                      className="text-xs font-bold py-1.5 px-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-orange-950 data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="truncate">{lang.label}</span>
                      {count > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500 text-white font-black">
                          {count}
                        </span>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Weekly drop tracker banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-950">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              ✓
            </div>
            <div>
              <p className="font-black text-emerald-900">
                {weeklyReviewedCount > 0
                  ? `${weeklyReviewedCount} ${weeklyReviewedCount === 1 ? 'palavra revisada' : 'palavras revisadas'} esta semana!`
                  : 'Fila pronta para revisão semanal'}
              </p>
              <p className="text-[11px] text-emerald-700">
                {unreviewedCount > 0
                  ? `${unreviewedCount} ${unreviewedCount === 1 ? 'pendente' : 'pendentes'} para praticar com o Tico`
                  : 'Todas as palavras prioritárias foram revisadas!'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 self-end sm:self-auto">
            Queda da Fila 📉
          </span>
        </div>

        {/* Selected language info pill */}
        <div className="flex items-center justify-between bg-orange-50/70 border border-orange-200/70 rounded-2xl p-2.5 px-3 text-xs text-orange-950">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.flag || '🇧🇷'}
            </span>
            <div>
              <span className="font-black">
                {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.label}
              </span>
              <span className="text-slate-500 ml-1.5">
                ({unreviewedCount} pendentes • {reviewedInLangCount} revisadas)
              </span>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold shadow-xs">
            {currentWords.filter((w) => !w.isReviewed && w.errorCount > 0).length > 0
              ? 'Prioridade por Erros'
              : 'Fixação & Revisadas'}
          </Badge>
        </div>

        {/* Word queue list */}
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RotateCw className="w-6 h-6 animate-spin text-orange-400" />
            <span>Calculando fila de vocabulário...</span>
          </div>
        ) : currentWords.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-4">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-bold text-slate-700 text-sm">Sem vocábulos pendentes de reforço!</p>
            <p className="text-xs text-slate-500 mt-1">
              Todas as palavras praticadas neste idioma tiveram excelente acerto.
            </p>
          </div>
        ) : (
          <ScrollArea className={compact ? 'h-[220px]' : 'h-[280px]'}>
            <div className="space-y-2.5 pr-2">
              {currentWords.map((item, idx) => {
                const isTopPriority = idx === 0 && item.errorCount > 0
                return (
                  <div
                    key={`${item.language}_${item.word}_${idx}`}
                    className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isTopPriority
                        ? 'bg-amber-100/60 border-amber-300 shadow-sm'
                        : item.errorCount > 0
                          ? 'bg-orange-50/50 border-orange-200/80 hover:bg-orange-50'
                          : 'bg-white border-slate-200/80 hover:border-orange-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isTopPriority
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight capitalize truncate">
                            {item.word}
                          </span>
                          {isTopPriority && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-[9px] px-1.5 py-0">
                              Mais Errada
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            Assimilação: {item.averageAccuracy}%
                          </span>
                          {item.errorCount > 0 && (
                            <span className="text-red-600 font-bold flex items-center gap-0.5">
                              • {item.errorCount} {item.errorCount === 1 ? 'erro' : 'erros'}
                            </span>
                          )}
                          <span className="text-slate-400">
                            • {item.attemptsCount} {item.attemptsCount === 1 ? 'jogada' : 'jogadas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSpeakWord(item.word, item.language)}
                        disabled={playingWord === item.word}
                        className="h-8 w-8 p-0 rounded-xl bg-orange-100/80 hover:bg-orange-200 text-orange-800"
                        title="Ouvir pronúncia"
                      >
                        <Volume2
                          className={`w-4 h-4 ${playingWord === item.word ? 'animate-bounce text-orange-600' : ''}`}
                        />
                      </Button>

                      {/* Action: Mark as reviewed toggle */}
                      {item.isReviewed ? (
                        <Badge
                          variant="outline"
                          className="h-8 px-2.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Revisada</span>
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsReviewed(item)}
                          className="h-8 px-2 text-[11px] font-bold rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
                          title="Marcar palavra como revisada pelo responsável"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Revisada
                        </Button>
                      )}

                      {onSelectWordToPractice && !item.isReviewed && (
                        <Button
                          size="sm"
                          onClick={() => onSelectWordToPractice(item.word, item.language)}
                          className="h-8 px-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-xs"
                        >
                          Praticar
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Practical home tip based on selected language */}
        {activeTip && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-300/80 rounded-2xl p-3.5 flex items-start gap-3">
            <span className="text-xl shrink-0">💡</span>
            <div className="text-xs text-amber-950 space-y-1">
              <p className="font-black text-amber-900 flex items-center gap-1">
                Dica de Fixação em Casa ({activeTip.languageLabel})
              </p>
              <p className="text-slate-700 leading-relaxed">
                Pratique{' '}
                <strong className="font-black text-orange-800">"{activeTip.wordNative}"</strong> (
                {activeTip.wordTranslation}): {activeTip.practicalHomeTip}
              </p>
              <p className="text-[11px] text-amber-800 font-mono bg-amber-100/80 px-2 py-0.5 rounded-md inline-block">
                Frase: "{activeTip.samplePhrase}"
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
