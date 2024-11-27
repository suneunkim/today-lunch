// 주요 도시 정의
const MAJOR_CITIES = {
  SEOUL: { name: 'Seoul', nameKR: '서울특별시', lat: 37.5665, lon: 126.978 },
  BUSAN: { name: 'Busan', nameKR: '부산특별시', lat: 35.1796, lon: 129.0756 },
  DAEGU: { name: 'Daegu', nameKR: '대구광역시', lat: 35.8, lon: 128.55 },
  INCHEON: { name: 'Incheon', nameKR: '인천광역시', lat: 37.4563, lon: 126.7052 },
  GWANGJU: { name: 'Gwangju', nameKR: '광주광역시', lat: 35.1547, lon: 126.9156 },
  DAEJEON: { name: 'Daejeon', nameKR: '대전광역시', lat: 36.3504, lon: 127.3845 },
  ULSAN: { name: 'Ulsan', nameKR: '울산광역시', lat: 35.5372, lon: 129.3167 },
  CHUNCHEON: { name: 'Chuncheon', nameKR: '춘천시', lat: 37.8747, lon: 127.7342 },
  JEONJU: { name: 'Jeonju', nameKR: '전주시', lat: 35.8247, lon: 127.148 },
  MASAN: { name: 'Masan', nameKR: '마산시', lat: 35.1443, lon: 128.5718 },
  JEJU: { name: 'Jeju', nameKR: '제주특별시', lat: 33.4996, lon: 126.5312 },
}

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

// 도시 이름을 기준으로 날씨 데이터 가져오기
export const getWeatherByCity = async (cityName: string = 'Seoul') => {
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=kr`,
      {
        next: { revalidate: 7200 },
      }
    )

    const data = await res.json()

    console.log('API Response:', data)

    if (data.cod !== 200) {
      throw new Error(`OpenWeather API Error: ${data.message}`)
    }


    // MAJOR_CITIES에서 한글 이름 찾기
    const city = Object.values(MAJOR_CITIES).find((city) => city.name === cityName)

    // 도시 이름이 있으면 한글 이름 사용, 없으면 영어 이름 사용
    const locationKR = city ? city.nameKR : data.name

    const weatherData = {
      location: locationKR,
      temperature: Math.round(data.main.temp),
      weather: data.weather?.[0].main,

    }

    return weatherData
  } catch (error) {
    console.error('Weather data fetch error:', error)
    return null
  }
}
