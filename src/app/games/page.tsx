import Link from 'next/link'
import Container from '@/components/Container'
import TextBubble from '@/components/elements/TextBubble'

const games = [
  { href: '/worldcup', emoji: '🏆', title: '메뉴 월드컵', desc: '국룰 점심 메뉴 토너먼트와 역대 우승 순위' },
  { href: '/games/fortune', emoji: '🥠', title: '오늘의 점심 운세', desc: '하루 한 번, 먹대리가 봐 드리는 점심운' },
  { href: '/games/tap', emoji: '🛎️', title: '스피드 주문받기', desc: '밀려드는 주문을 메뉴판에서 빨리 찾아 누르기 · 오늘의 랭킹' },
  { href: '/games/timing', emoji: '⏰', title: '점심시간 10초 전', desc: '12시 정각에 딱 맞춰 버튼 누르기 · 내기 가능' },
]

const page = () => {
  return (
    <Container title='먹대리 휴게실'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-4 min-h-[calc(100vh-48px)]'>
        <section className='rounded-[20px] bg-customs-gray-100 px-5 pt-5 pb-4 flex justify-between items-end'>
          <div>
            <TextBubble bubbleTail={false} color='gray' text='잠깐 쉬었다 하시죠.' />
            <TextBubble bubbleTail={true} color='gray' text='한 판 하고 가시죠.' />
          </div>
          <img className='w-[96px] h-[90px] object-contain' src='/comment.png' alt='먹대리' />
        </section>
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className='bg-customs-gray-100 rounded-[20px] px-5 py-5 flex items-center gap-4'
          >
            <span className='text-[34px] leading-none'>{game.emoji}</span>
            <span className='flex flex-col gap-1'>
              <span className='text-headline2 font-paperlogy text-customs-gray-10'>{game.title}</span>
              <span className='text-caption1 text-customs-gray-50'>{game.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </Container>
  )
}

export default page
