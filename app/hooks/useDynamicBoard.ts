import { useState, useCallback, useRef } from 'react'

export interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  moving: boolean
  direction: number // 0=up, 1=right, 2=down, 3=left
  speed: number
}

export const useDynamicBoard = (gridSize: number) => {
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [boardRotation, setBoardRotation] = useState(0)
  const [boardZoom, setBoardZoom] = useState(1)
  const obstacleUpdateRef = useRef(0)

  // Generate random obstacles
  const generateObstacles = useCallback((count: number = 3) => {
    const newObstacles: Obstacle[] = []

    for (let i = 0; i < count; i++) {
      const direction = Math.floor(Math.random() * 4)
      const isHorizontal = direction === 1 || direction === 3

      newObstacles.push({
        x: Math.floor(Math.random() * (gridSize - 5)) + 2,
        y: Math.floor(Math.random() * (gridSize - 5)) + 2,
        width: isHorizontal ? 8 : 2,
        height: isHorizontal ? 2 : 8,
        moving: Math.random() > 0.5,
        direction,
        speed: 0.5 + Math.random() * 0.5,
      })
    }

    setObstacles(newObstacles)
  }, [gridSize])

  // Update obstacles position
  const updateObstacles = useCallback(() => {
    setObstacles((prev) =>
      prev.map((obs) => {
        if (!obs.moving) return obs

        let newX = obs.x
        let newY = obs.y

        switch (obs.direction) {
          case 0: // up
            newY = Math.max(0, newY - obs.speed)
            break
          case 1: // right
            newX = Math.min(gridSize - obs.width, newX + obs.speed)
            break
          case 2: // down
            newY = Math.min(gridSize - obs.height, newY + obs.speed)
            break
          case 3: // left
            newX = Math.max(0, newX - obs.speed)
            break
        }

        return { ...obs, x: newX, y: newY }
      })
    )
  }, [gridSize])

  // Rotate board
  const rotateBoard = useCallback((angle: number) => {
    setBoardRotation((prev) => (prev + angle) % 360)
  }, [])

  // Zoom board
  const zoomBoard = useCallback((factor: number) => {
    setBoardZoom((prev) => Math.max(0.5, Math.min(2, prev + factor)))
  }, [])

  // Check collision with obstacles
  const checkObstacleCollision = useCallback(
    (x: number, y: number): boolean => {
      return obstacles.some(
        (obs) =>
          x >= Math.floor(obs.x) &&
          x < Math.floor(obs.x) + obs.width &&
          y >= Math.floor(obs.y) &&
          y < Math.floor(obs.y) + obs.height
      )
    },
    [obstacles]
  )

  // Clear obstacles
  const clearObstacles = useCallback(() => {
    setObstacles([])
    setBoardRotation(0)
    setBoardZoom(1)
  }, [])

  return {
    obstacles,
    boardRotation,
    boardZoom,
    generateObstacles,
    updateObstacles,
    rotateBoard,
    zoomBoard,
    checkObstacleCollision,
    clearObstacles,
  }
}
