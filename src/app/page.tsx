import Button from '@/components/elements/Button'
import OutlinedButton from '@/components/elements/OutlinedButton'
import WeatherButton from '@/components/elements/WeatherButton'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import WeatherMenuCard from '@/components/WeatherMenuCard'

export default function Start() {
  return (
    <div className='min-w-[360px] max-w-[480px] mx-auto'>
      <Header title='오늘 점심은 먹대리가' onlyTitle={true} />
      <main className='flex flex-col gap-2 items-center pt-12 bg-customs-beige-85'>
        <div className=''>프리텐다드 레귤러</div>
        <div className='font-paperlogy'>페이퍼로지 레귤러</div>
        <div className='font-paperlogy font-semibold'>페이퍼로지 세미볼드</div>
        <div className='font-paperlogy font-bold'>페이퍼로지 볼드</div>
        <Button type='primary'>버튼2</Button>
        <Button type='secondary'>버튼2</Button>
        <Button type='ghost'>버튼2</Button>
        <WeatherButton iconName='날씨' smallWeather={true} />
        <WeatherButton iconName='리뷰' />
        <WeatherButton iconName='날씨' />
      </main>
      <div className='flex flex-col gap-[4px] '>
        <OutlinedButton type='selected' name='양식' all={true} />
        <div className='flex gap-[4px]'>
          <OutlinedButton type='outlined' name='양식' />
          <OutlinedButton type='outlined' name='양식' />
          <OutlinedButton type='outlined' name='양식' />
        </div>
        <div className='flex  gap-[4px]'>
          <OutlinedButton type='outlined' name='양식' />
          <OutlinedButton type='outlined' name='양식' />
          <OutlinedButton type='outlined' name='양식' />
        </div>
        <div className='flex  gap-[4px]'>
          <OutlinedButton type='outlined' name='양식' />
          <OutlinedButton type='outlined' name='양식' />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-[10px]'>
        {Array.from({ length: 4 }).map((_, i) => (
          <WeatherMenuCard key={i} type='orange' index={i} />
        ))}
      </div>
      <div className='flex gap-[10px] overflow-x-auto'>
        {Array.from({ length: 4 }).map((_, i) => (
          <WeatherMenuCard key={i} type='gray' index={i} />
        ))}
      </div>
      <Button type='ghost'>페이지 공유하기</Button>

      <Footer />
    </div>
  )
}
