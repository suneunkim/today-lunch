import { HeaderTitleType } from '@/types/types'
import Footer from './Footer'
import Header from './Header'

interface Props {
  isHeader?: boolean
  title: HeaderTitleType
  onlyTitle?: boolean
  children: React.ReactNode
}

const Container = ({ isHeader = true, title, onlyTitle = false, children }: Props) => {
  return (
    <div className='min-w-[360px] max-w-[480px] mx-auto'>
      {isHeader && <Header title={title} onlyTitle={onlyTitle} />}
      {isHeader && <div className='pt-12' />}
      {children}
      <Footer />
    </div>
  )
}

export default Container
