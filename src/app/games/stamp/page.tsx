'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import DocTitle from '@/components/elements/DocTitle'
import { getFlag, setFlag } from '@/lib/storage'

// 승인할 것: 반가운 점심 소식 / 반려할 것: 피하고 싶은 점심 상황
const GOOD = [
  '줄 없는 맛집 발견', '반찬 무한 리필', '친구가 쏜다는 제안', '공깃밥 서비스', '오늘의 메뉴 반값 할인',
  '창가 자리 비어 있음', '음식 5분 만에 나옴', '사장님의 계란프라이 서비스', '식후 커피 쿠폰 당첨', '국물 리필 무료',
  '새로 생긴 식당 오픈 할인', '곱빼기 무료 업그레이드', '딱 한 자리 남은 맛집 입장',
]
const BAD = [
  '웨이팅 30분', '어제 먹은 메뉴 또 먹기', '“아무거나” 라는 대답', '재료 소진으로 주문 불가', '메뉴 정하는 데 20분',
  '흰 옷 입고 짬뽕', '카드 두고 나옴', '식당 정기 휴무일', '다 먹었는데 머리카락 발견', '혼자 남기고 다 가버림',
  '더치페이인데 혼자 제일 비싼 메뉴', '점심시간 5분 남기고 음식 나옴',
]

const DURATION = 20
type Doc = { title: string; good: boolean; id: number }
const newDoc = (id: number): Doc => {
  const good = Math.random() < 0.55
  const list = good ? GOOD : BAD
  return { title: list[Math.floor(Math.random() * list.length)], good, id }
}

const grade = (score: number) =>
  score >= 28
    ? '점심 결정의 달인. 메뉴 고민은 이분께 맡기면 됩니다.'
    : score >= 20
    ? '믿고 따라가는 맛잘알. 판단이 빠르고 정확합니다.'
    : score >= 12
    ? '무난한 점심 메이트. 조금만 더 꼼꼼히 봐 주세요.'
    : '웨이팅 30분에 도장을 찍으시면 안 됩니다…'

// 결재 도장 찍기: 반가운 점심 소식은 승인, 피하고 싶은 상황은 반려. 20초 동안 최대한 많이.
const Page = () => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [doc, setDoc] = useState<Doc>(newDoc(0))
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(DURATION)
  const [feedback, setFeedback] = useState<'ok' | 'no' | ''>('')
  const [best, setBest] = useState(0)
  const endAt = useRef(0)
  const scoreRef = useRef(0)

  useEffect(() => setBest(Number(getFlag('stampBest')) || 0), [])

  useEffect(() => {
    if (phase !== 'playing') return
    const timer = setInterval(() => {
      const remain = Math.max(0, (endAt.current - Date.now()) / 1000)
      setLeft(remain)
      if (remain <= 0) {
        clearInterval(timer)
        setPhase('done')
        if (scoreRef.current > Number(getFlag('stampBest') || 0)) {
          setFlag('stampBest', String(scoreRef.current))
          setBest(scoreRef.current)
        }
      }
    }, 100)
    return () => clearInterval(timer)
  }, [phase])

  const start = () => {
    scoreRef.current = 0
    setScore(0)
    setLeft(DURATION)
    setDoc(newDoc(1))
    endAt.current = Date.now() + DURATION * 1000
    setPhase('playing')
  }

  const judge = (approve: boolean) => {
    if (phase !== 'playing') return
    const correct = approve === doc.good
    scoreRef.current = Math.max(0, scoreRef.current + (correct ? 1 : -2))
    setScore(scoreRef.current)
    setFeedback(correct ? 'ok' : 'no')
    setTimeout(() => setFeedback(''), 180)
    setDoc(newDoc(doc.id + 1))
  }

  return (
    <Container title='결재 도장 찍기'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-5 min-h-[calc(100vh-48px)]'>
        <div className='flex justify-between items-end'>
          <div>
            <div className='text-caption1 text-customs-gray-50'>처리한 안건</div>
            <div className='font-paperlogy font-bold text-[30px] text-customs-gray-10'>{score}건</div>
          </div>
          <div className='text-right'>
            <div className='text-caption1 text-customs-gray-50'>남은 시간</div>
            <div className='font-paperlogy font-bold text-[30px] text-customs-orange-50 tabular-nums'>{left.toFixed(1)}초</div>
          </div>
        </div>
        <div className='h-2 rounded-full bg-customs-gray-100'>
          <div className='h-2 rounded-full bg-customs-orange-50' style={{ width: `${(left / DURATION) * 100}%` }} />
        </div>

        <div className='relative'>
          <div className='absolute bg-[#D1C9BD] top-[-8px] right-[-8px] w-full h-full rounded-[20px]' />
          <section
            className={`relative px-6 py-7 rounded-[20px] min-h-[230px] transition-colors duration-150 ${
              feedback === 'ok' ? 'bg-customs-orange-95-bg' : feedback === 'no' ? 'bg-customs-gray-90' : 'bg-customs-gray-100'
            }`}
          >
            <DocTitle>{phase === 'done' ? '결재 실적 보고' : '점심 안건'}</DocTitle>
            {phase === 'idle' && (
              <p className='text-body2 text-customs-gray-25 mt-6'>
                20초 동안 점심 안건이 쏟아집니다. 반가운 소식은 <b>승인</b>, 피하고 싶은 상황은 <b>반려</b>하세요.
                <br />
                맞으면 +1건, 틀리면 −2건입니다.
              </p>
            )}
            {phase === 'playing' && (
              <div key={doc.id} className='reel-tick mt-8 text-center'>
                <p className='text-caption1 text-customs-gray-50'>제 {doc.id}호 안건</p>
                <h2 className='text-[26px] leading-[130%] font-bold font-paperlogy text-customs-gray-10 mt-2'>{doc.title}</h2>
              </div>
            )}
            {phase === 'done' && (
              <div className='mt-6 pop-in'>
                <h2 className='text-[26px] font-bold font-paperlogy text-customs-orange-50'>{score}건 처리</h2>
                <p className='text-body2 text-customs-gray-25 mt-2'>{grade(score)}</p>
                <p className='text-caption1 text-customs-gray-50 mt-2'>내 최고 기록: {best}건</p>
              </div>
            )}
          </section>
        </div>

        {phase === 'playing' ? (
          <div className='flex gap-[10px]'>
            <Button type='secondary' onClick={() => judge(false)}>
              반려
            </Button>
            <Button type='primary' onClick={() => judge(true)}>
              승인 도장 쾅
            </Button>
          </div>
        ) : (
          <Button type='primary' onClick={start}>
            {phase === 'done' ? '다시 도전' : '결재 시작'}
          </Button>
        )}
      </div>
    </Container>
  )
}

export default Page
