import BasicIcon from './elements/BasicIcon'

interface Props {
  title: '오늘 점심은 먹대리가' | '결과' | '날씨 맞춤 메뉴'
  onlyTitle?: boolean
}

const Header = ({ title, onlyTitle = false }: Props) => {
  return (
    <div
      className={`
      fixed flex items-center px-5 bg-customs-gray-100 h-12 max-w-[480px] w-full text-body1Normal
      ${onlyTitle ? 'justify-center' : 'justify-between'}
      `}
    >
      {onlyTitle ? (
        <div className=''>{title}</div>
      ) : (
        <>
          <BasicIcon name='left' />
          <div>{title}</div>
          <BasicIcon name='home' />{' '}
        </>
      )}
    </div>
  )
}

export default Header
