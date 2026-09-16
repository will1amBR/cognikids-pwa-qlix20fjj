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
import { Play, Sparkles, Trophy, ArrowUp, Coins } from 'lucide-react'

interface JuniorRunnerGameProps {
  child?: Child | null
}

interface Obstacle {
  id: number
  x: number // percentage 0 to 100
  emoji: string
  label: string
}

interface Coin {
  id: number
  x: number
  y: number
  collected: boolean
}

const GRAVITY = 0.55
const JUMP_FORCE = -11.5
const GROUND_Y = 0

export const JuniorRunnerGame: React.FC<JuniorRunnerGameProps> = ({ child: initialChild }) => {
  const { childId: routeChildId } = useParams<{ childId: string }>()
  const childId = initialChild?.id || routeChildId
  const navigate = useNavigate()
  const { playSound } = useSound()

  const [child, setChild] = useState<Child | null>(initialChild || null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [coinsCount, setCoinsCount] = useState<number>(0)
  const [distance, setDistance] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(1.2)

  // Runner vertical physics: y (0 is on ground, positive is in air)
  const [runnerY, setRunnerY] = useState<number>(0)
  const [velocityY, setVelocityY] = useState<number>(0)
  const [isJumping, setIsJumping] = useState<boolean>(false)

  // Obstacles and coins array
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [coins, setCoins] = useState<Coin[]>([])

  // Tracking refs for animation loop
  const runnerYRef = useRef<number>(0)
  const velocityYRef = useRef<number>(0)
  const isJumpingRef = useRef<boolean>(false)
  const isPlayingRef = useRef<boolean>(isPlaying)
  const isGameOverRef = useRef<boolean>(isGameOver)
  const obstaclesRef = useRef<Obstacle[]>([])
  const coinsRef = useRef<Coin[]>([])
  const speedRef = useRef<number>(speed)
  const distanceRef = useRef<number>(0)
  const scoreRef = useRef<number>(0)
  const coinsCountRef = useRef<number>(0)
  const nextObstacleDistanceRef = useRef<number>(60)

  useEffect(() => {
    runnerYRef.current = runnerY
  }, [runnerY])

  useEffect(() => {
    velocityYRef.current = velocityY
  }, [velocityY])

  useEffect(() => {
    isJumpingRef.current = isJumping
  }, [isJumping])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    isGameOverRef.current = isGameOver
  }, [isGameOver])

  useEffect(() => {
    obstaclesRef.current = obstacles
  }, [obstacles])

  useEffect(() => {
    coinsRef.current = coins
  }, [coins])

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    distanceRef.current = distance
  }, [distance])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    coinsCountRef.current = coinsCount
  }, [coinsCount])

  useEffect(() => {
    if (childId) {
      fetchChildById(childId).then((c) => {
        if (c) setChild(c)
      })
    }
  }, [childId])

  // Jump action
  const jump = useCallback(() => {
    if (!isPlayingRef.current) return
    if (runnerYRef.current <= 2) {
      velocityYRef.current = JUMP_FORCE
      setVelocityY(JUMP_FORCE)
      setIsJumping(true)
      playSound('pop')
    }
  }, [playSound])

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault()
        if (!isPlayingRef.current && !isGameOverRef.current) {
          startGame()
        } else {
          jump()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [jump])

  const startGame = () => {
    setIsPlaying(true)
    setIsGameOver(false)
    setScore(0)
    setDistance(0)
    setCoinsCount(0)
    setSpeed(1.2)
    setRunnerY(0)
    setVelocityY(0)
    setIsJumping(false)
    setObstacles([])
    setCoins([])

    runnerYRef.current = 0
    velocityYRef.current = 0
    isJumpingRef.current = false
    obstaclesRef.current = []
    coinsRef.current = []
    speedRef.current = 1.2
    distanceRef.current = 0
    scoreRef.current = 0
    coinsCountRef.current = 0
    nextObstacleDistanceRef.current = 70

    playSound('pop')
  }

  // Main 60fps game loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return

    let animId: number
    let lastTime = performance.now()

    const loop = (currentTime: number) => {
      const delta = Math.min(32, currentTime - lastTime)
      lastTime = currentTime

      // 1. Update Physics
      let newY = runnerYRef.current - velocityYRef.current
      let newVel = velocityYRef.current + GRAVITY

      if (newY <= GROUND_Y) {
        newY = GROUND_Y
        newVel = 0
        if (isJumpingRef.current) {
          setIsJumping(false)
        }
      }

      runnerYRef.current = newY
      velocityYRef.current = newVel
      setRunnerY(newY)

      // 2. Increase distance & speed gradually
      const curSpeed = speedRef.current
      const newDist = distanceRef.current + curSpeed * 0.4
      distanceRef.current = newDist
      setDistance(Math.floor(newDist))

      const newSpeed = Math.min(2.8, 1.2 + newDist * 0.0018)
      speedRef.current = newSpeed
      setSpeed(newSpeed)

      // 3. Move Obstacles
      const OBSTACLE_ICONS = [
        { emoji: '🪨', label: 'Pedra' },
        { emoji: '🪵', label: 'Tronco' },
        { emoji: '🌵', label: 'Cacto' },
        { emoji: '📦', label: 'Caixa' },
      ]

      let currentObs = obstaclesRef.current
        .map((obs) => ({
          ...obs,
          x: obs.x - curSpeed * 0.7,
        }))
        .filter((obs) => obs.x > -15)

      // Spawn next obstacle
      if (newDist >= nextObstacleDistanceRef.current) {
        const randIcon = OBSTACLE_ICONS[Math.floor(Math.random() * OBSTACLE_ICONS.length)]
        currentObs.push({
          id: Date.now() + Math.random(),
          x: 105,
          emoji: randIcon.emoji,
          label: randIcon.label,
        })
        obstaclesRef.current = currentObs
        setObstacles(currentObs)

        // Also occasionally spawn a floating coin above or after the obstacle
        const newCoins = [...coinsRef.current]
        newCoins.push({
          id: Date.now() + Math.random(),
          x: 105,
          y: Math.random() > 0.5 ? 45 : 15,
          collected: false,
        })
        coinsRef.current = newCoins
        setCoins(newCoins)

        nextObstacleDistanceRef.current = newDist + 50 + Math.random() * 40
      } else {
        obstaclesRef.current = currentObs
        setObstacles(currentObs)
      }

      // 4. Move Coins
      let currentCoins = coinsRef.current
        .map((c) => ({
          ...c,
          x: c.x - curSpeed * 0.7,
        }))
        .filter((c) => c.x > -15)

      // 5. Check Collisions: Runner is fixed at x ~ 20%
      const RUNNER_X = 20
      const RUNNER_WIDTH = 12

      // Coin pickup
      for (const coin of currentCoins) {
        if (!coin.collected && Math.abs(coin.x - RUNNER_X) < 10) {
          // Check height
          if (Math.abs(coin.y - newY) < 30) {
            coin.collected = true
            coinsCountRef.current += 1
            setCoinsCount((c) => c + 1)
            scoreRef.current += 15
            setScore((s) => s + 15)
            playSound('correct')
          }
        }
      }
      coinsRef.current = currentCoins.filter((c) => !c.collected)
      setCoins(coinsRef.current)

      // Obstacle collision
      for (const obs of currentObs) {
        if (Math.abs(obs.x - RUNNER_X) < 8) {
          // If runner is not jumping high enough (e.g. y < 28), it's a hit!
          if (newY < 25) {
            handleHit()
            return
          }
        }
      }

      // Check stage target: reaching 250 meters completes the round
      if (newDist >= 250) {
        finishMatch(scoreRef.current + 50, coinsCountRef.current, Math.floor(newDist))
        return
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, isGameOver, playSound])

  const handleHit = () => {
    setIsPlaying(false)
    setIsGameOver(true)
    playSound('error')

    // If ran at least 60m, award session
    if (distanceRef.current >= 60) {
      setTimeout(() => {
        finishMatch(scoreRef.current, coinsCountRef.current, Math.floor(distanceRef.current))
      }, 700)
    }
  }

  const finishMatch = (finalScore: number, finalCoins: number, finalDist: number) => {
    setIsPlaying(false)
    setIsGameOver(false)
    setIsCompleted(true)
    playSound('fanfare')

    const stars = finalDist >= 200 ? 3 : finalDist >= 100 ? 2 : 1
    const accuracy = Math.min(100, Math.round((finalDist / 250) * 100))

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
      module_id: 'junior_runner',
      game_id: 'junior_runner',
      game_title: 'TicoRunner',
      stars,
      score: finalScore,
      accuracy,
      rounds_completed: 1,
      total_rounds: 1,
      language: sessionChild.primary_language || 'pt-BR',
      details: {
        distance: finalDist,
        coinsCollected: finalCoins,
        arcade: true,
        isJunior: true,
      },
    })
  }

  if (isCompleted) {
    const stars = distance >= 200 ? 3 : distance >= 100 ? 2 : 1
    const accuracy = Math.min(100, Math.round((distance / 250) * 100))

    return (
      <GameShell title="TicoRunner" onBack={() => navigate('/junior')}>
        <CelebrationScreen
          title="Corrida Épica! 🏃⚡"
          subtitle={`Distância percorrida: ${distance} metros com ${coinsCount} moedas coletadas!`}
          childName={child?.name || 'Arthur'}
          childId={child?.id}
          score={score}
          accuracy={accuracy}
          stars={stars}
          roundsCompleted={1}
          totalRounds={1}
          practicedWords={[
            `Distância: ${distance}m`,
            `Moedas bônus: ${coinsCount}`,
            `Velocidade máxima: ${speed.toFixed(1)}x`,
          ]}
          onPlayAgain={() => {
            setIsCompleted(false)
            startGame()
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
      title="TicoRunner"
      score={score}
      stars={3}
      currentRound={1}
      totalRounds={1}
      onBack={() => navigate('/junior')}
    >
      <div className="max-w-md w-full mx-auto flex flex-col items-center gap-3">
        {/* Top Info Bar */}
        <div className="w-full flex items-center justify-between bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-sky-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Distância:</span>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-black text-xs">
              {distance}m / 250m
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs font-extrabold text-slate-700">
            <span className="flex items-center gap-1 text-amber-600">
              <Coins className="w-3.5 h-3.5 fill-current" />
              <strong>{coinsCount}</strong>
            </span>
            <span>
              Pts: <strong className="text-indigo-600">{score}</strong>
            </span>
          </div>
        </div>

        {/* Runner Track Stage */}
        <div
          onClick={jump}
          onTouchStart={(e) => {
            e.preventDefault()
            jump()
          }}
          className="relative w-full aspect-[16/9] max-w-[340px] sm:max-w-[400px] bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 rounded-3xl border-4 border-sky-500/60 shadow-xl overflow-hidden cursor-pointer select-none"
        >
          {/* Parallax Clouds */}
          <div className="absolute top-3 left-4 text-2xl opacity-70 animate-pulse pointer-events-none">
            ☁️
          </div>
          <div className="absolute top-6 right-10 text-xl opacity-60 pointer-events-none">☁️</div>

          {/* Distant Hills */}
          <div className="absolute bottom-8 inset-x-0 h-10 bg-emerald-400/30 rounded-t-[50%] pointer-events-none" />

          {/* Ground Floor */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-r from-amber-700 to-amber-800 border-t-4 border-emerald-500 pointer-events-none flex items-center justify-around">
            <div className="w-full h-1 bg-amber-600/50" />
          </div>

          {/* Runner Mascot (Tico) */}
          <div
            className="absolute transition-transform duration-75 text-3xl sm:text-4xl pointer-events-none"
            style={{
              left: '20%',
              bottom: `${10 + runnerY * 0.7}%`,
              transform: `scaleX(1) rotate(${isJumping ? -15 : 0}deg)`,
            }}
          >
            🦜
          </div>

          {/* Obstacles */}
          {obstacles.map((obs) => (
            <div
              key={obs.id}
              className="absolute text-2xl sm:text-3xl pointer-events-none drop-shadow-md"
              style={{
                left: `${obs.x}%`,
                bottom: '10%',
              }}
            >
              {obs.emoji}
            </div>
          ))}

          {/* Coins */}
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="absolute text-xl sm:text-2xl animate-bounce pointer-events-none drop-shadow-sm"
              style={{
                left: `${coin.x}%`,
                bottom: `${10 + coin.y * 0.7}%`,
              }}
            >
              🪙
            </div>
          ))}

          {/* Overlay when game over or not started */}
          {(!isPlaying || isGameOver) && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
              <span className="text-4xl animate-bounce">🏃💨</span>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  {isGameOver ? 'Ops! Tropeçou!' : 'TicoRunner Junior'}
                </h3>
                <p className="text-xs text-sky-200 max-w-xs">
                  {isGameOver
                    ? `Você correu ${distance} metros e coletou ${coinsCount} moedas!`
                    : 'Pule os obstáculos e colete moedas tocando na tela ou com a barra de espaço!'}
                </p>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  startGame()
                }}
                size="lg"
                className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black shadow-lg"
              >
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                <span>{isGameOver ? 'Correr de Novo' : 'Começar Corrida'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Big Jump Button for Mobile */}
        <div className="w-full flex items-center gap-2">
          <Button
            size="lg"
            onClick={jump}
            className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-base shadow-lg h-14 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowUp className="w-5 h-5 stroke-[3]" />
            <span>PULAR! (TOQUE NA TELA)</span>
          </Button>
        </div>
      </div>
    </GameShell>
  )
}
