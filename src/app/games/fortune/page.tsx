'use client'

import { useEffect, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import DocTitle from '@/components/elements/DocTitle'
import MapPanel from '@/components/features/map/MapPanel'
import ShareButton from '@/components/ShareButton'
import { 해장제외전체 } from '@/app/data/food'
import { trackPick } from '@/lib/firebase/stats'
import { addHistory, dateKey, getFlag, getPrefs, setFlag } from '@/lib/storage'
import { MenuType } from '@/types/types'

const MESSAGES = [
  '오전의 수고가 점심 한 끼로 보상받는 날입니다.',
  '줄 서는 집에 가도 금방 자리가 나는 운입니다.',
  '오늘은 평소 안 먹던 메뉴에 행운이 있습니다.',
  '누군가 사 줄 기운이 보입니다. 지갑은 천천히 꺼내세요.',
  '국물 한 숟갈에 오후가 술술 풀리는 날입니다.',
  '혼밥이 오히려 길한 날. 조용히 맛있게 드세요.',
  '메뉴 고민이 길어질 운입니다. 먹대리에게 맡기시죠.',
  '반찬 리필 운이 좋습니다. 당당하게 요청하세요.',
  '오늘의 선택이 이번 주 단골집이 될 수 있습니다.',
  '점심 후 커피까지 완벽하게 이어지는 흐름입니다.',
  '과식 주의보. 맛있어도 오후 일정을 기억하세요.',
  '매콤한 기운이 스트레스를 날려 주는 날입니다.',
  '먼 곳보다 가까운 식당에 복이 있습니다.',
  '계산대 앞에서 눈치 싸움에 이길 운입니다.',
]
const CAUTIONS = [
  '흰 셔츠에 국물 튐 주의',
  '“아무거나” 라고 답하기 주의',
  '후식 과소비 주의',
  '식후 졸음 주의',
  '메뉴 통일 압박 주의',
  '카드 두고 나오기 주의',
  '뜨거운 뚝배기 주의',
  '마늘·파 향 주의 (오후 약속)',
]
const SEATS = ['창가 자리', '입구에서 먼 구석 자리', '주방이 보이는 자리', '벽 쪽 자리', '바 자리', '에어컨 바람 안 오는 자리']

// 날짜와 기기 고유 숫자로 만드는 고정 난수 (같은 날에는 항상 같은 운세)
const seeded = (seed: string) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

type Fortune = { stars: number; message: string; caution: string; seat: string; menu: MenuType }

const Page = () => {
  const [fortune, setFortune] = useState<Fortune | null>(null)
  const [opened, setOpened] = useState(false)
  const [approved, setApproved] = useState(false)
  const today = dateKey()

  useEffect(() => {
    let device = getFlag('fortuneSeed')
    if (!device) {
      device = String(Math.random()).slice(2)
      setFlag('fortuneSeed', device)
    }
    const rand = seeded(today + device)
    const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]
    const prefs = getPrefs()
    const pool = 해장제외전체.filter(
      (menu) =>
        !prefs.dislikes.includes(menu.name) &&
        !(prefs.spicy === 'no' && menu.tags.includes('매운')) &&
        !prefs.avoid.some((tag) => menu.tags.includes(tag))
    )
    setFortune({
      stars: 3 + Math.floor(rand() * 3),
      message: pick(MESSAGES),
      caution: pick(CAUTIONS),
      seat: pick(SEATS),
      menu: pick(pool.length ? pool : 해장제외전체),
    })
    setOpened(getFlag('fortuneOpened') === today)
  }, [today])

  const open = () => {
    setOpened(true)
    setFlag('fortuneOpened', today)
  }

  const approve = () => {
    if (!fortune || approved) return
    setApproved(true)
    addHistory(fortune.menu.name)
    trackPick(fortune.menu.name)
  }

  const [, m, d] = today.split('-').map(Number)

  return (
    <Container title='오늘의 점심 운세'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-5 min-h-[calc(100vh-48px)]'>
        {!opened || !fortune ? (
          <section className='px-6 py-10 bg-customs-gray-100 rounded-[20px] flex flex-col items-center text-center'>
            <img className='w-[120px] h-[112px] object-contain' src='/comment.png' alt='먹대리' />
            <h2 className='text-heading3 font-paperlogy text-customs-gray-10 mt-5'>
              {m}월 {d}일 점심 운세가 도착했습니다.
            </h2>
            <p className='text-label2 text-customs-gray-50 mt-2 mb-6'>운세는 하루에 한 번, 매일 새로 나옵니다.</p>
            <Button type='primary' onClick={open} disabled={!fortune}>
              운세 열어보기
            </Button>
          </section>
        ) : (
          <>
            <section className='px-6 py-7 bg-customs-gray-100 rounded-[20px] pop-in'>
              <DocTitle>
                {m}월 {d}일 점심 운세
              </DocTitle>
              <p className='text-[26px] tracking-[4px] text-customs-orange-50 mt-6' aria-label={`별 ${fortune.stars}개`}>
                {'★'.repeat(fortune.stars)}
                <span className='text-customs-gray-90'>{'★'.repeat(5 - fortune.stars)}</span>
              </p>
              <p className='text-body1Reading text-customs-gray-10 mt-3'>{fortune.message}</p>

              <dl className='mt-6 grid grid-cols-[88px_1fr] gap-y-3 text-label2 text-customs-gray-25'>
                <dt className='text-customs-gray-50'>행운의 메뉴</dt>
                <dd>
                  <b className='text-body1Normal text-customs-orange-50'>{fortune.menu.name}</b>
                  <div className='text-caption1 text-customs-gray-50 mt-[2px]'>{fortune.menu.shortDescription}</div>
                </dd>
                <dt className='text-customs-gray-50'>행운의 자리</dt>
                <dd>{fortune.seat}</dd>
                <dt className='text-customs-gray-50'>오늘의 주의</dt>
                <dd>{fortune.caution}</dd>
              </dl>

              <div className='flex gap-[10px] mt-6'>
                <ShareButton
                  label='운세 공유하기'
                  text={`[${m}월 ${d}일 점심 운세] ${'★'.repeat(fortune.stars)}\n${fortune.message}\n행운의 메뉴: ${fortune.menu.name}\n- 먹대리 드림`}
                />
                <Button type='primary' className='!py-3 !rounded-[14px] !text-label1' onClick={approve} disabled={approved}>
                  {approved ? '결재 완료' : '행운의 메뉴로 결재'}
                </Button>
              </div>
            </section>
            <MapPanel menu={fortune.menu.name} />
          </>
        )}
      </div>
    </Container>
  )
}

export default Page
