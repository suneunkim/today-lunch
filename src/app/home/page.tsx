import Container from '@/components/Container'
import WeatherButton from '@/components/elements/WeatherButton'
import Button from '@/components/elements/Button'
import HomeClient from '@/components/clientComponents/HomeClient'

const page = () => {
  const styles = {
    speechBubble:
      'px-[14px] py-[10px] text-body1Normal text-customs-gray-25 bg-customs-gray-95 rounded-[20px] inline-block w-auto',
    speechBubbleTail:
      'absolute h-[15px] w-[15px] bg-customs-gray-95 -rotate-45 rounded-[3px] left-[21px] -bottom-[5px]',
  }

  return (
    <Container title='오늘 점심은 먹대리가' onlyTitle={true}>
      <div className='bg-customs-beige-85 flex flex-col gap-5 p-5'>
        <WeatherButton iconName='날씨' smallWeather={true} />
        <section className='w-full rounded-[20px] bg-customs-gray-100 flex flex-col justify-between pb-6'>
          <div className='pt-5 pl-5 tablet:pl-20'>
            <p className={styles.speechBubble}>안녕하세요, 점메추1팀 먹대리입니다.</p>
            <p className={`${styles.speechBubble} mt-[6px] relative`}>
              메뉴 제안드리겠습니다!
              <span className={styles.speechBubbleTail} />
            </p>
          </div>
          <div className='mt-[11px] flex justify-end pr-[14px] tablet:pr-[78px]'>
            <img className='w-[168px] h-[122px]' src='mukdaeri.png' alt='먹대리 일하는 모습' />
          </div>
        </section>
        <HomeClient />
        <Button type='primary'>점심메뉴 제안받기</Button>
      </div>
    </Container>
  )
}

export default page
