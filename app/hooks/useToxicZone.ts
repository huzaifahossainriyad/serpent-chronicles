import { useState, useCallback } from 'react'

export interface ToxicZone {
  x: number
  y: number
  width: number
  height: number
  damagePerSecond: number
}

export const useToxicZone = (gridSize: number) => {
  const [toxicZones, setToxicZones] = useState<ToxicZone[]>([])
  const [playerHP, setPlayerHP] = useState(100)
  const [maxHP] = useState(100)

  // Generate toxic zones
  const generateToxicZones = useCallback((count: number = 2) => {
    const zones: ToxicZone[] = []

    for (let i = 0; i < count; i++) {
      zones.push({
        x: Math.floor(Math.random() * (gridSize - 6)) + 2,
        y: Math.floor(Math.random() * (gridSize - 6)) + 2,
        width: 4 + Math.floor(Math.random() * 3),
        height: 4 + Math.floor(Math.random() * 3),
        damagePerSecond: 2,
      })
    }

    setToxicZones(zones)
    setPlayerHP(maxHP)
  }, [gridSize, maxHP])

  // Check if position is in toxic zone
  const isInToxicZone = useCallback(
    (x: number, y: number): boolean => {
      return toxicZones.some(
        (zone) =>
          x >= zone.x &&
          x < zone.x + zone.width &&
          y >= zone.y &&
          y < zone.y + zone.height
      )
    },
    [toxicZones]
  )

  // Apply damage
  const applyDamage = useCallback((damage: number) => {
    setPlayerHP((prev) => Math.max(0, prev - damage))
  }, [])

  // Heal player
  const healPlayer = useCallback((amount: number) => {
    setPlayerHP((prev) => Math.min(maxHP, prev + amount))
  }, [maxHP])

  // Reset HP
  const resetHP = useCallback(() => {
    setPlayerHP(maxHP)
  }, [maxHP])

  // Clear zones
  const clearZones = useCallback(() => {
    setToxicZones([])
    setPlayerHP(maxHP)
  }, [maxHP])

  return {
    toxicZones,
    playerHP,
    maxHP,
    generateToxicZones,
    isInToxicZone,
    applyDamage,
    healPlayer,
    resetHP,
    clearZones,
  }
}
