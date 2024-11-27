import Link from 'next/link'
import BasicIcon from './BasicIcon'
import EmojiIcon from './EmojiIcon'

interface Props {
  iconName: '날씨' | '리뷰' | '맛집'
  smallWeather?: boolean
  onClick?: () => void
  recommendedMenu?: string
}

const WeatherButton = ({ iconName, smallWeather, onClick, recommendedMenu }: Props) => {
  const baseStyles = `
  ${smallWeather ? 'py-3' : 'py-7'}
  w-full px-6 text-customs-gray-10 text-body1Normal flex justify-between items-center rounded-[20px]
  `

  const styles = {
    날씨: `${smallWeather ? 'bg-[#CDC8B8] text-customs-gray-25' : 'bg-customs-green-70'}`,
    리뷰: 'bg-[#68FBDE]',
    맛집: 'bg-customs-yellow-70',
  }

  const ButtonText = {
    날씨: '지금 날씨에 어울리는 메뉴는?',
    리뷰: '코멘트 구경하러 가기',
    맛집: '카카오맵에서 맛집 찾으러 가기',
  }

  const classNames = `
  ${baseStyles}
  ${styles[iconName]}
  `

  const navigattionPaths = {
    날씨: '/weather',
    리뷰: '/comment',
    맛집: `https://map.kakao.com/?q=${recommendedMenu ? recommendedMenu : '맛집'}`,
  }

  const path = navigattionPaths[iconName]

  // 공통 button JSX

  const buttonContent = (
    <button onClick={onClick} className={classNames}>
      <div className='flex justify-center items-center gap-2'>
        <EmojiIcon name={iconName} />
        {ButtonText[iconName]}
      </div>
      <BasicIcon name='right' />
    </button>
  )

  return iconName === '맛집' ? (
    <a href={path} target='_blank' rel='noopener noreferrer'>
      {buttonContent}
    </a>
  ) : (
    <Link href={path}>{buttonContent}</Link>
  )
}

export default WeatherButton
