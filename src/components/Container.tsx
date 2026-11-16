import { HeaderTitleType } from '@/types/types'
import BottomNav from './BottomNav'
import Header from './Header'

interface Props {
  isHeader?: boolean
  title: HeaderTitleType
  onlyTitle?: boolean
  nav?: boolean // 하단 탭 표시 여부
  children: React.ReactNode
}

const Container = ({ isHeader = true, title, onlyTitle = false, nav = true, children }: Props) => {
  return (
    <div className='min-w-[360px] max-w-[480px] mx-auto'>
      {isHeader && <Header title={title} onlyTitle={onlyTitle} hideSettings={!nav} />}
      {isHeader && <div className='h-[calc(48px+env(safe-area-inset-top,0px))] bg-customs-gray-100' />}
      {children}
      {nav && <BottomNav />}
    </div>
  )
}

export default Container
