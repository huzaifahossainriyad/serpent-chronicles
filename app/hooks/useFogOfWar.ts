import { useState, useCallback } from 'react'

export interface FogOfWarState {
  enabled: boolean
  visibilityRadius: number
  opacity: number
}

export const useFogOfWar = () => {
  const [fogOfWar, setFogOfWar] = useState<FogOfWarState>({
    enabled: false,
    visibilityRadius: 8,
    opacity: 0.8,
  })

  // Enable fog of war
  const enableFogOfWar = useCallback((radius: number = 8) => {
    setFogOfWar({
      enabled: true,
      visibilityRadius: radius,
      opacity: 0.8,
    })
  }, [])

  // Disable fog of war
  const disableFogOfWar = useCallback(() => {
    setFogOfWar({
      enabled: false,
      visibilityRadius: 8,
      opacity: 0.8,
    })
  }, [])

  // Set visibility radius
  const setVisibilityRadius = useCallback((radius: number) => {
    setFogOfWar((prev) => ({
      ...prev,
      visibilityRadius: Math.max(3, Math.min(15, radius)),
    }))
  }, [])

  // Check if position is visible
  const isPositionVisible = useCallback(
    (x: number, y: number, playerX: number, playerY: number): boolean => {
      if (!fogOfWar.enabled) return true

      const distance = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2)
      return distance <= fogOfWar.visibilityRadius
    },
    [fogOfWar.enabled, fogOfWar.visibilityRadius]
  )

  // Get visibility gradient
  const getVisibilityAlpha = useCallback(
    (x: number, y: number, playerX: number, playerY: number): number => {
      if (!fogOfWar.enabled) return 1

      const distance = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2)
      const maxDistance = fogOfWar.visibilityRadius

      if (distance <= maxDistance * 0.7) return 1
      if (distance >= maxDistance) return 0

      // Smooth fade
      return 1 - (distance - maxDistance * 0.7) / (maxDistance * 0.3)
    },
    [fogOfWar.enabled, fogOfWar.visibilityRadius]
  )

  return {
    fogOfWar,
    enableFogOfWar,
    disableFogOfWar,
    setVisibilityRadius,
    isPositionVisible,
    getVisibilityAlpha,
  }
}
