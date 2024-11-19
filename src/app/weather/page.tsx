import Container from '@/components/Container'
import WeatherContent from '@/components/features/weather/WeatherContent'
import Button from '@/components/elements/Button'
import { getWeatherByCity } from '@/lib/weatherService'

type Params = Promise<{ city: string }>

// @ts-ignore - Next.js page prop type mismatch in app router
const page = async ({ searchParams }: { searchParams: Params }) => {
  const { city } = (await searchParams) ?? 'Seoul'

  const weatherData = await getWeatherByCity(city)

  return (
    <Container title='날씨 맞춤 메뉴'>
      <div className='flex flex-col gap-6 mt-6 mb-[147px] px-5'>
        <WeatherContent weatherData={weatherData} />
        <Button type='ghost'>페이지 공유하기</Button>
      </div>
    </Container>
  )
}

export default page
