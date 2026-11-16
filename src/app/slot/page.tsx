'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Chip from '@/components/elements/Chip'
import DocTitle from '@/components/elements/DocTitle'
import Stamp from '@/components/Stamp'
import Clip from '@/components/features/result/Clip'
import MapPanel from '@/components/features/map/MapPanel'
import { MENUS } from '@/app/data/menus'
import { menu as categoryRows } from '@/app/data/data'
import { recommend } from '@/lib/recommend'
import { trackPick, trackUse } from '@/lib/firebase/stats'
import { addHistory } from '@/lib/storage'
import { MenuType } from '@/types/types'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

// 랜덤 뽑기: 고민 없이 메뉴 하나를 뽑아 바로 결재하는 화면 (슬롯머신)
const Page = () => {
  const [display, setDisplay] = useState('？？？')
  const [tick, setTick] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<MenuType | null>(null)
  const [approved, setApproved] = useState(false)
  const [category, setCategory] = useState('전체')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const spin = () => {
    if (spinning) return
    const [picked] = recommend({ categories: [category], count: 1, exclude: result ? [result.name] : [] })
    if (!picked) return
    setSpinning(true)
    setResult(null)
    setApproved(false)
    trackUse()

    // 처음엔 빠르게, 끝으로 갈수록 느리게 넘어가다가 멈춥니다.
    const total = 24
    const reel =
      category === '전체' ? MENUS : MENUS.filter((m) => m.cats.some((c) => c === category))
    const step = (i: number) => {
      if (i >= total) {
        setDisplay(picked.name)
        setTick((t) => t + 1)
        setResult(picked)
        setSpinning(false)
        return
      }
      setDisplay(reel[Math.floor(Math.random() * reel.length)].name)
      setTick((t) => t + 1)
      timer.current = setTimeout(() => step(i + 1), 60 + Math.pow(i, 2) * 0.55)
    }
    step(0)
  }

  const approve = () => {
    if (!result || approved) return
    setApproved(true)
    addHistory(result.name)
    trackPick(result.name)
  }

  return (
    <Container title='랜덤 뽑기'>
      <div className='p-5 pb-28 bg-customs-orange-50 min-h-[calc(100vh-48px)]'>
        <div className='relative mt-[16px]'>
          <Clip />
          {approved && <Stamp />}
          <div className='relative'>
            <div className='absolute bg-[#D1C9BD] top-[-8px] right-[-8px] w-full h-full rounded-[20px]' />
            <section className='relative px-[24px] py-[28px] bg-customs-gray-100 rounded-[20px]'>
              <DocTitle>긴급 메뉴 뽑기</DocTitle>
              <dl className='mt-5 text-label2 text-customs-gray-25 grid grid-cols-[64px_1fr] gap-y-1'>
                <dt className='text-customs-gray-50'>기안일</dt>
                <dd>{today()}</dd>
                <dt className='text-customs-gray-50'>기안자</dt>
                <dd>점메추1팀 먹대리</dd>
                <dt className='text-customs-gray-50'>사유</dt>
                <dd>고민할 시간에 한 숟갈이라도 더 뜨기 위함</dd>
              </dl>

              <div className='mt-5 h-[108px] rounded-[14px] bg-customs-orange-95-bg flex items-center justify-center overflow-hidden px-3'>
                <span
                  key={tick}
                  className={`reel-tick font-paperlogy font-bold text-center text-[28px] leading-[120%] ${
                    result ? 'text-customs-orange-50' : 'text-customs-gray-25'
                  }`}
                >
                  {display}
                </span>
              </div>

              <p className='text-label2 text-customs-gray-25 mt-4 min-h-[42px]'>
                {result
                  ? result.description
                  : spinning
                  ? '먹대리가 메뉴판을 넘기는 중입니다…'
                  : '버튼을 누르면 먹대리가 메뉴 하나를 바로 정해 드립니다.'}
              </p>
            </section>
          </div>

          {/* 범위: 전체에서 뽑을지, 한 종류 안에서 뽑을지 */}
          <div className='flex gap-2 mt-6 overflow-x-auto pb-1 -mx-5 px-5'>
            {['전체', ...categoryRows.flat()].map((name) => (
              <div key={name} className='shrink-0'>
                <Chip
                  selected={category === name}
                  onClick={() => {
                    if (spinning) return
                    setCategory(name)
                    setResult(null)
                    setApproved(false)
                    setDisplay('？？？')
                  }}
                >
                  {name}
                </Chip>
              </div>
            ))}
          </div>

          <section className='flex flex-col gap-[10px] mt-4 mb-5'>
            {!result ? (
              <Button type='primary' onClick={spin} disabled={spinning}>
                {spinning ? '뽑는 중…' : '메뉴 뽑기'}
              </Button>
            ) : (
              <div className='flex gap-[10px]'>
                <Button type='secondary' onClick={spin}>
                  다시 뽑기
                </Button>
                <Button type='primary' onClick={approve} disabled={approved}>
                  {approved ? '결정 완료' : '이걸로 할게!'}
                </Button>
              </div>
            )}
          </section>

          {result && <MapPanel menu={result.name} />}
        </div>
      </div>
    </Container>
  )
}

export default Page
