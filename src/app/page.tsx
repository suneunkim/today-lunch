import Button from '@/components/elements/Button'
import Footer from '@/components/Footer'

export default function Start() {
  return (
    <div className='min-w-[360px] max-w-[480px] mx-auto'>
      <section className='w-full h-[703px] pl-10 pt-10 tablet:pl-[100px] bg-customs-orange-50 text-customs-gray-100 flex flex-col gap-[10px] relative rounded-b-3xl overflow-hidden'>
        <h1 className='font-paperlogy whitespace-pre-line text-[40px] font-bold leading-[1.2]'>
          오늘{'\n'}점심은{'\n'}먹대리가
        </h1>
        <h2 className='text-heading1'>점심메뉴 고르기</h2>
        <Button
          type='primary'
          className='max-w-[155px] font-paperlogy mt-[28px] z-10'
          aria-label='점심 메뉴 추천 시작하기'
        >
          GO START
        </Button>
        <article className='w-[1000px] z-10 absolute left-[-165px] tablet:left-[-105px] bottom-[-170px]'>
          <img src='start-image.png' alt='먹대리 사원증' />
        </article>
        {/* 배경 도형 */}
        <svg
          className='absolute top-0 left-0'
          width='480'
          height='703'
          viewBox='0 0 480 703'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          xmlnsXlink='http://www.w3.org/1999/xlink'
        >
          <g style={{ mixBlendMode: 'plus-lighter' }}>
            <rect x='0.134155' width='480.294' height='703' fill='url(#pattern0_674_1984)' />
          </g>
          <defs>
            <pattern
              id='pattern0_674_1984'
              patternContentUnits='objectBoundingBox'
              width='0.572566'
              height='0.391181'
            >
              <use xlinkHref='#image0_674_1984' transform='scale(0.00138972 0.000949468)' />
            </pattern>
            <image
              id='image0_674_1984'
              width='412'
              height='412'
              xlinkHref='data:image/png;base64,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'
            />
          </defs>
        </svg>
      </section>
      <section className='p-5'>
        <div className='flex items-center justify-center bg-customs-gray-95 rounded-[100px] h-[41px] text-body1Normal text-customs-gray-25'>
          누적 이용자 수 0명
        </div>
        <div className='text-center py-10'>서비스 소개 수록 예정</div>
      </section>
      <Footer />
    </div>
  )
}
