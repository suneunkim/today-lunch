import Footer from './Footer'
import Header from './Header'

interface Props {
  isHeader?: boolean
  title: '오늘 점심은 먹대리가' | '결과' | '날씨 맞춤 메뉴'
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
