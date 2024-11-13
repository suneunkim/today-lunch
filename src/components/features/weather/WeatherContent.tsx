import { 해장제외전체 } from '@/app/data/food'
import WeatherBanner from '@/components/features/weather/WeatherBanner'
import WeatherCardWrap from '@/components/features/weather/WeatherCardWrap'
import {
  getTemperatureCondition,
  getTemperatureFilteredMenus,
  getWeatherFilteredMenus,
} from '@/lib/filterWeahter'

interface Props {
  weatherData: {
    location: string
    temperature: number
    weather: string
  } | null
}

const WeatherContent = ({ weatherData }: Props) => {
  const apiWeather = weatherData?.weather.toLowerCase() ?? 'clear' // 예: 'Clear', 'Rain', 'Snow'
  const temperature = weatherData?.temperature ?? 20 // 기온 값 (기본값 20)
  const tempCondition = getTemperatureCondition(temperature) // 예: 'Mild' | 'Cold' | 'Hot'

  // 날씨에 맞는 메뉴 필터링 - rain, snow 외에는 clear(맑음) 처리
  const weatherFilteredMenus = getWeatherFilteredMenus(해장제외전체, apiWeather)

  // 기온에 맞는 메뉴 필터링
  const tempFilterdMenus = getTemperatureFilteredMenus(
    해장제외전체,
    tempCondition,
    weatherFilteredMenus
  )

  // 날씨 API의 weather 값에 따라 지정한 Title 사용
  const weatherConditionTitle =
    apiWeather === 'rain' ? 'rain' : apiWeather === 'snow' ? 'snow' : 'clear'

  return (
    <div className='flex flex-col gap-8'>
      {weatherData ? (
        <WeatherBanner
          location={weatherData.location}
          temperature={weatherData.temperature}
          weather={weatherData.weather}
        />
      ) : (
        <div>날씨 정보를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.</div>
      )}

      <WeatherCardWrap data={weatherFilteredMenus} title={weatherConditionTitle} type='orange' />
      <WeatherCardWrap data={tempFilterdMenus} title={tempCondition} type='gray' />
    </div>
  )
}

export default WeatherContent
