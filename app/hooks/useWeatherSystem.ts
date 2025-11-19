import { useState, useCallback, useRef } from 'react'

export type WeatherType = 'clear' | 'fog' | 'rain' | 'storm'

export interface WeatherState {
  type: WeatherType
  intensity: number
  duration: number
  startTime: number
}

export const useWeatherSystem = () => {
  const [weather, setWeather] = useState<WeatherState>({
    type: 'clear',
    intensity: 0,
    duration: 0,
    startTime: 0,
  })

  const weatherTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get speed modifier based on weather
  const getSpeedModifier = useCallback((): number => {
    switch (weather.type) {
      case 'fog':
        return 1.0 // No speed change
      case 'rain':
        return 0.8 // 20% slower
      case 'storm':
        return 0.6 // 40% slower
      default:
        return 1.0
    }
  }, [weather.type])

  // Get visibility modifier based on weather
  const getVisibilityModifier = useCallback((): number => {
    switch (weather.type) {
      case 'fog':
        return 0.5 // 50% visibility
      case 'rain':
        return 0.9 // 90% visibility
      case 'storm':
        return 0.7 // 70% visibility
      default:
        return 1.0
    }
  }, [weather.type])

  // Get shake intensity based on weather
  const getShakeIntensity = useCallback((): number => {
    switch (weather.type) {
      case 'storm':
        return 2
      case 'rain':
        return 0.5
      default:
        return 0
    }
  }, [weather.type])

  // Change weather
  const changeWeather = useCallback((newType: WeatherType, duration: number = 10000) => {
    if (weatherTimeoutRef.current) {
      clearTimeout(weatherTimeoutRef.current)
    }

    setWeather({
      type: newType,
      intensity: 1,
      duration,
      startTime: Date.now(),
    })

    weatherTimeoutRef.current = setTimeout(() => {
      setWeather({
        type: 'clear',
        intensity: 0,
        duration: 0,
        startTime: 0,
      })
    }, duration)
  }, [])

  // Random weather event
  const triggerRandomWeather = useCallback(() => {
    const weatherTypes: WeatherType[] = ['fog', 'rain', 'storm']
    const randomType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)]
    const duration = 8000 + Math.random() * 4000 // 8-12 seconds
    changeWeather(randomType, duration)
  }, [changeWeather])

  // Clear weather
  const clearWeather = useCallback(() => {
    if (weatherTimeoutRef.current) {
      clearTimeout(weatherTimeoutRef.current)
    }
    setWeather({
      type: 'clear',
      intensity: 0,
      duration: 0,
      startTime: 0,
    })
  }, [])

  return {
    weather,
    getSpeedModifier,
    getVisibilityModifier,
    getShakeIntensity,
    changeWeather,
    triggerRandomWeather,
    clearWeather,
  }
}
