'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import DocTitle from '@/components/elements/DocTitle'
import { getFlag, setFlag } from '@/lib/storage'

const GOOD = [
  '점심 김치찌개 품의', '법카 점심 결제 요청', '칼퇴 신청서', '연차 사용 신청', '간식비 지원 요청',
  '점심시간 30분 연장안', '금요일 조기 퇴근안', '회식 대신 점심 회식 품의', '커피머신 교체 요청', '재택근무 신청서',
  '탕비실 과자 보충 요청', '점심 메뉴 제안서', '워크숍 대신 휴가 지급안',
]
const BAD = [
  '야근 신청서', '주말 출근 요청', '회식 3차 품의', '월요일 7시 조찬 회의', '점심시간 단축안',
  '금요일 오후 6시 회의 소집', '연차 반려 통보', '휴일 워크숍 계획서', '탕비실 폐쇄안', '퇴근 후 단체 등산 품의',
  '점심 도시락 의무화안', '새벽 6시 출근제 도입안',
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
    ? '결재의 달인. 임원 승진을 축하드립니다.'
    : score >= 20
    ? '유능한 팀장님. 결재판이 깨끗합니다.'
    : score >= 12
    ? '무난한 대리. 서류는 좀 더 꼼꼼히 봐 주세요.'
    : '수습 사원. 야근 신청서에 도장 찍으시면 안 됩니다…'

// 결재 도장 찍기: 좋은 서류는 승인, 나쁜 서류는 반려. 20초 동안 최대한 많이.
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
            <div className='text-caption1 text-customs-gray-50'>처리한 서류</div>
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
            <DocTitle>{phase === 'done' ? '근무 평가서' : '결재 서류'}</DocTitle>
            {phase === 'idle' && (
              <p className='text-body2 text-customs-gray-25 mt-6'>
                20초 동안 서류가 쏟아집니다. 직원들이 좋아할 서류는 <b>승인</b>, 싫어할 서류는 <b>반려</b>하세요.
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
            {phase === 'done' ? '다시 출근하기' : '결재 시작'}
          </Button>
        )}
      </div>
    </Container>
  )
}

export default Page
