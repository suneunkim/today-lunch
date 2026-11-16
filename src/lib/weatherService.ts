// 날씨는 Open-Meteo(키 없이 쓰는 무료 API)에서 기기가 직접 받아옵니다.
const MAJOR_CITIES = {
  SEOUL: { name: 'Seoul', nameKR: '서울특별시', lat: 37.5665, lon: 126.978 },
  BUSAN: { name: 'Busan', nameKR: '부산광역시', lat: 35.1796, lon: 129.0756 },
  DAEGU: { name: 'Daegu', nameKR: '대구광역시', lat: 35.8, lon: 128.55 },
  INCHEON: { name: 'Incheon', nameKR: '인천광역시', lat: 37.4563, lon: 126.7052 },
  GWANGJU: { name: 'Gwangju', nameKR: '광주광역시', lat: 35.1547, lon: 126.9156 },
  DAEJEON: { name: 'Daejeon', nameKR: '대전광역시', lat: 36.3504, lon: 127.3845 },
  ULSAN: { name: 'Ulsan', nameKR: '울산광역시', lat: 35.5372, lon: 129.3167 },
  CHUNCHEON: { name: 'Chuncheon', nameKR: '춘천시', lat: 37.8747, lon: 127.7342 },
  JEONJU: { name: 'Jeonju', nameKR: '전주시', lat: 35.8247, lon: 127.148 },
  MASAN: { name: 'Masan', nameKR: '창원시 마산', lat: 35.1443, lon: 128.5718 },
  JEJU: { name: 'Jeju', nameKR: '제주시', lat: 33.4996, lon: 126.5312 },
}

export type WeatherData = { location: string; temperature: number; weather: string }

// 위도 경도로 가장 가까운 도시 찾기
export const findNearestCity = (lat: number, lon: number) => {
  let nearestCity = MAJOR_CITIES.SEOUL
  let minDistance = Infinity

  Object.values(MAJOR_CITIES).forEach((city) => {
    const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2))
    if (distance < minDistance) {
      minDistance = distance
      nearestCity = city
    }
  })

  return nearestCity.name
}

// WMO 날씨 코드 → 기존 화면에서 쓰던 날씨 이름
const weatherFromCode = (code: number) => {
  if (code <= 1) return 'Clear'
  if (code <= 48) return 'Clouds'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain'
  if (code <= 86) return 'Snow'
  return 'Thunderstorm'
}

export const getWeatherByCity = async (cityName: string = 'Seoul'): Promise<WeatherData | null> => {
  const city =
    Object.values(MAJOR_CITIES).find((c) => c.name === cityName) ?? MAJOR_CITIES.SEOUL

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=Asia%2FSeoul`,
      { signal: controller.signal }
    )
    clearTimeout(timer)
    const data = await res.json()
    if (!data?.current) throw new Error('날씨 응답 형식 오류')

    return {
      location: city.nameKR,
      temperature: Math.round(data.current.temperature_2m),
      weather: weatherFromCode(data.current.weather_code),
    }
  } catch (error) {
    console.error('Weather data fetch error:', error)
    return null
  }
}
