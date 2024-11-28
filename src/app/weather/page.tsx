import Container from '@/components/Container'
import WeatherContent from '@/components/features/weather/WeatherContent'
import { getWeatherByCity } from '@/lib/weatherService'
import KakaoShareButton from '@/components/KakaoShareButton'

type Params = Promise<{ city: string }>

// @ts-ignore - Next.js page prop type mismatch in app router
const page = async ({ searchParams }: { searchParams: Params }) => {
  const { city } = (await searchParams) ?? 'Seoul'

  const weatherData = await getWeatherByCity(city)

  return (
    <Container title='날씨 맞춤 메뉴'>
      <div className='flex flex-col gap-6 mt-6 mb-[147px] px-5'>
        <WeatherContent weatherData={weatherData} />

        <KakaoShareButton page='weather' />
      </div>
    </Container>
  )
}

export default page
