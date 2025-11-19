import { useState, useCallback, useRef } from 'react'

export type EventType = 'meteor' | 'controlReverse' | 'boardFlash' | 'speedBoost' | 'slowMotion'

export interface GameEvent {
  type: EventType
  startTime: number
  duration: number
  isActive: boolean
}

export interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export const useRandomEvents = (gridSize: number) => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
  const [meteors, setMeteors] = useState<Meteor[]>([])
  const eventTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Trigger random event
  const triggerRandomEvent = useCallback(() => {
    const eventTypes: EventType[] = ['meteor', 'controlReverse', 'boardFlash', 'speedBoost', 'slowMotion']
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const duration = randomType === 'controlReverse' ? 3000 : 5000

    setCurrentEvent({
      type: randomType,
      startTime: Date.now(),
      duration,
      isActive: true,
    })

    if (randomType === 'meteor') {
      // Spawn meteors
      const meteorCount = 2 + Math.floor(Math.random() * 3)
      const newMeteors: Meteor[] = []

      for (let i = 0; i < meteorCount; i++) {
        newMeteors.push({
          x: Math.random() * gridSize,
          y: -2,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.3 + Math.random() * 0.2,
          radius: 0.5 + Math.random() * 0.5,
        })
      }

      setMeteors(newMeteors)
    }

    if (eventTimeoutRef.current) {
      clearTimeout(eventTimeoutRef.current)
    }

    eventTimeoutRef.current = setTimeout(() => {
      setCurrentEvent(null)
      setMeteors([])
    }, duration)
  }, [gridSize])

  // Update meteors
  const updateMeteors = useCallback(() => {
    setMeteors((prev) =>
      prev
        .map((meteor) => ({
          ...meteor,
          x: meteor.x + meteor.vx,
          y: meteor.y + meteor.vy,
        }))
        .filter((meteor) => meteor.y < gridSize)
    )
  }, [gridSize])

  // Check meteor collision
  const checkMeteorCollision = useCallback(
    (x: number, y: number): boolean => {
      return meteors.some(
        (meteor) =>
          Math.sqrt((x - meteor.x) ** 2 + (y - meteor.y) ** 2) < meteor.radius + 0.5
      )
    },
    [meteors]
  )

  // Get control reverse state
  const isControlReversed = useCallback((): boolean => {
    return currentEvent?.type === 'controlReverse' && currentEvent.isActive
  }, [currentEvent])

  // Get speed modifier
  const getSpeedModifier = useCallback((): number => {
    if (!currentEvent || !currentEvent.isActive) return 1

    switch (currentEvent.type) {
      case 'speedBoost':
        return 1.5
      case 'slowMotion':
        return 0.5
      default:
        return 1
    }
  }, [currentEvent])

  // Get board flash state
  const shouldFlashBoard = useCallback((): boolean => {
    return currentEvent?.type === 'boardFlash' && currentEvent.isActive
  }, [currentEvent])

  // Clear events
  const clearEvents = useCallback(() => {
    if (eventTimeoutRef.current) {
      clearTimeout(eventTimeoutRef.current)
    }
    setCurrentEvent(null)
    setMeteors([])
  }, [])

  return {
    currentEvent,
    meteors,
    triggerRandomEvent,
    updateMeteors,
    checkMeteorCollision,
    isControlReversed,
    getSpeedModifier,
    shouldFlashBoard,
    clearEvents,
  }
}
