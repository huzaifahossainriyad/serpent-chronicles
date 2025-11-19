import { useState, useCallback, useRef } from 'react'

export interface Boss {
  x: number
  y: number
  width: number
  height: number
  health: number
  maxHealth: number
  speed: number
  isActive: boolean
  spawnScore: number
}

export const useBossMode = (gridSize: number) => {
  const [boss, setBoss] = useState<Boss | null>(null)
  const bossUpdateRef = useRef(0)

  // Spawn boss at specific score
  const spawnBoss = useCallback((score: number) => {
    setBoss({
      x: Math.floor(gridSize / 2),
      y: Math.floor(gridSize / 2),
      width: 4,
      height: 4,
      health: 50,
      maxHealth: 50,
      speed: 0.3,
      isActive: true,
      spawnScore: score,
    })
  }, [gridSize])

  // Move boss towards player
  const moveBossTowards = useCallback(
    (playerX: number, playerY: number) => {
      setBoss((prev) => {
        if (!prev || !prev.isActive) return prev

        const dx = playerX - prev.x
        const dy = playerY - prev.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance === 0) return prev

        const moveX = (dx / distance) * prev.speed
        const moveY = (dy / distance) * prev.speed

        return {
          ...prev,
          x: Math.max(0, Math.min(gridSize - prev.width, prev.x + moveX)),
          y: Math.max(0, Math.min(gridSize - prev.height, prev.y + moveY)),
        }
      })
    },
    [gridSize]
  )

  // Check collision with player
  const checkBossCollision = useCallback(
    (playerX: number, playerY: number): boolean => {
      if (!boss || !boss.isActive) return false

      return (
        playerX >= Math.floor(boss.x) &&
        playerX < Math.floor(boss.x) + boss.width &&
        playerY >= Math.floor(boss.y) &&
        playerY < Math.floor(boss.y) + boss.height
      )
    },
    [boss]
  )

  // Damage boss
  const damageBoss = useCallback((damage: number) => {
    setBoss((prev) => {
      if (!prev) return prev

      const newHealth = prev.health - damage
      if (newHealth <= 0) {
        return { ...prev, health: 0, isActive: false }
      }

      return { ...prev, health: newHealth }
    })
  }, [])

  // Check if boss is defeated
  const isBossDefeated = useCallback((): boolean => {
    return boss ? boss.health <= 0 : false
  }, [boss])

  // Despawn boss
  const despawnBoss = useCallback(() => {
    setBoss(null)
  }, [])

  return {
    boss,
    spawnBoss,
    moveBossTowards,
    checkBossCollision,
    damageBoss,
    isBossDefeated,
    despawnBoss,
  }
}
