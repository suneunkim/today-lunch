'use client'
import WeatherIcon from '@/components/elements/WeatherIcon'
import WeatherCard from './WeatherCard'
import LocationButton from '@/components/elements/LocationButton'

interface Props {
  location: string
  temperature: number
  weather: string
}

const WeatherBanner = ({ location, temperature, weather }: Props) => {
  const weatherTextMap: { [key: string]: string } = {
    Clear: '맑음',
    Clouds: '구름',
    Snow: '눈',
    Rain: '비',
    Drizzle: '이슬비',
    Thunderstorm: '천둥번개',
  }

  const weatherText = weatherTextMap[weather] || weather
  const weatherTextIcon = weatherTextMap[weather] as
    | '맑음'
    | '구름'
    | '눈'
    | '비'
    | '이슬비'
    | '천둥번개'

  return (
    <div className='text-customs-gray-25'>
      <div className='flex items-center gap-[2px] mb-3'>
        <WeatherIcon name='마커' />
        <h4>{location}</h4>
        <LocationButton />
      </div>
      <WeatherCard weatherType='rainy'>
        <div>
          <div className='flex'>
            <span className='text-display'>{Math.round(temperature)}</span>
            <span className='mt-[4px] ml-[6px] text-2xl'>°</span>
          </div>
          <div className='text-headline1'>{weatherText}</div>
        </div>
        <WeatherIcon name={weatherTextIcon} />
      </WeatherCard>
    </div>
  )
}

export default WeatherBanner
