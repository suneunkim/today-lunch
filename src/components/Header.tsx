import { HeaderTitleType } from '@/types/types'
import HeaderAction from './elements/HeaderAction'

interface Props {
  title: HeaderTitleType
  onlyTitle?: boolean
  hideSettings?: boolean
}

const Header = ({ title, onlyTitle = false, hideSettings = false }: Props) => {
  return (
    <div
      style={{ width: 'calc(100% - 40px)', maxWidth: 440 }}
      className={`
      fixed top-0 flex items-center px-5 bg-customs-gray-100 box-content h-12 pt-[env(safe-area-inset-top,0px)] text-body1Normal z-20
      justify-between
      `}
    >
      {/* 제목만 있는 화면(홈)에서도 오른쪽에는 설정 버튼을 둡니다. */}
      {onlyTitle ? <span className='w-6' /> : <HeaderAction name='left' />}
      <div>{title}</div>
      {hideSettings ? <span className='w-6' /> : <HeaderAction name='settings' />}
    </div>
  )
}

export default Header
