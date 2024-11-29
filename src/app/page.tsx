import Button from '@/components/elements/Button'
import Background from '@/components/features/start/Background'
import Footer from '@/components/Footer'
import ServiceClickCount from '@/components/features/start/ServiceClickCount'
import { getClickCount } from '@/lib/firebase/clickCount'
import { getAnalyticsData } from '@/lib/getAnalyticsData'
import Link from 'next/link'

export default async function Start() {
  const { totalUser } = await getAnalyticsData()
  const currentClickCount = await getClickCount()

  const count = totalUser.data.rows?.[0]?.metricValues?.[0]?.value || 0

  return (
    <div className='min-w-[360px] max-w-[480px] mx-auto bg-customs-gray-95'>
      <Background>
        <section className='flex justify-between'>
          <div className='flex flex-col gap-[10px] '>
            <h1 className='font-paperlogy whitespace-pre-line text-[40px] font-bold leading-[1.2]'>
              오늘{'\n'}점심은{'\n'}먹대리가
            </h1>
            <h2 className='text-heading1'>점심메뉴 고르기</h2>
            <Link href='/home' className='z-10'>
              <Button
                type='primary'
                className='max-w-[155px] font-paperlogy mt-[28px] z-10'
                aria-label='점심 메뉴 추천 시작하기'
              >
                GO START
              </Button>
            </Link>
          </div>
          <div>
            <ServiceClickCount count={currentClickCount} />
          </div>
        </section>
      </Background>
      <section className='p-5'>
        <div className='flex items-center justify-center bg-customs-gray-100 rounded-[100px] h-[41px] text-body1Normal text-customs-gray-25'>
          누적 이용자 수 {count}명
        </div>
      </section>

      {/* 하단 이미지 */}
      <article className='flex flex-col items-center mt-[43px] pb-[179px] '>
        <img
          className='w-[282px] h-[448px] object-contain'
          src='mukdaeri-backview.png'
          alt='먹대리의 일하는 뒷모습'
        />
      </article>
      <Footer />
    </div>
  )
}
