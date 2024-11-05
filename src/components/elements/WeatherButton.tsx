import BasicIcon from './BasicIcon'
import EmojiIcon from './EmojiIcon'

interface Props {
  iconName: '날씨' | '메뉴' | '리뷰'
  smallWeather?: boolean
  onClick?: () => void
}

const WeatherButton = ({ iconName, smallWeather, onClick }: Props) => {
  const baseStyles = `
  ${smallWeather ? 'py-3' : 'py-7'}
  w-full px-6 text-customs-gray-10 text-body1Normal flex justify-between items-center rounded-[20px]
  `

  const styles = {
    날씨: `${smallWeather ? 'bg-[#CDC8B8] text-customs-gray-25' : 'bg-customs-green-70'}`,
    메뉴: 'bg-customs-yellow-70',
    리뷰: 'bg-[#68FBDE]',
  }

  const ButtonText = {
    날씨: '날씨에 어울리는 메뉴는?',
    메뉴: '등록되어 있는 메뉴 보러가기',
    리뷰: '코멘트 구경하러 가기',
  }

  const classNames = `
  ${baseStyles}
  ${styles[iconName]}
  `

  return (
    <button onClick={onClick} className={classNames}>
      <div className='flex justify-center items-center gap-2'>
        <EmojiIcon name={iconName} />
        {ButtonText[iconName]}
      </div>
      <BasicIcon name='right' />
    </button>
  )
}

export default WeatherButton
