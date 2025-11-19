'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAISnake } from './hooks/useAISnake'
import { useCombo } from './hooks/useCombo'
import { useTailPhysics } from './hooks/useTailPhysics'
import { useSoundEffects } from './hooks/useSoundEffects'
import SoundSettings from './components/SoundSettings'

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
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(0.5)

  // Hooks
  const { aiSnake, updateAISnake, stunAISnake, checkFoodCollision: aiCheckFood, checkPlayerCollision, growAISnake } = useAISnake(GRID_SIZE, CELL_SIZE)
  const { combo, registerFoodEaten, getComboBonus, reset: resetCombo } = useCombo()
  const { updateTailPhysics, getTailSegments } = useTailPhysics()
  const soundEffects = useSoundEffects({ enabled: soundEnabled, volume: soundVolume })

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('riyad_snakeHighScore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Add log entry
  const addLog = useCallback((event: string, details: string) => {
    const timestamp = new Date().toLocaleTimeString('bn-BD')
    setLogs((prev) => [
      ...prev,
      { timestamp, event, details },
    ].slice(-50))
  }, [])

  // Generate random food
  const generateFood = useCallback(() => {
    let newFood
    let valid = false
    while (!valid) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
      valid = !snake.some((s) => s.x === newFood.x && s.y === newFood.y) &&
              !aiSnake.some((s) => s.x === newFood.x && s.y === newFood.y)
    }
    return newFood
  }, [snake, aiSnake])

  // Handle game over
  const handleGameOver = useCallback(() => {
    setGameActive(false)
    soundEffects.playGameOver()
    
    const messageCategory = score < 10 ? 'veryBad' : score < 30 ? 'bad' : score < 50 ? 'okay' : score < 100 ? 'good' : 'excellent'
    const messages = GAME_OVER_MESSAGES[messageCategory]
    const message = messages[Math.floor(Math.random() * messages.length)]
    setGameOverMessage(message)

    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('riyad_snakeHighScore', score.toString())
      soundEffects.playVictory()
      addLog('🏆 নতুন হাই স্কোর', `${score} পয়েন্ট!`)
    }

    addLog('💀 গেম শেষ', `চূড়ান্ত স্কোর: ${score}`)
  }, [score, highScore, soundEffects, addLog])

  // Game loop
  useEffect(() => {
    if (!gameActive || gamePaused) return

    const gameLoop = setInterval(() => {
      const now = Date.now()
      const speed = DIFFICULTY_SETTINGS[difficulty].speed
      
      if (now - lastMoveTimeRef.current < speed) return
      lastMoveTimeRef.current = now

      setSnake((prevSnake) => {
        const head = prevSnake[0]
        const newHead = {
          x: head.x + nextDirection.x,
          y: head.y + nextDirection.y,
        }

        // Check boundaries
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleGameOver()
          return prevSnake
        }

        // Check self collision
        if (prevSnake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          soundEffects.playCollision()
          handleGameOver()
          return prevSnake
        }

        // Check AI collision
        if (checkPlayerCollision(newHead)) {
          soundEffects.playCollision()
          handleGameOver()
          return prevSnake
        }

        setDirection(nextDirection)
        let newSnake = [newHead, ...prevSnake]

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          soundEffects.playFoodEaten()
          registerFoodEaten()
          const bonus = getComboBonus()
          setScore((prev) => prev + 10 + bonus)
          setFood(generateFood())
          addLog('🍎 খাবার খাওয়া', `+${10 + bonus} পয়েন্ট (Combo: ${combo})`)
          
          if (bonus > 0) {
            soundEffects.playCombo(combo)
          }
        } else {
          newSnake = newSnake.slice(0, -1)
        }

        return newSnake
      })

      // Update AI snake
      updateAISnake(food)
    }, 16)

    return () => clearInterval(gameLoop)
  }, [gameActive, gamePaused, difficulty, nextDirection, food, soundEffects, handleGameOver, addLog, registerFoodEaten, getComboBonus, combo, checkPlayerCollision, updateAISnake, generateFood])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        if (gameActive) {
          setGamePaused((prev) => !prev)
          soundEffects.playMenuClick()
        }
      }

      const keyMap: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        d: { x: 1, y: 0 },
        D: { x: 1, y: 0 },
      }

      if (keyMap[e.key]) {
        e.preventDefault()
        const newDir = keyMap[e.key]
        if (direction.x + newDir.x !== 0 || direction.y + newDir.y !== 0) {
          setNextDirection(newDir)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameActive, soundEffects])

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
      ctx.fillStyle = index === 0 ? '#00ff00' : '#00cc00'
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    })

    // Draw AI snake
    aiSnake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#0099ff' : '#0077cc'
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    })

    // Draw food
    ctx.fillStyle = '#ff0000'
    ctx.beginPath()
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }, [snake, aiSnake, food])

  const startGame = (diff: string) => {
    setDifficulty(diff)
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
    soundEffects.playMenuClick()
    addLog('🎮 গেম শুরু', `ডিফিকাল্টি: ${DIFFICULTY_SETTINGS[diff].label}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2 drop-shadow-lg">
            রিয়াদ সাপ গেম
          </h1>
          <p className="text-cyan-300 text-sm md:text-base">
            Riyad's Snake Game - বাংলা ভার্সন
          </p>
        </div>

        {/* Sound Settings */}
        <div className="mb-6">
          <SoundSettings
            onSoundToggle={setSoundEnabled}
            onVolumeChange={setSoundVolume}
            initialEnabled={soundEnabled}
            initialVolume={soundVolume}
          />
        </div>

        {/* Game Canvas */}
        <div className="bg-slate-900 rounded-lg border-2 border-cyan-500 p-4 mb-6 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="w-full border border-cyan-400/30 rounded"
          />
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg border border-cyan-500/30">
            <p className="text-cyan-400 text-sm font-mono">বর্তমান স্কোর</p>
            <p className="text-3xl font-bold text-cyan-300">{score}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-cyan-500/30">
            <p className="text-cyan-400 text-sm font-mono">হাই স্কোর</p>
            <p className="text-3xl font-bold text-yellow-400">{highScore}</p>
          </div>
        </div>

        {/* Combo Display */}
        {combo > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg mb-6 text-center">
            <p className="text-white font-bold text-lg">🔥 Combo: {combo}x</p>
          </div>
        )}

        {/* Game Over Message */}
        {gameOverMessage && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg mb-6 text-center">
            <p className="text-red-200 text-lg">{gameOverMessage}</p>
          </div>
        )}

        {/* Controls */}
        {!gameActive ? (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
              <button
                key={key}
                onClick={() => startGame(key)}
                className={`bg-gradient-to-br ${settings.color} p-6 rounded-lg font-bold text-white hover:shadow-lg transition-all transform hover:scale-105`}
              >
                <p className="text-2xl mb-2">⚡</p>
                <p>{settings.label}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setGamePaused(!gamePaused)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              {gamePaused ? '▶️ চালু করো' : '⏸️ থামাও'}
            </button>
            <button
              onClick={() => setGameActive(false)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              🔄 নতুন গেম
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-800 p-4 rounded-lg border border-cyan-500/30 mb-6">
          <h3 className="text-cyan-400 font-bold mb-3">📋 নিয়ন্ত্রণ:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-cyan-300">
            <p>⬆️ উপরে: Arrow Up / W</p>
            <p>⬇️ নিচে: Arrow Down / S</p>
            <p>⬅️ বাম: Arrow Left / A</p>
            <p>➡️ ডান: Arrow Right / D</p>
            <p>⏸️ পজ/রিজিউম: Space Bar</p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-slate-800 p-4 rounded-lg border border-cyan-500/30 mb-6">
          <h3 className="text-cyan-400 font-bold mb-3">💡 টিপস:</h3>
          <ul className="text-sm text-cyan-300 space-y-1">
            <li>🍎 খাবার (লাল বল) খান এবং সাপকে বড় করুন।</li>
            <li>🚫 নিজের সাথে সংঘর্ষ এড়ান!</li>
            <li>🤖 AI সাপের লেজ ছুঁলে সে স্টান হয়ে যায়।</li>
            <li>🔥 দ্রুত খাবার খেলে Combo বোনাস পাবেন!</li>
          </ul>
        </div>

        {/* Logs */}
        <div className="bg-slate-800 p-4 rounded-lg border border-cyan-500/30">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full text-cyan-400 font-bold mb-3 hover:text-cyan-300 transition-all"
          >
            📋 লগ ({logs.length})
          </button>
          {showLogs && (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <p className="text-cyan-400/50 text-sm">কোনো লগ নেই</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-xs text-cyan-300 font-mono">
                    <span className="text-cyan-500">[{log.timestamp}]</span> {log.event}: {log.details}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-cyan-400/50 text-sm">
          <p>রিয়াদ সাপ গেম - Riyad Snake Game</p>
        </div>
      </div>
    </div>
  )
}
