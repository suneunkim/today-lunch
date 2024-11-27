import { weatherBackgroundColors } from '@/app/data/data'

interface Props {
  children: React.ReactNode
  weatherType: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
}

const WeatherCard = ({ children, weatherType }: Props) => {
  const backgroundColor = weatherBackgroundColors[weatherType]
  return (
    <div
      className='rounded-[16px] h-[105px] px-4 py-2 flex justify-between items-center'
      style={{
        backgroundImage: backgroundColor,
      }}
    >
      {children}
    </div>
  )
}

export default WeatherCard
