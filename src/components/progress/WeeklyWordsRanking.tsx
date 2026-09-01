import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Volume2, Sparkles, Trophy, Flame, Star, CheckCircle2 } from 'lucide-react'
import type { WeeklyWordRankItem, AppLanguage } from '@/types/cognikids'
import { SUPPORTED_LANGUAGES } from '@/types/cognikids'
import { speechService } from '@/lib/speechSynthesis'

interface WeeklyWordsRankingProps {
  ranking: WeeklyWordRankItem[]
  childName?: string
  className?: string
  onPracticeWord?: (word: string, language: AppLanguage) => void
}

export const WeeklyWordsRanking: React.FC<WeeklyWordsRankingProps> = ({
  ranking,
  childName,
  className = '',
  onPracticeWord,
}) => {
  const [playingWord, setPlayingWord] = useState<string | null>(null)

  const handleSpeak = async (word: string, lang: AppLanguage) => {
    setPlayingWord(word)
    try {
      await speechService.speak(word, { lang })
    } catch (_) {
      // ignore
    } finally {
      setPlayingWord(null)
    }
  }

  const getLangBadge = (lang: AppLanguage) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === lang)
    return found || { flag: '🌐', label: lang }
  }

  // Top 3 for gentle podium representation
  const top3 = ranking.slice(0, 3)
  const remaining = ranking.slice(3)

  return (
    <Card
      className={`rounded-3xl border border-amber-200/90 bg-gradient-to-b from-amber-50/40 via-white to-white shadow-sm overflow-hidden ${className}`}
    >
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-amber-100 bg-gradient-to-r from-amber-100/50 via-orange-50/40 to-yellow-50/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-xl shadow-xs">
              🏆
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5">
                <span>Palavras da Semana</span>
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-xs">
                  Últimos 7 dias
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                {childName
                  ? `Vocábulos mais praticados e assimilados por ${childName}`
                  : 'Destaques semanais para reforçar em família'}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {ranking.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
            <div className="text-3xl mb-2">🌱</div>
            <h4 className="font-bold text-slate-700 text-sm">
              Nenhuma palavra praticada nos últimos 7 dias
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Inicie uma sessão de jogos de fala (Fazenda Falante ou Rimas) para ver os destaques da
              semana!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Gentle Podium Top 3 */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {top3.map((item, idx) => {
                  const langInfo = getLangBadge(item.language)
                  const isFirst = idx === 0
                  const isSecond = idx === 1
                  const isThird = idx === 2
                  const podiumBg = isFirst
                    ? 'bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-50/50 border-amber-300 shadow-sm'
                    : isSecond
                      ? 'bg-gradient-to-br from-slate-100/90 via-slate-50 to-amber-50/30 border-slate-300'
                      : 'bg-gradient-to-br from-orange-50/70 via-amber-50/30 to-yellow-50/30 border-orange-200'

                  const medalEmoji = isFirst
                    ? '🥇 1º Lugar'
                    : isSecond
                      ? '🥈 2º Lugar'
                      : '🥉 3º Lugar'

                  return (
                    <div
                      key={`top_${item.language}_${item.word}_${idx}`}
                      className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all hover:scale-[1.01] ${podiumBg}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 text-amber-900 border border-amber-200/80 shadow-2xs">
                            {medalEmoji}
                          </span>
                          <span className="text-xs flex items-center gap-1 font-bold text-slate-600">
                            <span>{langInfo.flag}</span>
                            <span className="text-[11px]">{langInfo.label}</span>
                          </span>
                        </div>

                        <h4 className="text-base font-black text-slate-900 capitalize truncate mt-1">
                          {item.word}
                        </h4>

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600 font-medium">
                          <span className="flex items-center gap-1 font-bold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {item.accuracy}% acerto
                          </span>
                          <span>•</span>
                          <span>
                            {item.practiceCount} {item.practiceCount === 1 ? 'jogada' : 'jogadas'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-black/5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSpeak(item.word, item.language)}
                          disabled={playingWord === item.word}
                          className="h-8 px-2.5 rounded-xl bg-white/80 hover:bg-white text-orange-800 text-xs font-bold shadow-2xs"
                        >
                          <Volume2
                            className={`w-3.5 h-3.5 mr-1 text-orange-600 ${playingWord === item.word ? 'animate-bounce' : ''}`}
                          />
                          Ouvir
                        </Button>

                        {onPracticeWord && (
                          <button
                            onClick={() => onPracticeWord(item.word, item.language)}
                            className="text-[11px] font-black text-orange-600 hover:text-orange-700 hover:underline"
                          >
                            Reforçar →
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Other weekly highlights (rank 4 to 8) */}
            {remaining.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Outras Palavras em Destaque
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {remaining.map((item, idx) => {
                    const langInfo = getLangBadge(item.language)
                    return (
                      <div
                        key={`rem_${item.language}_${item.word}_${idx}`}
                        className="p-2.5 rounded-2xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/80 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-600 shrink-0">
                            #{idx + 4}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-800 capitalize truncate">
                                {item.word}
                              </span>
                              <span className="text-[11px]">{langInfo.flag}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              {item.accuracy}% de acerto • {item.practiceCount}x praticada
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSpeak(item.word, item.language)}
                            disabled={playingWord === item.word}
                            className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-orange-600"
                            title="Ouvir som"
                          >
                            <Volume2
                              className={`w-3.5 h-3.5 ${playingWord === item.word ? 'animate-bounce text-orange-600' : ''}`}
                            />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Gentle Guardian Tip */}
            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
              <span className="text-base shrink-0">✨</span>
              <span>
                <strong>Dica lúdica:</strong> Use essas palavras campeãs no café da manhã ou
                brincadeiras para fixar a memória fonológica com afeto.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
