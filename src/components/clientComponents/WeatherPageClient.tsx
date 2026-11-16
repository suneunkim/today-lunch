'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import WeatherContent from '@/components/features/weather/WeatherContent'
import ShareButton from '@/components/ShareButton'
import { getWeatherByCity, lastWeatherError, WeatherData } from '@/lib/weatherService'

const WeatherPageClient = () => {
  const city = useSearchParams().get('city') || 'Seoul'
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    setLoaded(false)
    getWeatherByCity(city).then((data) => {
      if (!alive) return
      setWeatherData(data)
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [city])

  if (!loaded) {
    return <p className='text-label2 text-customs-gray-50 py-20 text-center'>날씨 확인 중입니다…</p>
  }

  return (
    <>
      <WeatherContent weatherData={weatherData} />
      {!weatherData && lastWeatherError && (
        <p className='text-caption1 text-customs-gray-75 break-all'>원인: {lastWeatherError}</p>
      )}
      <ShareButton
        label='동료에게 공유하기'
        text={
          weatherData
            ? `[먹대리 날씨 보고]\n지금 ${weatherData.location} ${weatherData.temperature}°. 오늘 날씨에 어울리는 점심 메뉴를 확인해 보세요!`
            : '오늘 날씨에 어울리는 점심 메뉴를 확인해 보세요!'
        }
      />
    </>
  )
}

export default WeatherPageClient
