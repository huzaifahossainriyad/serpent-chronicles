import { useState, useCallback, useRef } from 'react'

export interface ComboState {
  count: number
  multiplier: number
  lastFoodTime: number
  isActive: boolean
}

export const useCombo = () => {
  const [combo, setCombo] = useState<ComboState>({
    count: 0,
    multiplier: 1,
    lastFoodTime: 0,
    isActive: false,
  })

  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset combo after timeout
  const resetCombo = useCallback(() => {
    setCombo({
      count: 0,
      multiplier: 1,
      lastFoodTime: 0,
      isActive: false,
    })
  }, [])

  // Register food eaten
  const registerFoodEaten = useCallback(() => {
    const currentTime = Date.now()

    // Clear existing timeout
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current)
    }

    setCombo((prev) => {
      let newCount = prev.count + 1
      let newMultiplier = 1

      // Calculate multiplier based on combo count
      if (newCount >= 2) newMultiplier = 2
      if (newCount >= 3) newMultiplier = 3
      if (newCount >= 5) newMultiplier = 5
      if (newCount >= 10) newMultiplier = 10

      return {
        count: newCount,
        multiplier: newMultiplier,
        lastFoodTime: currentTime,
        isActive: true,
      }
    })

    // Set timeout to reset combo after 5 seconds
    comboTimeoutRef.current = setTimeout(() => {
      resetCombo()
    }, 5000)
  }, [resetCombo])

  // Get bonus points based on combo
  const getComboBonus = useCallback((basePoints: number): number => {
    return basePoints * combo.multiplier
  }, [combo.multiplier])

  // Manual reset
  const manualResetCombo = useCallback(() => {
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current)
    }
    resetCombo()
  }, [resetCombo])

  return {
    combo,
    registerFoodEaten,
    getComboBonus,
    resetCombo: manualResetCombo,
  }
}
