import { weatherIcons } from '@/app/assets/weatherIcons'

const WeatherIcon = ({ name }: { name: keyof typeof weatherIcons }) => {
  return weatherIcons[name] || weatherIcons['맑음']
}

export default WeatherIcon
