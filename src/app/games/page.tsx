'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Container from '@/components/Container'
import TextBubble from '@/components/elements/TextBubble'
import { dateKey, getFlag } from '@/lib/storage'

const games = [
  { key: 'worldcup', href: '/worldcup', emoji: '🏆', color: '#FFE9A8', title: '메뉴 월드컵', desc: '국룰 점심 메뉴 토너먼트와 역대 우승 순위' },
  { key: 'fortune', href: '/games/fortune', emoji: '🥠', color: '#FFD6E6', title: '오늘의 점심 운세', desc: '하루 한 번, 먹대리가 봐 드리는 점심운' },
  { key: 'order', href: '/games/tap', emoji: '🛎️', color: '#CFE6FF', title: '스피드 주문받기', desc: '밀려드는 주문을 메뉴판에서 빨리 찾아 누르기' },
  { key: 'timing', href: '/games/timing', emoji: '⏰', color: '#D5F0C2', title: '점심시간 10초 전', desc: '12시 정각에 딱 맞춰 버튼 누르기 · 내기 가능' },
]

const sec = (ms: number) => (ms / 1000).toFixed(2)

const Page = () => {
  // 게임마다 오늘의 상태(안 본 운세, 남은 도전, 최고 기록)를 작게 보여 줍니다.
  const [status, setStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    const today = dateKey()
    const tries = Number(getFlag(`orderTries:${today}`)) || 0
    const orderBest = Number(getFlag('orderBest'))
    const timingBest = Number(getFlag('timingBest'))
    setStatus({
      fortune: getFlag('fortuneOpened') === today ? '오늘 운세 확인 완료' : '오늘 운세 도착!',
      order: `오늘 남은 도전 ${Math.max(0, 3 - tries)}번${orderBest ? ` · 최고 ${sec(orderBest)}초` : ''}`,
      timing: timingBest ? `최고 기록 오차 ${sec(timingBest)}초` : '',
    })
  }, [])

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
            className='bg-customs-gray-100 rounded-[20px] px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform'
          >
            <span
              className='w-[60px] h-[60px] shrink-0 rounded-[18px] flex items-center justify-center text-[30px] leading-none'
              style={{ background: game.color }}
            >
              {game.emoji}
            </span>
            <span className='flex flex-col gap-1 min-w-0'>
              <span className='text-headline2 font-paperlogy text-customs-gray-10'>{game.title}</span>
              <span className='text-caption1 text-customs-gray-50'>{game.desc}</span>
              {status[game.key] && (
                <span className='text-caption1 font-bold text-customs-orange-50'>{status[game.key]}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </Container>
  )
}

export default Page
