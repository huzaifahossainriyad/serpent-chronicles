'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAISnake } from './hooks/useAISnake'
import { useCombo } from './hooks/useCombo'
import { useTailPhysics } from './hooks/useTailPhysics'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useCampaignMode } from './hooks/useCampaignMode'
import SoundSettings from './components/SoundSettings'
import CampaignMode from './components/CampaignMode'

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
  const [showCampaign, setShowCampaign] = useState(false)
  const [campaignLevelActive, setCampaignLevelActive] = useState<number | null>(null)

  // Hooks
  const { aiSnake, updateAISnake, stunAISnake, checkFoodCollision: aiCheckFood, checkPlayerCollision, growAISnake } = useAISnake(GRID_SIZE, CELL_SIZE)
  const { combo, registerFoodEaten, getComboBonus, reset: resetCombo } = useCombo()
  const { updateTailPhysics, getTailSegments } = useTailPhysics()
  const { playFoodEaten, playGameOver, playVictory, playCombo, playMenuClick } = useSoundEffects()
  const { levels, completeLevel, getCurrentLevel, getProgress, resetCampaign } = useCampaignMode()

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('highScore')
    if (saved) setHighScore(parseInt(saved))
  }, [])

  // Generate random food
  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (
      snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y) ||
      aiSnake.body.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    )
    return newFood
  }, [snake, aiSnake])

  // Add log entry
  const addLog = useCallback((event: string, details: string) => {
    const timestamp = new Date().toLocaleTimeString('bn-BD')
    setLogs((prev) => [...prev, { timestamp, event, details }])
  }, [])

  // Handle game over
  const handleGameOver = useCallback(() => {
    setGameActive(false)
    playGameOver()

    const messageCategory =
      score < 50 ? 'veryBad' : score < 100 ? 'bad' : score < 200 ? 'okay' : score < 500 ? 'good' : 'excellent'
    const messages = GAME_OVER_MESSAGES[messageCategory]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    setGameOverMessage(randomMessage)

    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('highScore', score.toString())
      playVictory()
    }

    addLog('গেম ওভার', `স্কোর: ${score}, হাই স্কোর: ${Math.max(score, highScore)}`)

    // Complete campaign level if active
    if (campaignLevelActive) {
      completeLevel(campaignLevelActive, score)
      addLog('ক্যাম্পেইন', `লেভেল ${campaignLevelActive} সম্পূর্ণ হয়েছে। স্কোর: ${score}`)
    }
  }, [score, highScore, playGameOver, playVictory, addLog, campaignLevelActive, completeLevel])

  // Game loop
  useEffect(() => {
    if (!gameActive || gamePaused) return

    const gameLoop = setInterval(() => {
      const now = Date.now()
      const speed = DIFFICULTY_SETTINGS[difficulty].speed
      if (now - lastMoveTimeRef.current < speed) return

      lastMoveTimeRef.current = now

      setSnake((prevSnake) => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }

        head.x += nextDirection.x
        head.y += nextDirection.y

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleGameOver()
          return prevSnake
        }

        // Self collision
        if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          handleGameOver()
          return prevSnake
        }

        newSnake.unshift(head)
        setDirection(nextDirection)

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          playFoodEaten()
          registerFoodEaten()
          const comboBonus = getComboBonus()
          setScore((prev) => prev + 10 + comboBonus)
          playCombo()
          setFood(generateFood())
          addLog('খাবার খাওয়া', `স্কোর: +${10 + comboBonus}, Combo: ${combo.count + 1}`)
        } else {
          newSnake.pop()
        }

        return newSnake
      })

      // Update AI
      updateAISnake(food, snake)
    }, 1000 / 60)

    return () => clearInterval(gameLoop)
  }, [gameActive, gamePaused, nextDirection, food, difficulty, snake, aiSnake, combo, generateFood, handleGameOver, playFoodEaten, registerFoodEaten, getComboBonus, playCombo, addLog, updateAISnake])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        if (gameActive) {
          setGamePaused(!gamePaused)
          playMenuClick()
        }
      }

      if (!gameActive) return

      const key = e.key.toLowerCase()
      if (key === 'w' || e.key === 'ArrowUp') setNextDirection({ x: 0, y: -1 })
      if (key === 's' || e.key === 'ArrowDown') setNextDirection({ x: 0, y: 1 })
      if (key === 'a' || e.key === 'ArrowLeft') setNextDirection({ x: -1, y: 0 })
      if (key === 'd' || e.key === 'ArrowRight') setNextDirection({ x: 1, y: 0 })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameActive, gamePaused, playMenuClick])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw border
    ctx.strokeStyle = '#06b6d4'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw food
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw player snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#22c55e' : '#16a34a'
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    })

    // Draw AI snake
    aiSnake.body.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#3b82f6' : '#1e40af'
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    })
  }, [snake, food, aiSnake])

  const startGame = () => {
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
    resetCombo()
    setGameOverMessage('')
    playMenuClick()
    addLog('গেম শুরু', `ডিফিকাল্টি: ${DIFFICULTY_SETTINGS[difficulty].label}`)
  }

  const handleSelectCampaignLevel = (levelId: number) => {
    setCampaignLevelActive(levelId)
    setShowCampaign(false)
    startGame()
  }

  if (showCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setShowCampaign(false)}
            className="mb-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-all"
          >
            ← ফিরে যাও
          </button>
          <CampaignMode
            levels={levels}
            totalCoins={0}
            onSelectLevel={handleSelectCampaignLevel}
            onResetCampaign={resetCampaign}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">রিয়াদ সাপ গেম</h1>
          <p className="text-cyan-300">Riyad's Snake Game - বাংলা ভার্সন</p>
        </div>

        {/* Difficulty Selection */}
        {!gameActive && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 text-center">📊 ডিফিকাল্টি লেভেল বেছে নিন</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
                <button
                  key={key}
                  onClick={() => {
                    setDifficulty(key)
                    playMenuClick()
                  }}
                  className={`p-4 rounded-lg font-bold transition-all ${
                    difficulty === key
                      ? `bg-gradient-to-r ${settings.color} text-white shadow-lg`
                      : 'bg-slate-700 text-cyan-300 hover:bg-slate-600'
                  }`}
                >
                  ⚡{settings.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game Canvas */}
        <div className="bg-slate-800 p-4 rounded-lg border-2 border-cyan-500 mb-6">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="w-full border-2 border-cyan-400 rounded"
          />
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700 p-4 rounded-lg text-center">
            <p className="text-cyan-400 text-sm">বর্তমান স্কোর</p>
            <p className="text-3xl font-bold text-green-400">{score}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg text-center">
            <p className="text-cyan-400 text-sm">Combo</p>
            <p className="text-3xl font-bold text-yellow-400">{combo.count}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg text-center">
            <p className="text-cyan-400 text-sm">হাই স্কোর</p>
            <p className="text-3xl font-bold text-purple-400">{highScore}</p>
          </div>
        </div>

        {/* Game Over Message */}
        {!gameActive && gameOverMessage && (
          <div className="bg-red-900/50 border-2 border-red-500 p-4 rounded-lg mb-6 text-center">
            <p className="text-red-300 text-lg font-bold">{gameOverMessage}</p>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={startGame}
            disabled={gameActive}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            🎮 শুরু করো
          </button>
          <button
            onClick={() => {
              setGamePaused(!gamePaused)
              playMenuClick()
            }}
            disabled={!gameActive}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            {gamePaused ? '▶️ চালু করো' : '⏸️ থামাও'}
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
          >
            📋 লগ ({logs.length})
          </button>
          <button
            onClick={() => {
              setShowCampaign(true)
              playMenuClick()
            }}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all"
          >
            🎮 ক্যাম্পেইন
          </button>
        </div>

        {/* Sound Settings */}
        <div className="mb-6">
          <SoundSettings />
        </div>

        {/* Instructions */}
        <div className="bg-slate-700 p-4 rounded-lg mb-6">
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
        <div className="bg-slate-700 p-4 rounded-lg mb-6">
          <h3 className="text-cyan-400 font-bold mb-3">💡 টিপস:</h3>
          <ul className="text-sm text-cyan-300 space-y-1">
            <li>খাবার (লাল বল) খান এবং সাপকে বড় করুন।</li>
            <li>নিজের সাথে সংঘর্ষ এড়ান!</li>
            <li>AI সাপের লেজ ছুঁলে সে স্টান হয়ে যায়।</li>
            <li>দ্রুত খাবার খেলে Combo বোনাস পাবেন!</li>
          </ul>
        </div>

        {/* Logs */}
        {showLogs && (
          <div className="bg-slate-700 p-4 rounded-lg mb-6 max-h-64 overflow-y-auto">
            <h3 className="text-cyan-400 font-bold mb-3">📊 গেম লগ:</h3>
            {logs.length === 0 ? (
              <p className="text-cyan-300 text-sm">কোনো লগ নেই</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs text-cyan-300 mb-2 border-b border-slate-600 pb-2">
                  <span className="text-yellow-400">[{log.timestamp}]</span> <span className="text-green-400">{log.event}:</span> {log.details}
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-cyan-400 text-sm">
          <p>রিয়াদ সাপ গেম - Riyad Snake Game</p>
        </div>
      </div>
    </div>
  )
}
