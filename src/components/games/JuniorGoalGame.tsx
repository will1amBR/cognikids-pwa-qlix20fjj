import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '@/components/layout/GameShell'
import { CelebrationScreen } from '@/components/celebration/CelebrationScreen'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSound } from '@/context/SoundContext'
import { offlineSyncService } from '@/lib/offlineSync'
import { fetchChildById } from '@/services/children'
import type { Child } from '@/types/cognikids'
import { Trophy, Sparkles, Play, Target, RotateCcw } from 'lucide-react'

interface JuniorGoalGameProps {
  child?: Child | null
}

const TOTAL_KICKS = 5

export const JuniorGoalGame: React.FC<JuniorGoalGameProps> = ({ child: initialChild }) => {
  const { childId: routeChildId } = useParams<{ childId: string }>()
  const childId = initialChild?.id || routeChildId
  const navigate = useNavigate()
  const { playSound } = useSound()

  const [child, setChild] = useState<Child | null>(initialChild || null)
  const [kickIndex, setKickIndex] = useState<number>(0)
  const [goalsScored, setGoalsScored] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [isKicking, setIsKicking] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  // Goalkeeper position: 0 to 100 percentage horizontally
  const [keeperX, setKeeperX] = useState<number>(50)
  const [keeperDir, setKeeperDir] = useState<'left' | 'right'>('right')

  // Ball position: { x: percentage 0-100, y: percentage 0-100 }
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 90 })

  // Target aim cursor: 15 to 85 percentage
  const [aimX, setAimX] = useState<number>(50)
  const [isAiming, setIsAiming] = useState<boolean>(false)

  // Ref tracking
  const keeperXRef = useRef<number>(keeperX)
  const keeperDirRef = useRef<'left' | 'right'>('right')
  const isKickingRef = useRef<boolean>(isKicking)

  useEffect(() => {
    keeperXRef.current = keeperX
  }, [keeperX])

  useEffect(() => {
    keeperDirRef.current = keeperDir
  }, [keeperDir])

  useEffect(() => {
    isKickingRef.current = isKicking
  }, [isKicking])

  useEffect(() => {
    if (childId) {
      fetchChildById(childId).then((c) => {
        if (c) setChild(c)
      })
    }
  }, [childId])

  // Progressive speed based on kick index
  const keeperSpeed = 1.2 + kickIndex * 0.45

  // Keeper animation loop
  useEffect(() => {
    if (isCompleted) return

    const interval = setInterval(() => {
      let cur = keeperXRef.current
      let dir = keeperDirRef.current

      if (dir === 'right') {
        cur += keeperSpeed
        if (cur >= 80) {
          cur = 80
          dir = 'left'
        }
      } else {
        cur -= keeperSpeed
        if (cur <= 20) {
          cur = 20
          dir = 'right'
        }
      }

      setKeeperX(cur)
      setKeeperDir(dir)
    }, 30)

    return () => clearInterval(interval)
  }, [isCompleted, keeperSpeed])

  // Handle kick shot
  const shootBall = useCallback(
    (targetX: number) => {
      if (isKickingRef.current || isCompleted) return

      setIsKicking(true)
      playSound('pop')

      // Animate ball moving to top
      const startX = 50
      const startY = 88
      const targetY = 28 // Goal line

      setBallPos({ x: targetX, y: targetY })

      // Evaluate after animation completes (550ms)
      setTimeout(() => {
        const finalKeeperX = keeperXRef.current
        const diff = Math.abs(targetX - finalKeeperX)

        // If ball is within 14% of goalkeeper, it's saved!
        const isGoal = diff > 15

        if (isGoal) {
          playSound('correct')
          setFeedback('GOLAÇO! Que chute certeiro! ⚽🔥')
          setGoalsScored((g) => g + 1)
          setScore((s) => s + 25 + Math.round(diff * 0.5))
        } else {
          playSound('error')
          setFeedback('DEFENDEU! O goleiro espalmou! 🧤')
        }

        setTimeout(() => {
          setFeedback(null)
          setBallPos({ x: 50, y: 88 })
          setIsKicking(false)

          const nextKick = kickIndex + 1
          setKickIndex(nextKick)

          if (nextKick >= TOTAL_KICKS) {
            finishMatch(isGoal ? goalsScored + 1 : goalsScored, isGoal ? score + 25 : score)
          }
        }, 1100)
      }, 550)
    },
    [kickIndex, goalsScored, score, isCompleted, playSound],
  )

  // Keyboard kick with Space or Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') {
        setAimX((prev) => Math.max(18, prev - 6))
      } else if (e.code === 'ArrowRight') {
        setAimX((prev) => Math.min(82, prev + 6))
      } else if (['Space', 'Enter'].includes(e.code)) {
        e.preventDefault()
        shootBall(aimX)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [aimX, shootBall])

  // Drag / Touch aiming across the goal
  const handleAimMove = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (isKicking) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const percent = ((clientX - rect.left) / rect.width) * 100
    const clamped = Math.min(82, Math.max(18, Math.round(percent)))
    setAimX(clamped)
  }

  const finishMatch = (finalGoals: number, finalScore: number) => {
    setIsCompleted(true)
    playSound('fanfare')

    const stars = finalGoals >= 4 ? 3 : finalGoals >= 2 ? 2 : 1
    const accuracy = Math.round((finalGoals / TOTAL_KICKS) * 100)

    const sessionChild = child || {
      id: childId || 'arthur_demo_id',
      user_id: 'demo_user',
      name: 'Arthur (Junior)',
      birth_date: new Date().toISOString(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }

    offlineSyncService.saveSession({
      user_id: sessionChild.user_id || 'demo_user',
      child_id: sessionChild.id,
      module_id: 'junior_goal',
      game_id: 'junior_goal',
      game_title: 'Acerte o Gol',
      stars,
      score: finalScore,
      accuracy,
      rounds_completed: TOTAL_KICKS,
      total_rounds: TOTAL_KICKS,
      language: sessionChild.primary_language || 'pt-BR',
      details: {
        goalsScored: finalGoals,
        totalKicks: TOTAL_KICKS,
        arcade: true,
        isJunior: true,
      },
    })
  }

  if (isCompleted) {
    const stars = goalsScored >= 4 ? 3 : goalsScored >= 2 ? 2 : 1
    const accuracy = Math.round((goalsScored / TOTAL_KICKS) * 100)

    return (
      <GameShell title="Acerte o Gol" onBack={() => navigate('/junior')}>
        <CelebrationScreen
          title="Fim de Partida! ⚽🏆"
          subtitle={`Gols marcados: ${goalsScored} de ${TOTAL_KICKS} finalizações!`}
          childName={child?.name || 'Arthur'}
          childId={child?.id}
          score={score}
          accuracy={accuracy}
          stars={stars}
          roundsCompleted={TOTAL_KICKS}
          totalRounds={TOTAL_KICKS}
          practicedWords={[
            `Chute 1: ${goalsScored >= 1 ? 'Gol ⚽' : 'Defendido 🧤'}`,
            `Chute 2: ${goalsScored >= 2 ? 'Gol ⚽' : 'Defendido 🧤'}`,
            `Chute 3: ${goalsScored >= 3 ? 'Gol ⚽' : 'Defendido 🧤'}`,
            `Chute 4: ${goalsScored >= 4 ? 'Gol ⚽' : 'Defendido 🧤'}`,
            `Chute 5: ${goalsScored >= 5 ? 'Gol ⚽' : 'Defendido 🧤'}`,
          ]}
          onPlayAgain={() => {
            setIsCompleted(false)
            setKickIndex(0)
            setGoalsScored(0)
            setScore(0)
            setBallPos({ x: 50, y: 88 })
          }}
          onExit={() => navigate('/junior')}
          exitLabel="Voltar ao Junior"
          isJunior={true}
        />
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Acerte o Gol"
      score={score}
      stars={3}
      currentRound={kickIndex + 1}
      totalRounds={TOTAL_KICKS}
      onBack={() => navigate('/junior')}
    >
      <div className="max-w-md w-full mx-auto flex flex-col items-center gap-3">
        {/* Top Info Bar */}
        <div className="w-full flex items-center justify-between bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Chute:</span>
            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-black text-xs">
              #{kickIndex + 1} de {TOTAL_KICKS}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs font-extrabold text-slate-700">
            <span>
              Gols: <strong className="text-emerald-600">{goalsScored} ⚽</strong>
            </span>
            <span>
              Pts: <strong className="text-amber-600">{score}</strong>
            </span>
          </div>
        </div>

        {/* Stadium / Pitch Pitch Stage */}
        <div
          onMouseMove={handleAimMove}
          onTouchMove={handleAimMove}
          onClick={() => shootBall(aimX)}
          className="relative w-full aspect-[4/5] max-w-[340px] sm:max-w-[380px] bg-gradient-to-b from-emerald-800 via-emerald-700 to-green-600 rounded-3xl border-4 border-emerald-900/60 p-3 shadow-2xl overflow-hidden cursor-crosshair select-none flex flex-col justify-between"
        >
          {/* Pitch Markings */}
          <div className="absolute inset-x-8 top-6 h-28 border-4 border-white/60 rounded-b-xl border-t-0 pointer-events-none" />
          <div className="absolute inset-x-16 top-6 h-14 border-4 border-white/60 rounded-b-lg border-t-0 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-1/3 border-b-2 border-white/40 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/30 rounded-full pointer-events-none" />

          {/* Goal Net */}
          <div className="relative mx-auto w-4/5 h-20 bg-white/20 border-4 border-white rounded-t-xl overflow-hidden shadow-inner flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] opacity-40 pointer-events-none" />
            <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">
              GOL COGNIKIDS
            </span>

            {/* Goalkeeper Moving Left/Right */}
            <div
              className="absolute top-3 transition-transform duration-75 text-3xl sm:text-4xl pointer-events-none drop-shadow-lg"
              style={{
                left: `${keeperX}%`,
                transform: 'translateX(-50%)',
              }}
            >
              🧤
            </div>
          </div>

          {/* Aim Target Line / Crosshair */}
          {!isKicking && (
            <div
              className="absolute top-12 transition-all duration-75 pointer-events-none"
              style={{ left: `${aimX}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-300 animate-spin flex items-center justify-center text-amber-300 text-xs font-black shadow-md">
                🎯
              </div>
            </div>
          )}

          {/* Feedback Overlay Toast */}
          {feedback && (
            <div className="absolute inset-x-4 top-1/3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-amber-400 shadow-xl text-center text-sm font-black text-slate-900 animate-bounce z-20">
              {feedback}
            </div>
          )}

          {/* Soccer Ball */}
          <div
            className={`absolute text-3xl sm:text-4xl transition-all ${
              isKicking ? 'duration-500 ease-out scale-75' : 'duration-75 scale-100'
            }`}
            style={{
              left: `${isKicking ? ballPos.x : 50}%`,
              top: `${isKicking ? ballPos.y : 82}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            ⚽
          </div>

          {/* Bottom Aim Guide */}
          <div className="w-full text-center text-white/90 text-xs font-bold pointer-events-none drop-shadow-sm pb-1">
            Arraste ou clique para mirar e chutar!
          </div>
        </div>

        {/* Kick Button for Touch / Mobile */}
        <div className="w-full flex items-center gap-2">
          <Button
            size="lg"
            disabled={isKicking}
            onClick={() => shootBall(aimX)}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-lg h-13 flex items-center justify-center gap-2"
          >
            <span>CHUTAR NO GOL! ⚽</span>
          </Button>
        </div>
      </div>
    </GameShell>
  )
}
