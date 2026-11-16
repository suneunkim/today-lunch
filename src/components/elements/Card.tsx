interface Props {
  title?: string
  children: React.ReactNode
  className?: string
}

// 흰 종이 느낌의 기본 카드
const Card = ({ title, children, className = '' }: Props) => {
  return (
    <section className={`px-6 py-7 bg-customs-gray-100 rounded-[20px] ${className}`}>
      {title && <h4 className='text-headline2 font-paperlogy text-customs-gray-10 mb-4'>{title}</h4>}
      {children}
    </section>
  )
}

export default Card
