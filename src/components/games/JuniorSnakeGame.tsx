import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GameShell } from '@/components/layout/GameShell'
import { CelebrationScreen } from '@/components/celebration/CelebrationScreen'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSound } from '@/context/SoundContext'
import { offlineSyncService } from '@/lib/offlineSync'
import { fetchChildById } from '@/services/children'
import type { Child } from '@/types/cognikids'
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
} from 'lucide-react'

interface JuniorSnakeGameProps {
  child?: Child | null
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }

interface WordItem {
  word: string
  emoji: string
  points: number
  color: string
}

const VOCAB_WORDS: WordItem[] = [
  { word: 'MAÇÃ', emoji: '🍎', points: 10, color: '#EF4444' },
  { word: 'ESTRELA', emoji: '⭐', points: 15, color: '#F59E0B' },
  { word: 'LIVRO', emoji: '📚', points: 15, color: '#3B82F6' },
  { word: 'PLANETA', emoji: '🪐', points: 20, color: '#8B5CF6' },
  { word: 'CORAÇÃO', emoji: '💖', points: 15, color: '#EC4899' },
  { word: 'FOGUETE', emoji: '🚀', points: 25, color: '#F97316' },
  { word: 'DIAMANTE', emoji: '💎', points: 30, color: '#06B6D4' },
  { word: 'TROFÉU', emoji: '🏆', points: 35, color: '#EAB308' },
]

const GRID_SIZE = 16 // 16x16 grid
const INITIAL_SPEED = 200 // ms per tick
const MIN_SPEED = 90
const SPEED_DECREMENT = 8

export const JuniorSnakeGame: React.FC<JuniorSnakeGameProps> = ({ child: initialChild }) => {
  const { childId: routeChildId } = useParams<{ childId: string }>()
  const childId = initialChild?.id || routeChildId
  const navigate = useNavigate()
  const { playSound } = useSound()

  const [child, setChild] = useState<Child | null>(initialChild || null)
  const [snake, setSnake] = useState<Position[]>([
    { x: 8, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 },
  ])
  const [food, setFood] = useState<Position & { item: WordItem }>({
    x: 8,
    y: 4,
    item: VOCAB_WORDS[0],
  })
  const [direction, setDirection] = useState<Direction>('UP')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [wordsCollected, setWordsCollected] = useState<WordItem[]>([])
  const [currentRound, setCurrentRound] = useState<number>(1)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  // Use refs for loop state to avoid race conditions during tick
  const dirRef = useRef<Direction>('UP')
  const snakeRef = useRef<Position[]>(snake)
  const isPlayingRef = useRef<boolean>(isPlaying)
  const isGameOverRef = useRef<boolean>(isGameOver)
  const foodRef = useRef(food)
  const wordsCollectedRef = useRef<WordItem[]>([])

  // Touch swipe handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    dirRef.current = direction
  }, [direction])

  useEffect(() => {
    snakeRef.current = snake
  }, [snake])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    isGameOverRef.current = isGameOver
  }, [isGameOver])

  useEffect(() => {
    foodRef.current = food
  }, [food])

  useEffect(() => {
    wordsCollectedRef.current = wordsCollected
  }, [wordsCollected])

  useEffect(() => {
    if (childId) {
      fetchChildById(childId).then((c) => {
        if (c) setChild(c)
      })
    }
  }, [childId])

  // Spawns new food not overlapping the snake
  const spawnFood = useCallback((currentSnake: Position[]): Position & { item: WordItem } => {
    let newX = 0
    let newY = 0
    let collision = true

    while (collision) {
      newX = Math.floor(Math.random() * GRID_SIZE)
      newY = Math.floor(Math.random() * GRID_SIZE)
      // Check collision with snake
      // eslint-disable-next-line no-loop-func
      collision = currentSnake.some((seg) => seg.x === newX && seg.y === newY)
    }

    const randomWord = VOCAB_WORDS[Math.floor(Math.random() * VOCAB_WORDS.length)]
    return { x: newX, y: newY, item: randomWord }
  }, [])

  // Change direction safely (no 180-deg reversal)
  const changeDirection = useCallback((newDir: Direction) => {
    const cur = dirRef.current
    if (
      (newDir === 'UP' && cur === 'DOWN') ||
      (newDir === 'DOWN' && cur === 'UP') ||
      (newDir === 'LEFT' && cur === 'RIGHT') ||
      (newDir === 'RIGHT' && cur === 'LEFT')
    ) {
      return
    }
    setDirection(newDir)
    dirRef.current = newDir
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault()
        changeDirection('UP')
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault()
        changeDirection('DOWN')
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault()
        changeDirection('LEFT')
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault()
        changeDirection('RIGHT')
      } else if (e.code === 'Space' && !isPlayingRef.current && !isGameOverRef.current) {
        e.preventDefault()
        startGame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changeDirection])

  // Game loop tick
  const moveSnake = useCallback(() => {
    if (!isPlayingRef.current || isGameOverRef.current) return

    const currentSnake = [...snakeRef.current]
    const head = { ...currentSnake[0] }
    const currentDir = dirRef.current

    switch (currentDir) {
      case 'UP':
        head.y -= 1
        break
      case 'DOWN':
        head.y += 1
        break
      case 'LEFT':
        head.x -= 1
        break
      case 'RIGHT':
        head.x += 1
        break
    }

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      handleGameOver()
      return
    }

    // Check self collision (ignoring tail that will move away)
    for (let i = 0; i < currentSnake.length - 1; i++) {
      if (currentSnake[i].x === head.x && currentSnake[i].y === head.y) {
        handleGameOver()
        return
      }
    }

    // Check food consumption
    const curFood = foodRef.current
    const ateFood = head.x === curFood.x && head.y === curFood.y

    const newSnake = [head, ...currentSnake]
    if (!ateFood) {
      newSnake.pop()
    } else {
      // Points and effects
      playSound('correct')
      const pts = curFood.item.points
      setScore((s) => s + pts)
      const updatedWords = [...wordsCollectedRef.current, curFood.item]
      setWordsCollected(updatedWords)

      // Spawn next food
      const nextFood = spawnFood(newSnake)
      setFood(nextFood)
      foodRef.current = nextFood

      // If collected 5 words in current round, complete round or whole match!
      if (updatedWords.length >= currentRound * 5) {
        if (currentRound >= 3) {
          finishMatch(score + pts, updatedWords)
          return
        } else {
          setCurrentRound((r) => r + 1)
          playSound('fanfare')
        }
      }
    }

    setSnake(newSnake)
  }, [spawnFood, playSound, currentRound, score])

  // Dynamic game speed interval
  const currentSpeed = Math.max(
    MIN_SPEED,
    INITIAL_SPEED - wordsCollected.length * SPEED_DECREMENT - (currentRound - 1) * 20,
  )

  useEffect(() => {
    if (!isPlaying || isGameOver) return
    const interval = setInterval(moveSnake, currentSpeed)
    return () => clearInterval(interval)
  }, [isPlaying, isGameOver, currentSpeed, moveSnake])

  const startGame = () => {
    setSnake([
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
    ])
    setDirection('UP')
    dirRef.current = 'UP'
    setIsGameOver(false)
    setIsPlaying(true)
    const initialFood = spawnFood([
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
    ])
    setFood(initialFood)
    foodRef.current = initialFood
    playSound('pop')
  }

  const handleGameOver = () => {
    setIsPlaying(false)
    setIsGameOver(true)
    playSound('error')

    // If collected at least 2 words, treat as valid finish
    if (wordsCollectedRef.current.length >= 2) {
      setTimeout(() => {
        finishMatch(score, wordsCollectedRef.current)
      }, 700)
    }
  }

  const finishMatch = (finalScore: number, finalWords: WordItem[]) => {
    setIsPlaying(false)
    setIsGameOver(false)
    setIsCompleted(true)
    playSound('fanfare')

    const stars = finalWords.length >= 8 ? 3 : finalWords.length >= 4 ? 2 : 1
    const accuracy = Math.min(100, Math.max(50, finalWords.length * 10))

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
      module_id: 'junior_snake',
      game_id: 'junior_snake',
      game_title: 'Snake do Tico',
      stars,
      score: finalScore,
      accuracy,
      rounds_completed: Math.min(3, Math.max(1, currentRound)),
      total_rounds: 3,
      language: sessionChild.primary_language || 'pt-BR',
      details: {
        wordsCollected: finalWords.map((w) => w.word),
        count: finalWords.length,
        arcade: true,
        isJunior: true,
      },
    })
  }

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (Math.max(absX, absY) > 25) {
      if (absX > absY) {
        changeDirection(deltaX > 0 ? 'RIGHT' : 'LEFT')
      } else {
        changeDirection(deltaY > 0 ? 'DOWN' : 'UP')
      }
    }
    touchStartRef.current = null
  }

  if (isCompleted) {
    const stars = wordsCollected.length >= 8 ? 3 : wordsCollected.length >= 4 ? 2 : 1
    const accuracy = Math.min(100, Math.max(50, wordsCollected.length * 10))

    return (
      <GameShell title="Snake do Tico" onBack={() => navigate('/junior')}>
        <CelebrationScreen
          title="Snake Concluído! 🐍🎉"
          subtitle="Módulo CogniKids Junior: Reflexo Ágil e Vocabulário"
          childName={child?.name || 'Arthur'}
          childId={child?.id}
          score={score}
          accuracy={accuracy}
          stars={stars}
          roundsCompleted={currentRound}
          totalRounds={3}
          practicedWords={wordsCollected.map((w) => ({
            word: `${w.emoji} ${w.word}`,
            score: 100,
            isRecognized: true,
          }))}
          onPlayAgain={() => {
            setIsCompleted(false)
            setScore(0)
            setWordsCollected([])
            setCurrentRound(1)
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
      title="Snake do Tico"
      score={score}
      stars={3}
      currentRound={currentRound}
      totalRounds={3}
      onBack={() => navigate('/junior')}
    >
      <div className="max-w-md w-full mx-auto flex flex-col items-center gap-3">
        {/* Top Info Bar */}
        <div className="w-full flex items-center justify-between bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-indigo-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Alvo:</span>
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-black text-xs flex items-center gap-1">
              <span>{food.item.emoji}</span>
              <span>{food.item.word}</span>
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs font-extrabold text-slate-700">
            <span>
              Itens: <strong className="text-indigo-600">{wordsCollected.length}</strong>
            </span>
            <span>
              Pts: <strong className="text-amber-600">{score}</strong>
            </span>
          </div>
        </div>

        {/* Snake Grid Board with Touch Swipe */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] bg-slate-900 rounded-3xl border-4 border-indigo-500/50 p-2 shadow-xl overflow-hidden flex items-center justify-center select-none"
        >
          {/* Subtle Grid Lines */}
          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
              const x = idx % GRID_SIZE
              const y = Math.floor(idx / GRID_SIZE)

              const isHead = snake[0].x === x && snake[0].y === y
              const isBody = !isHead && snake.some((s) => s.x === x && s.y === y)
              const isFoodCell = food.x === x && food.y === y

              return (
                <div
                  key={idx}
                  className="relative flex items-center justify-center border border-indigo-950/20"
                >
                  {isHead && (
                    <div className="w-full h-full rounded-md bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-sm shadow-amber-400/50 flex items-center justify-center text-[11px] font-black z-10 animate-pulse">
                      👀
                    </div>
                  )}
                  {isBody && (
                    <div className="w-4/5 h-4/5 rounded-sm bg-gradient-to-tr from-emerald-400 to-teal-300 shadow-2xs" />
                  )}
                  {isFoodCell && (
                    <div className="w-full h-full flex items-center justify-center text-sm sm:text-base animate-bounce drop-shadow-md">
                      {food.item.emoji}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Start / Game Over Overlay */}
          {(!isPlaying || isGameOver) && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
              <span className="text-4xl animate-bounce">🐍</span>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  {isGameOver ? 'Fim de Jogo!' : 'Snake do Tico Junior'}
                </h3>
                <p className="text-xs text-indigo-200 max-w-xs">
                  {isGameOver
                    ? `Você coletou ${wordsCollected.length} itens e fez ${score} pontos!`
                    : 'Colete frutas e palavras para fazer a cobra crescer sem bater nas paredes!'}
                </p>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black shadow-lg"
              >
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                <span>{isGameOver ? 'Tentar Novamente' : 'Começar Partida'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* On-Screen D-Pad Controls for Mobile & Accessibility */}
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => changeDirection('UP')}
            className="w-12 h-11 rounded-2xl bg-white shadow-md border-slate-300 hover:bg-indigo-50 active:scale-95 text-slate-700"
            aria-label="Cima"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => changeDirection('LEFT')}
              className="w-12 h-11 rounded-2xl bg-white shadow-md border-slate-300 hover:bg-indigo-50 active:scale-95 text-slate-700"
              aria-label="Esquerda"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center text-[10px] font-bold text-slate-500">
              🎮
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => changeDirection('RIGHT')}
              className="w-12 h-11 rounded-2xl bg-white shadow-md border-slate-300 hover:bg-indigo-50 active:scale-95 text-slate-700"
              aria-label="Direita"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => changeDirection('DOWN')}
            className="w-12 h-11 rounded-2xl bg-white shadow-md border-slate-300 hover:bg-indigo-50 active:scale-95 text-slate-700"
            aria-label="Baixo"
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </GameShell>
  )
}
