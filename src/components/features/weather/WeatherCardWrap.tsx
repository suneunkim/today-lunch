import WeatherMenuCard from '@/components/WeatherMenuCard'
import { MenuType, WeatherCategoryType } from '@/types/types'

interface Props {
  data: MenuType[]
  type: 'orange' | 'gray'
  title: WeatherCategoryType
}

const WeatherCardWrap = ({ data, type, title }: Props) => {
  const styles = {
    container: type === 'orange' ? '' : '',
    section: type === 'orange' ? 'grid grid-cols-2 gap-[10px]' : 'flex flex-col gap-[10px]',
  }

  const titleMapping = {
    cold: '쌀쌀한 날엔 바로 이 메뉴!',
    hot: '더운 날에 어울리는 메뉴!',
    rain: '비가 오는 날엔 이 메뉴!',
    snow: '눈 내리는 날엔 따뜻한 메뉴!',
    clear: '언제 먹어도 좋은 메뉴!',
    mild: '어떤 날에도 맛있는 메뉴!',
  }

  return (
    <div className={styles.container}>
      <h3 className='text-heading3 mb-3 text-customs-gray-10'>{titleMapping[title]}</h3>
      <section className={styles.section}>
        {data.map((menu, i) => (
          <WeatherMenuCard key={i} type={type} menu={menu} index={i} />
        ))}
      </section>
    </div>
  )
}

export default WeatherCardWrap
