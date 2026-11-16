import Link from 'next/link'

const items = [
  { href: '/slot', emoji: '🎰', title: '먹대리 전결', desc: '고민 없이 한 방에 결정' },
  { href: '/weekly', emoji: '🗓️', title: '주간 점심 계획서', desc: '월~금 메뉴 미리 짜기' },
  { href: '/office', emoji: '💳', title: '점심 회의실', desc: '누가 쏠까 · N빵 계산' },
  { href: '/history', emoji: '🗂️', title: '결재 문서함', desc: '내가 먹은 점심 기록' },
]

// 홈 화면 아래의 "업무 바로가기"
const DeskMenu = () => {
  return (
    <section>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-heading3 font-paperlogy text-customs-gray-10'>먹대리 업무 바로가기</h3>
        <Link href='/settings' className='text-label1 text-customs-gray-25 underline'>
          설정
        </Link>
      </div>
      <div className='grid grid-cols-2 gap-[10px]'>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='bg-customs-gray-100 rounded-[20px] px-4 py-5 flex flex-col gap-2'
          >
            <span className='text-[28px] leading-none'>{item.emoji}</span>
            <span className='text-headline3 font-paperlogy text-customs-gray-10'>{item.title}</span>
            <span className='text-caption1 text-customs-gray-50'>{item.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default DeskMenu
