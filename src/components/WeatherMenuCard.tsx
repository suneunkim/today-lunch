import { MenuType } from '@/types/types'

interface Props {
  type: 'orange' | 'gray'
  index?: number
  menu: MenuType
}

const WeatherMenuCard = ({ type, index, menu }: Props) => {
  const orangeBaseStyles = 'w-full h-[154px] px-4 py-6 rounded-[10px] flex flex-col gap-3'
  const grayBaseStyles =
    'w-full h-[82px] px-5 py-4 rounded-[10px] flex flex-col gap-2 bg-customs-gray-95'

  const styles = {
    basic: 'bg-customs-orange-95-bg text-customs-gray-25',
    first: 'bg-customs-orange-55 text-customs-gray-100',
  }

  const classNames = `
  ${type === 'orange' ? orangeBaseStyles : grayBaseStyles}
  ${type === 'orange' ? (index === 0 ? styles.first : styles.basic) : ''}
  `

  return (
    <div className={classNames}>
      <div className='font-paperlogy text-headline3'>{menu.name}</div>
      <div className='text-label2'>
        {type === 'orange' ? (
          <div className='line-clamp-3'>{menu.description}</div>
        ) : (
          <div className='line-clamp-3'>{menu.shortDescription}</div>
        )}
      </div>
    </div>
  )
}

export default WeatherMenuCard
