'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import WeatherContent from '@/components/features/weather/WeatherContent'
import ShareButton from '@/components/ShareButton'
import Chip from '@/components/elements/Chip'
import { getWeatherByCity, lastWeatherError, WeatherData } from '@/lib/weatherService'

// 날씨를 직접 고를 수 있습니다. (자동으로 못 받아왔거나, 체감과 다를 때)
const MANUAL: { key: string; label: string; weather: string; temperature: number }[] = [
  { key: 'rain', label: '비 와요', weather: 'Rain', temperature: 18 },
  { key: 'snow', label: '눈 와요', weather: 'Snow', temperature: 0 },
  { key: 'cold', label: '추워요', weather: 'Clouds', temperature: 3 },
  { key: 'hot', label: '더워요', weather: 'Clear', temperature: 31 },
  { key: 'mild', label: '딱 좋아요', weather: 'Clear', temperature: 20 },
]

const WeatherPageClient = () => {
  const city = useSearchParams().get('city') || 'Seoul'
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [manual, setManual] = useState('')

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

  const picked = MANUAL.find((m) => m.key === manual)
  const shown: WeatherData | null = picked
    ? { location: '직접 고른 날씨', temperature: picked.temperature, weather: picked.weather }
    : weatherData

  return (
    <>
      <section>
        <p className='text-label1 text-customs-gray-25 mb-2'>
          {weatherData ? '체감 날씨가 다르다면 직접 골라 보세요.' : '지금 날씨를 직접 골라 주세요.'}
        </p>
        <div className='flex flex-wrap gap-2'>
          {weatherData && (
            <Chip selected={!manual} onClick={() => setManual('')}>
              지금 날씨
            </Chip>
          )}
          {MANUAL.map((m) => (
            <Chip key={m.key} selected={manual === m.key} onClick={() => setManual(m.key)}>
              {m.label}
            </Chip>
          ))}
        </div>
      </section>
      {/* 날씨를 못 받아왔고 아직 고르지도 않았으면 메뉴 대신 안내만 보여 줍니다. */}
      {shown ? (
        <WeatherContent key={manual || 'auto'} weatherData={shown} />
      ) : (
        <p className='text-label2 text-customs-gray-50 py-10 text-center'>
          날씨 정보를 자동으로 받아오지 못했습니다. 위에서 날씨를 고르면 어울리는 메뉴를 제안드립니다.
        </p>
      )}
      {!weatherData && lastWeatherError && (
        <p className='text-caption1 text-customs-gray-75 break-all'>원인: {lastWeatherError}</p>
      )}
      <ShareButton
        label='공유하기'
        text={
          shown
            ? `[먹대리 날씨 보고]\n${picked ? picked.label : `지금 ${shown.location} ${shown.temperature}°`}. 오늘 날씨에 어울리는 점심 메뉴를 확인해 보세요!`
            : '오늘 날씨에 어울리는 점심 메뉴를 확인해 보세요!'
        }
      />
    </>
  )
}

export default WeatherPageClient
