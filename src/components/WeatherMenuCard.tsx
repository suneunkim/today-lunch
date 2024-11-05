interface Props {
  type: 'orange' | 'gray'
  index?: number
}

const WeatherMenuCard = ({ type, index }: Props) => {
  const orangeBaseStyles = 'w-full h-[154px] px-4 py-6 rounded-[10px] flex flex-col gap-3'
  const grayBaseStyles =
    'min-w-[108px] h-[140px] px-4 py-6 rounded-[10px] flex flex-col gap-4 bg-customs-gray-95'

  const styles = {
    basic: 'bg-customs-orange-95-bg text-customs-gray-25',
    first: 'bg-customs-orange-55 text-customs-gray-100',
  }

  const classNames = `
  ${type === 'orange' ? orangeBaseStyles : grayBaseStyles}
  ${type === 'orange' && index === 0 ? styles.first : styles.basic}
  `

  return (
    <div className={classNames}>
      <div className='text-headline3'>김치찌개</div>
      <div className='text-label2 '>
        {/* 매콤한 맛이 입맛을 돋우고, 뜨거운 국물로 속을 든든하게 채워줘 바쁜 오후에도 활력을 줄 수
        있습니다. */}
        칼칼하고 따듯한 국물
      </div>
    </div>
  )
}

export default WeatherMenuCard
