import { Suspense } from 'react'
import Container from '@/components/Container'
import ResultClient from '@/components/clientComponents/ResultClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '메뉴 추천 결과 - 오늘 점심은 먹대리가',
  description: '추천받은 메뉴를 확인해보세요!',
}

const page = () => {
  return (
    <Container title='결과'>
      <Suspense fallback={<div className='min-h-screen bg-customs-orange-50' />}>
        <ResultClient />
      </Suspense>
    </Container>
  )
}

export default page
