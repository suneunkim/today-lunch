import { Suspense } from 'react'
import Container from '@/components/Container'
import WeatherPageClient from '@/components/clientComponents/WeatherPageClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '날씨 맞춤 메뉴 - 오늘 점심은 먹대리가',
  description: '오늘 날씨와 어울리는 메뉴를 확인해보세요!',
}

const page = () => {
  return (
    <Container title='날씨 맞춤 메뉴'>
      <div className='flex flex-col gap-6 pt-6 pb-[147px] px-5 bg-customs-gray-100 min-h-[70vh]'>
        <Suspense fallback={null}>
          <WeatherPageClient />
        </Suspense>
      </div>
    </Container>
  )
}

export default page
