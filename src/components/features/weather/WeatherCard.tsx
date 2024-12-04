import { weatherBackgroundColors } from '@/app/data/data'

export type WeatherType = keyof typeof weatherBackgroundColors
interface Props {
  children: React.ReactNode
  weather: WeatherType
}

const WeatherCard = ({ children, weather }: Props) => {
  const backgroundColor = weatherBackgroundColors[weather]

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
