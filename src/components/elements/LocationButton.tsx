'use client'

import { useRouter } from 'next/navigation'
import { findNearestCity } from '@/lib/weatherService'

const LocationButton = () => {
  const router = useRouter()

  const handleLocationWeather = async () => {
    if (!navigator.geolocation) {
      alert('위치 정보가 지원되지 않습니다.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        const nearestCity = findNearestCity(latitude, longitude)

        router.push(`/weather?city=${nearestCity}`)
      },
      (error) => {
        void error
        alert('위치 정보를 가져오는데 실패했습니다.')
      }
    )
  }

  return (
    <button
      onClick={handleLocationWeather}
      className='px-[10px] py-[6px] text-customs-gray-50 text-caption1 rounded-[20px] border ml-auto'
    >
      내 위치 불러오기
    </button>
  )
}

export default LocationButton
