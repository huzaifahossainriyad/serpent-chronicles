import { useState, useCallback, useRef } from 'react'

export interface AISnakeState {
  body: Array<{ x: number; y: number }>
  direction: { x: number; y: number }
  nextDirection: { x: number; y: number }
  isStunned: boolean
  stunEndTime: number
}

export const useAISnake = (gridSize: number, cellSize: number) => {
  const [aiSnake, setAISnake] = useState<AISnakeState>({
    body: [
      { x: Math.floor(gridSize / 3), y: Math.floor(gridSize / 2) },
      { x: Math.floor(gridSize / 3) - 1, y: Math.floor(gridSize / 2) },
      { x: Math.floor(gridSize / 3) - 2, y: Math.floor(gridSize / 2) },
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    isStunned: false,
    stunEndTime: 0,
  })

  const lastMoveTimeRef = useRef(0)
  const aiSpeedRef = useRef(120)

  const findPathToFood = useCallback(
    (head: { x: number; y: number }, foodPos: { x: number; y: number }) => {
      const dx = foodPos.x - head.x
      const dy = foodPos.y - head.y

      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 }
      } else {
        return dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 }
      }
    },
    []
  )

  const updateAISnake = useCallback(
    (
      currentTime: number,
      foodPos: { x: number; y: number },
      playerSnakeBody: Array<{ x: number; y: number }>
    ) => {
      setAISnake((prev) => {
        let isStunned = prev.isStunned
        if (isStunned && currentTime > prev.stunEndTime) {
          isStunned = false
        }

        if (isStunned) {
          return { ...prev, isStunned }
        }

        if (currentTime - lastMoveTimeRef.current < aiSpeedRef.current) {
          return prev
        }

        lastMoveTimeRef.current = currentTime

        const head = prev.body[0]
        const newDirection = findPathToFood(head, foodPos)

        if (
          newDirection.x === -prev.direction.x &&
          newDirection.y === -prev.direction.y
        ) {
          return { ...prev, nextDirection: prev.direction }
        }

        const newHead = {
          x: (head.x + newDirection.x + gridSize) % gridSize,
          y: (head.y + newDirection.y + gridSize) % gridSize,
        }

        const newBody = [newHead, ...prev.body.slice(0, -1)]

        return {
          ...prev,
          body: newBody,
          direction: newDirection,
          nextDirection: newDirection,
        }
      })
    },
    [gridSize, findPathToFood]
  )

  const stunAISnake = useCallback((duration: number = 2000) => {
    setAISnake((prev) => ({
      ...prev,
      isStunned: true,
      stunEndTime: Date.now() + duration,
    }))
  }, [])

  const checkFoodCollision = useCallback(
    (foodPos: { x: number; y: number }): boolean => {
      const head = aiSnake.body[0]
      return head.x === foodPos.x && head.y === foodPos.y
    },
    [aiSnake.body]
  )

  const checkPlayerCollision = useCallback(
    (playerSnakeBody: Array<{ x: number; y: number }>): boolean => {
      const aiHead = aiSnake.body[0]
      return playerSnakeBody.some((segment) => segment.x === aiHead.x && segment.y === aiHead.y)
    },
    [aiSnake.body]
  )

  const growAISnake = useCallback(() => {
    setAISnake((prev) => {
      const tail = prev.body[prev.body.length - 1]
      return {
        ...prev,
        body: [...prev.body, { ...tail }],
      }
    })
  }, [])

  return {
    aiSnake,
    updateAISnake,
    stunAISnake,
    checkFoodCollision,
    checkPlayerCollision,
    growAISnake,
  }
}
