import { HeaderTitleType } from '@/types/types'
import HeaderAction from './elements/HeaderAction'

interface Props {
  title: HeaderTitleType
  onlyTitle?: boolean
}

const Header = ({ title, onlyTitle = false }: Props) => {
  return (
    <div
      style={{ width: 'calc(100% - 40px)', maxWidth: 440 }}
      className={`
      fixed top-0 flex items-center px-5 bg-customs-gray-100 box-content h-12 pt-[env(safe-area-inset-top,0px)] text-body1Normal z-20
      ${onlyTitle ? 'justify-center' : 'justify-between'}
      `}
    >
      {onlyTitle ? (
        <div className=''>{title}</div>
      ) : (
        <>
          <HeaderAction name='left' />
          <div>{title}</div>
          <HeaderAction name='home' />
        </>
      )}
    </div>
  )
}

export default Header
