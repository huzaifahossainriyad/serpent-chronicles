'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAISnake } from './hooks/useAISnake'
import { useCombo } from './hooks/useCombo'
import { useTailPhysics } from './hooks/useTailPhysics'

const GRID_SIZE = 30
const CELL_SIZE = 20
const GAME_WIDTH = GRID_SIZE * CELL_SIZE
const GAME_HEIGHT = GRID_SIZE * CELL_SIZE

interface LogEntry {
  timestamp: string
  event: string
  details: string
}

interface DifficultySettings {
  speed: number
  label: string
  color: string
}

const DIFFICULTY_SETTINGS: Record<string, DifficultySettings> = {
  EASY: { speed: 150, label: 'সহজ', color: 'from-green-500 to-green-600' },
  MEDIUM: { speed: 100, label: 'মাঝারি', color: 'from-yellow-500 to-yellow-600' },
  HARD: { speed: 50, label: 'কঠিন', color: 'from-red-500 to-red-600' },
}

const GAME_OVER_MESSAGES: Record<string, string[]> = {
  veryBad: [
    '😭 আরে! এত তাড়াতাড়ি মরে গেলে? সাপ খেলতে শিখো প্রথমে!',
    '💀 ওহ নো! এটা খুবই খারাপ ছিল। আবার চেষ্টা করো!',
    '😤 এই স্কোর দিয়ে? আরও ভালো করতে পারো!',
    '🤦 এটা একটা রেকর্ড... সবচেয়ে খারাপ রেকর্ড!',
    '😅 হাহা, এটা মজার ছিল না। আবার খেলো!',
  ],
  bad: [
    '😕 ভালো নয়, কিন্তু হতাশ হবেন না!',
    '📉 স্কোর একটু কম হয়েছে। আরও চেষ্টা করো!',
    '🙁 এটা ভালো ছিল না। পরবর্তী রাউন্ডে ভালো করবে!',
    '😐 মধ্যম পারফরম্যান্স। আরও ফোকাস করো!',
    '⚠️ এই স্কোর উন্নত করা যায়!',
  ],
  okay: [
    '😊 ঠিক আছে! আরও ভালো করতে পারো!',
    '👍 মোটামুটি ভালো খেলা!',
    '🎮 গড় পারফরম্যান্স। চলতে থাকো!',
    '💪 ভালো চেষ্টা! পরবর্তীতে আরও ভালো হবে!',
    '🌟 মোটামুটি ভালো খেলেছো!',
  ],
  good: [
    '🎉 দুর্দান্ত! খুবই ভালো খেলা!',
    '⭐ চমৎকার পারফরম্যান্স!',
    '🔥 এটা খুবই ভালো ছিল!',
    '🏅 দুর্দান্ত খেলা! তুমি দক্ষ!',
    '💯 অসাধারণ! এটা খুবই ভালো!',
  ],
  excellent: [
    '🔥 অবিশ্বাস্য! তুমি একজন সাপ গেম চ্যাম্পিয়ন!',
    '👑 রাজকীয় পারফরম্যান্স! তুমি সেরা!',
    '🌟 এটা অসাধারণ ছিল! তুমি প্রতিভাবান!',
    '🚀 মহাকাশীয় স্কোর! তুমি অপ্রতিরোধ্য!',
    '💎 হীরার মতো খেলা! তুমি সেরা!',
    '🏆 চ্যাম্পিয়ন! এটা একটি মাস্টারপিস ছিল!',
  ],
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const lastMoveTimeRef = useRef(0)

  // Game state
  const [snake, setSnake] = useState([
    { x: 15, y: 15 },
    { x: 14, y: 15 },
    { x: 13, y: 15 },
  ])
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [nextDirection, setNextDirection] = useState({ x: 1, y: 0 })
  const [food, setFood] = useState({ x: 20, y: 20 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [gamePaused, setGamePaused] = useState(false)
  const [difficulty, setDifficulty] = useState<string>('MEDIUM')
  const [gameOverMessage, setGameOverMessage] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showLogs, setShowLogs] = useState(false)

  // Hooks
  const { aiSnake, updateAISnake, stunAISnake, checkFoodCollision: aiCheckFood, checkPlayerCollision, growAISnake } = useAISnake(GRID_SIZE, CELL_SIZE)
  const { combo, registerFoodEaten, getComboBonus, reset: resetCombo } = useCombo()
  const { updateTailPhysics, getTailSegments } = useTailPhysics()

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('riyad_snakeHighScore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Add log entry
  const addLog = useCallback((event: string, details: string) => {
    const now = new Date()
    const banglaTime = now.toLocaleString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setLogs((prev) => [
      ...prev,
      {
        timestamp: banglaTime,
        event,
        details,
      },
    ])
  }, [])

  // Generate random food
  const generateFood = useCallback(() => {
    let newFood
    let isValid = false

    while (!isValid) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }

      isValid =
        !snake.some((s) => s.x === newFood.x && s.y === newFood.y) &&
        !aiSnake.body.some((s) => s.x === newFood.x && s.y === newFood.y)
    }

    return newFood
  }, [snake, aiSnake.body])

  // Start game
  const startGame = useCallback(() => {
    setGameActive(true)
    setGamePaused(false)
    setScore(0)
    setSnake([
      { x: 15, y: 15 },
      { x: 14, y: 15 },
      { x: 13, y: 15 },
    ])
    setDirection({ x: 1, y: 0 })
    setNextDirection({ x: 1, y: 0 })
    setFood(generateFood())
    setGameOverMessage('')
    resetCombo()
    setLogs([])

    addLog('🎮 গেম শুরু', `ডিফিকাল্টি: ${DIFFICULTY_SETTINGS[difficulty].label}`)
  }, [difficulty, generateFood, addLog, resetCombo])

  // End game
  const endGame = useCallback(
    (reason: string) => {
      setGameActive(false)

      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('riyad_snakeHighScore', score.toString())
        addLog('🏆 নতুন রেকর্ড', `নতুন হাই স্কোর: ${score}`)
      }

      let messageCategory = 'veryBad'
      if (score >= 200) messageCategory = 'excellent'
      else if (score >= 100) messageCategory = 'good'
      else if (score >= 50) messageCategory = 'okay'
      else if (score >= 20) messageCategory = 'bad'

      const messages = GAME_OVER_MESSAGES[messageCategory]
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setGameOverMessage(randomMessage)

      addLog('🎮 গেম শেষ', `চূড়ান্ত স্কোর: ${score} | কারণ: ${reason}`)
    },
    [score, highScore, addLog]
  )

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameActive) return

      const key = e.key.toLowerCase()

      if (key === ' ') {
        e.preventDefault()
        setGamePaused((prev) => !prev)
        return
      }

      const keyMap: Record<string, { x: number; y: number }> = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 },
      }

      if (keyMap[key]) {
        e.preventDefault()
        const newDir = keyMap[key]
        if (newDir.x !== -direction.x || newDir.y !== -direction.y) {
          setNextDirection(newDir)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameActive, direction])

  // Main game loop
  useEffect(() => {
    if (!gameActive || gamePaused) return

    const gameLoop = () => {
      const currentTime = Date.now()
      const speed = DIFFICULTY_SETTINGS[difficulty].speed

      if (currentTime - lastMoveTimeRef.current < speed) {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      lastMoveTimeRef.current = currentTime

      setSnake((prevSnake) => {
        const newDirection = nextDirection
        const head = prevSnake[0]
        const newHead = {
          x: (head.x + newDirection.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + newDirection.y + GRID_SIZE) % GRID_SIZE,
        }

        // Check self collision
        if (prevSnake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          endGame('নিজের সাথে সংঘর্ষ')
          return prevSnake
        }

        // Check AI collision
        if (aiSnake.body.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          endGame('AI সাপের সাথে সংঘর্ষ')
          return prevSnake
        }

        let newSnake = [newHead, ...prevSnake]
        setDirection(newDirection)

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          registerFoodEaten()
          const bonusPoints = getComboBonus(10)
          setScore((prev) => prev + bonusPoints)
          addLog('🍎 খাবার খাওয়া', `পয়েন্ট: +${bonusPoints} (Combo: ${combo.count}x)`)
          setFood(generateFood())
        } else {
          newSnake = newSnake.slice(0, -1)
        }

        return newSnake
      })

      // Update AI snake
      updateAISnake(currentTime, food, snake)

      // Check if AI ate food
      if (aiCheckFood(food)) {
        growAISnake()
        setFood(generateFood())
        addLog('🤖 AI খাবার খাওয়া', 'AI সাপ খাবার খেয়েছে')
      }

      // Check if player hit AI tail (stun mechanic)
      if (snake.length > 0 && aiSnake.body.length > 1) {
        const playerHead = snake[0]
        const aiTail = aiSnake.body[aiSnake.body.length - 1]
        if (playerHead.x === aiTail.x && playerHead.y === aiTail.y) {
          stunAISnake(2000)
          addLog('⚡ স্টান', 'AI সাপ স্টান হয়েছে!')
        }
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameActive, gamePaused, difficulty, nextDirection, food, snake, aiSnake, endGame, updateAISnake, aiCheckFood, stunAISnake, growAISnake, registerFoodEaten, getComboBonus, combo.count, addLog, generateFood])

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GAME_HEIGHT)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GAME_WIDTH, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw player snake
    snake.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE
      const y = segment.y * CELL_SIZE

      if (index === 0) {
        // Head
        ctx.fillStyle = '#22c55e'
        ctx.shadowColor = '#22c55e'
        ctx.shadowBlur = 10
        ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4)
        ctx.shadowBlur = 0

        // Eyes
        ctx.fillStyle = '#000'
        ctx.fillRect(x + 5, y + 5, 3, 3)
        ctx.fillRect(x + CELL_SIZE - 8, y + 5, 3, 3)
      } else {
        // Body
        const opacity = 1 - index / snake.length * 0.5
        ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`
        ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2)
      }
    })

    // Draw AI snake
    aiSnake.body.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE
      const y = segment.y * CELL_SIZE

      if (index === 0) {
        // Head
        ctx.fillStyle = aiSnake.isStunned ? '#fbbf24' : '#3b82f6'
        ctx.shadowColor = aiSnake.isStunned ? '#fbbf24' : '#3b82f6'
        ctx.shadowBlur = 10
        ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4)
        ctx.shadowBlur = 0
      } else {
        // Body
        const opacity = 1 - index / aiSnake.body.length * 0.5
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`
        ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2)
      }
    })

    // Draw food
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2
    ctx.fillStyle = '#ef4444'
    ctx.shadowColor = '#ef4444'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(foodX, foodY, CELL_SIZE / 2 - 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }, [snake, food, aiSnake])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">🐍 রিয়াদ সাপ গেম</h1>
          <p className="text-gray-400">Riyad's Snake Game - বাংলা ভার্সন</p>
        </div>

        {/* Difficulty Selection */}
        {!gameActive && (
          <div className="mb-8">
            <h2 className="text-center text-xl font-bold text-cyan-300 mb-4">📊 ডিফিকাল্টি লেভেল বেছে নিন</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`p-4 rounded-lg font-bold transition-all ${
                    difficulty === key
                      ? `bg-gradient-to-br ${settings.color} text-white scale-105`
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-lg">{settings.label}</div>
                  <div className="text-xs mt-2 opacity-75">
                    {key === 'EASY' && 'শিক্ষানবিসদের জন্য'}
                    {key === 'MEDIUM' && 'সাধারণ খেলোয়াড়দের জন্য'}
                    {key === 'HARD' && 'অভিজ্ঞদের জন্য'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game Canvas */}
        <div className="flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="border-4 border-cyan-500 rounded-lg shadow-2xl"
          />
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700 p-4 rounded-lg text-center">
            <div className="text-gray-400 text-sm">বর্তমান স্কোর</div>
            <div className="text-3xl font-bold text-green-400">{score}</div>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg text-center">
            <div className="text-gray-400 text-sm">Combo</div>
            <div className="text-3xl font-bold text-yellow-400">{combo.count > 0 ? `${combo.count}x` : '-'}</div>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg text-center">
            <div className="text-gray-400 text-sm">হাই স্কোর</div>
            <div className="text-3xl font-bold text-cyan-400">{highScore}</div>
          </div>
        </div>

        {/* Game Over Message */}
        {gameOverMessage && (
          <div className="bg-red-900 border-2 border-red-500 p-4 rounded-lg mb-6 text-center">
            <p className="text-white text-lg font-bold">{gameOverMessage}</p>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={startGame}
            disabled={gameActive}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            🎮 {gameActive ? 'চলছে' : 'শুরু করো'}
          </button>
          <button
            onClick={() => setGamePaused(!gamePaused)}
            disabled={!gameActive}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            {gamePaused ? '▶️ চালু করো' : '⏸️ থামাও'}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            📋 লগ ({logs.length})
          </button>
        </div>

        {/* Logs Panel */}
        {showLogs && (
          <div className="bg-slate-700 p-4 rounded-lg mb-6 max-h-64 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 font-bold">📋 গেম লগ</h3>
              <button
                onClick={() => {
                  const logText = logs.map((l) => `[${l.timestamp}] ${l.event}: ${l.details}`).join('\n')
                  const element = document.createElement('a')
                  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logText))
                  element.setAttribute('download', 'snake-game-logs.txt')
                  element.style.display = 'none'
                  document.body.appendChild(element)
                  element.click()
                  document.body.removeChild(element)
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                ⬇️ ডাউনলোড
              </button>
            </div>
            <div className="space-y-2">
              {logs.map((log, idx) => (
                <div key={idx} className="text-xs text-gray-300 border-l-2 border-cyan-500 pl-2">
                  <span className="text-cyan-400">[{log.timestamp}]</span> <span className="text-yellow-300">{log.event}</span>: {log.details}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-cyan-300 font-bold mb-3">📋 নিয়ন্ত্রণ:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
            <div>⬆️ উপরে: Arrow Up / W</div>
            <div>⬇️ নিচে: Arrow Down / S</div>
            <div>⬅️ বাম: Arrow Left / A</div>
            <div>➡️ ডান: Arrow Right / D</div>
            <div className="col-span-2">⏸️ পজ/রিজিউম: Space Bar</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-600">
            <h4 className="text-yellow-300 font-bold mb-2">💡 টিপস:</h4>
            <p className="text-gray-400 text-sm">
              খাবার (লাল বল) খান এবং সাপকে বড় করুন। নিজের সাথে সংঘর্ষ এড়ান! AI সাপের লেজ ছুঁলে সে স্টান হয়ে যায়। দ্রুত খাবার খেলে Combo বোনাস পাবেন!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
