import { useState, useCallback, useRef } from 'react'

export interface TailSegment {
  x: number
  y: number
  smoothX: number
  smoothY: number
  angle: number
}

export const useTailPhysics = () => {
  const [tailSegments, setTailSegments] = useState<TailSegment[]>([])
  const smoothingFactorRef = useRef(0.15) // Lower = smoother

  // Update tail physics based on snake body
  const updateTailPhysics = useCallback(
    (snakeBody: Array<{ x: number; y: number }>, cellSize: number) => {
      if (snakeBody.length < 2) {
        setTailSegments([])
        return
      }

      const segments: TailSegment[] = snakeBody.map((segment, index) => {
        let smoothX = segment.x * cellSize + cellSize / 2
        let smoothY = segment.y * cellSize + cellSize / 2

        // Calculate angle to next segment
        let angle = 0
        if (index < snakeBody.length - 1) {
          const nextSegment = snakeBody[index + 1]
          const dx = nextSegment.x - segment.x
          const dy = nextSegment.y - segment.y
          angle = Math.atan2(dy, dx) * (180 / Math.PI)
        }

        return {
          x: segment.x,
          y: segment.y,
          smoothX,
          smoothY,
          angle,
        }
      })

      setTailSegments(segments)
    },
    []
  )

  // Get smooth position for rendering
  const getSmoothPosition = useCallback(
    (index: number): { x: number; y: number; angle: number } | null => {
      if (index >= tailSegments.length) return null

      const segment = tailSegments[index]
      return {
        x: segment.smoothX,
        y: segment.smoothY,
        angle: segment.angle,
      }
    },
    [tailSegments]
  )

  // Get all tail segments for rendering
  const getTailSegments = useCallback(() => {
    return tailSegments
  }, [tailSegments])

  // Calculate tail width based on position (thinner towards tail)
  const getTailWidth = useCallback((index: number, totalLength: number): number => {
    const ratio = index / totalLength
    return Math.max(2, 8 * (1 - ratio * 0.7)) // Gradually thinner
  }, [])

  // Get tail glow effect intensity
  const getTailGlow = useCallback((index: number, totalLength: number): number => {
    const ratio = index / totalLength
    return Math.max(0.3, 1 - ratio * 0.7) // Glow fades towards tail
  }, [])

  return {
    tailSegments,
    updateTailPhysics,
    getSmoothPosition,
    getTailSegments,
    getTailWidth,
    getTailGlow,
  }
}
