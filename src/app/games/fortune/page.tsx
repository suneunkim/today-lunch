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
const COLORS = [
  { name: '주황', hex: '#F47A3A' }, { name: '노랑', hex: '#F5C400' }, { name: '초록', hex: '#2E9E6B' }, { name: '하늘색', hex: '#5AA9E6' },
  { name: '남색', hex: '#2B3A67' }, { name: '빨강', hex: '#D7373F' }, { name: '분홍', hex: '#F28CB1' }, { name: '흰색', hex: '#FFFFFF' },
  { name: '갈색', hex: '#8B5E3C' }, { name: '보라', hex: '#7B5EA7' },
]
const DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '길 건너편', '한 블록 더 걸어간 곳', '늘 가던 골목']
const ZODIAC = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지']
const ZODIAC_LINES = [
  '먼저 메뉴를 제안하면 모두가 따라옵니다.',
  '서두르지 않아도 좋은 자리가 납니다.',
  '오늘은 새로운 식당에 도전해 볼 만합니다.',
  '함께 먹는 사람 덕에 밥맛이 좋아집니다.',
  '욕심내서 시킨 사이드가 신의 한 수가 됩니다.',
  '조용히 혼자 먹는 점심에 복이 있습니다.',
  '빨리 움직이면 웨이팅을 피합니다.',
  '양보한 메뉴가 의외로 입에 맞습니다.',
  '즉흥적으로 고른 메뉴가 정답입니다.',
  '꼼꼼히 리뷰를 본 보람이 있는 날입니다.',
  '단골집에 가면 서비스가 나올 운입니다.',
  '든든하게 먹을수록 오후가 잘 풀립니다.',
]

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

type Fortune = {
  stars: number
  message: string
  caution: string
  color: (typeof COLORS)[number]
  direction: string
  number: number
  zodiacLines: string[] // 띠 12개 각각의 한마디 (오늘 날짜 기준)
  menu: MenuType
}

const Page = () => {
  const [fortune, setFortune] = useState<Fortune | null>(null)
  const [opened, setOpened] = useState(false)
  const [approved, setApproved] = useState(false)
  const [zodiac, setZodiac] = useState('')
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
      color: pick(COLORS),
      direction: pick(DIRECTIONS),
      number: 1 + Math.floor(rand() * 9),
      zodiacLines: [...ZODIAC_LINES].sort(() => rand() - 0.5),
      menu: pick(pool.length ? pool : 해장제외전체),
    })
    setOpened(getFlag('fortuneOpened') === today)
    setZodiac(getFlag('zodiac'))
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
            <p className='text-label2 text-customs-gray-50 mt-2 mb-6'>운세는 하루에 한 번, 매일 새로 나옵니다. (재미로만 봐 주세요)</p>
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
                <dt className='text-customs-gray-50'>행운의 색</dt>
                <dd className='flex items-center gap-2'>
                  <span className='w-4 h-4 rounded-full border border-customs-gray-90' style={{ background: fortune.color.hex }} />
                  {fortune.color.name}
                </dd>
                <dt className='text-customs-gray-50'>행운의 숫자</dt>
                <dd>{fortune.number}</dd>
                <dt className='text-customs-gray-50'>길한 방향</dt>
                <dd>{fortune.direction}에 있는 식당</dd>
                <dt className='text-customs-gray-50'>오늘의 주의</dt>
                <dd>{fortune.caution}</dd>
              </dl>

              {/* 띠별 한마디: 띠는 한 번 고르면 기억합니다 */}
              <div className='mt-6 pt-5 border-t border-customs-gray-95'>
                <p className='text-label1 text-customs-gray-25 mb-2'>띠별 한마디</p>
                <div className='flex flex-wrap gap-[6px]'>
                  {ZODIAC.map((animal) => (
                    <button
                      key={animal}
                      onClick={() => {
                        setZodiac(animal)
                        setFlag('zodiac', animal)
                      }}
                      className={`px-[10px] py-[5px] rounded-full text-caption1 border ${
                        zodiac === animal
                          ? 'border-customs-orange-50 bg-customs-orange-95-bg text-customs-orange-50'
                          : 'border-customs-gray-90 text-customs-gray-25'
                      }`}
                    >
                      {animal}
                    </button>
                  ))}
                </div>
                {zodiac && (
                  <p className='text-label2 text-customs-gray-10 mt-3'>
                    <b>{zodiac}띠</b> · {fortune.zodiacLines[ZODIAC.indexOf(zodiac)]}
                  </p>
                )}
              </div>

              <div className='flex gap-[10px] mt-6'>
                <ShareButton
                  label='운세 공유하기'
                  text={`[${m}월 ${d}일 점심 운세] ${'★'.repeat(fortune.stars)}\n${fortune.message}\n행운의 메뉴: ${fortune.menu.name} · 행운의 색: ${fortune.color.name}\n- 먹대리 드림`}
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
