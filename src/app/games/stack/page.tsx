'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import GameButton from '@/components/elements/GameButton'
import ShareButton from '@/components/ShareButton'
import { getFlag, setFlag } from '@/lib/storage'

const FIELD_W = 300
const FIELD_H = 400
const LAYER_H = 26
const VISIBLE = 10 // 이만큼 쌓이면 화면이 따라 올라갑니다

// 재료가 순서대로 돌아가며 쌓입니다.
const INGREDIENTS = [
  { name: '패티', color: '#7A4A2B' },
  { name: '치즈', color: '#FFC83D' },
  { name: '양상추', color: '#8BC34A' },
  { name: '토마토', color: '#E5533D' },
  { name: '양파', color: '#EADCF0' },
  { name: '베이컨', color: '#C2553F' },
]
const BUN = '#E8B36A'
const TIME_LIMIT = 60 // 초. 시간이 다 되면 그때까지 쌓은 단수로 끝납니다.

// 얼마나 반듯하게 올렸는지에 따른 판정
const JUDGES = {
  perfect: { label: '퍼펙트!', color: '#F47A3A' },
  excellent: { label: '엑설런트', color: '#2E9E6B' },
  good: { label: '굿', color: '#5AA9E6' },
  basic: { label: '베이직', color: '#8A8790' },
}
type JudgeKey = keyof typeof JUDGES

type Layer = { x: number; w: number; color: string }

const gradeOf = (n: number) =>
  n >= 30 ? '버거 건축가' : n >= 20 ? '수제버거 장인' : n >= 12 ? '든든한 더블 버거' : n >= 6 ? '평범한 치즈버거' : '아직은 주니어 버거'

// 버거 쌓기: 좌우로 움직이는 재료를 눌러서 떨어뜨려 쌓는 게임. 어긋난 만큼 잘려 나갑니다.
const Page = () => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [layers, setLayers] = useState<Layer[]>([])
  const [movingX, setMovingX] = useState(0)
  const [perfect, setPerfect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [timeUp, setTimeUp] = useState(false)
  const [judge, setJudge] = useState<{ key: JudgeKey; id: number } | null>(null)
  const startedAt = useRef(0)
  const next_id = useRef(0)
  const [best, setBest] = useState(0)
  const layersRef = useRef<Layer[]>([])
  const x = useRef(0)
  const dir = useRef(1)
  const raf = useRef(0)
  const prev = useRef(0)

  useEffect(() => {
    setBest(Number(getFlag('stackBest')) || 0)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  const count = Math.max(0, layers.length - 1) // 아래 빵은 세지 않습니다
  const topLayer = layers[layers.length - 1]
  const movingColor = INGREDIENTS[count % INGREDIENTS.length]

  const finish = (byTime: boolean) => {
    cancelAnimationFrame(raf.current)
    setTimeUp(byTime)
    setPhase('done')
    const n = layersRef.current.length - 1
    if (n > (Number(getFlag('stackBest')) || 0)) {
      setFlag('stackBest', String(n))
      setBest(n)
    }
  }

  const loop = (now: number) => {
    const remain = TIME_LIMIT - (now - startedAt.current) / 1000
    if (remain <= 0) {
      setTimeLeft(0)
      finish(true)
      return
    }
    setTimeLeft(remain)
    const dt = Math.min(0.05, (now - prev.current) / 1000)
    prev.current = now
    const current = layersRef.current
    const width = current[current.length - 1].w
    const speed = Math.min(420, 150 + (current.length - 1) * 9)
    x.current += dir.current * speed * dt
    if (x.current <= 0) {
      x.current = 0
      dir.current = 1
    } else if (x.current >= FIELD_W - width) {
      x.current = FIELD_W - width
      dir.current = -1
    }
    setMovingX(x.current)
    raf.current = requestAnimationFrame(loop)
  }

  const start = () => {
    const base = [{ x: 60, w: 180, color: BUN }]
    layersRef.current = base
    setLayers(base)
    setPerfect(0)
    setJudge(null)
    setTimeUp(false)
    setTimeLeft(TIME_LIMIT)
    startedAt.current = performance.now()
    x.current = 0
    dir.current = 1
    setPhase('playing')
    prev.current = performance.now()
    raf.current = requestAnimationFrame(loop)
  }

  const drop = () => {
    if (phase !== 'playing') return
    const current = layersRef.current
    const below = current[current.length - 1]
    const left = Math.max(x.current, below.x)
    const right = Math.min(x.current + below.w, below.x + below.w)
    const overlap = right - left
    if (overlap <= 0) {
      finish(false)
      return
    }
    // 거의 정확히 올리면 잘리지 않고 그대로 얹힙니다.
    const exact = Math.abs(x.current - below.x) < 5
    if (exact) setPerfect((p) => p + 1)
    const ratio = overlap / below.w
    const key: JudgeKey = exact ? 'perfect' : ratio >= 0.88 ? 'excellent' : ratio >= 0.7 ? 'good' : 'basic'
    setJudge({ key, id: next_id.current++ })
    const color = INGREDIENTS[(current.length - 1) % INGREDIENTS.length].color
    const next = [...current, exact ? { x: below.x, w: below.w, color } : { x: left, w: overlap, color }]
    layersRef.current = next
    setLayers(next)
    x.current = dir.current > 0 ? 0 : FIELD_W - next[next.length - 1].w
  }

  const lift = Math.max(0, layers.length - VISIBLE) * LAYER_H

  return (
    <Container title='버거 쌓기'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-4 min-h-[calc(100vh-48px)]'>
        <section className='bg-customs-gray-100 rounded-[28px] overflow-hidden'>
          <div className='bg-customs-gray-10 px-5 py-4 flex items-center justify-between rounded-b-[28px]'>
            <span className='text-label2 text-customs-gray-75'>
              {phase === 'playing' ? `남은 시간 ${Math.ceil(timeLeft)}초` : best > 0 ? `내 최고 ${best}단` : '재료를 반듯하게 쌓으세요'}
            </span>
            <span className='px-4 py-1 rounded-full bg-[#2b292e] font-paperlogy font-bold text-[26px] text-customs-orange-50 tabular-nums'>
              {count}단
            </span>
          </div>

          <div className='flex justify-center mt-4'>
            <div
              className='relative overflow-hidden rounded-[18px] bg-[#FFF6E9] select-none touch-manipulation'
              style={{ width: FIELD_W, height: FIELD_H }}
              onPointerDown={drop}
            >
              {phase === 'playing' && (
                <div className='absolute top-0 left-0 right-0 h-[6px] bg-[#F1E4D0] z-10'>
                  <div
                    className='h-full'
                    style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%`, background: timeLeft <= 10 ? '#E5533D' : '#F47A3A' }}
                  />
                </div>
              )}
              {phase === 'playing' && judge && (
                <p
                  key={judge.id}
                  className='judge-pop absolute top-[22px] left-0 right-0 text-center font-paperlogy font-bold text-[24px] z-10 pointer-events-none'
                  style={{ color: JUDGES[judge.key].color }}
                >
                  {JUDGES[judge.key].label}
                </p>
              )}
              <div className='absolute inset-0 transition-transform duration-200' style={{ transform: `translateY(${lift}px)` }}>
                {layers.map((layer, i) => (
                  <div
                    key={i}
                    className='absolute rounded-[7px]'
                    style={{
                      left: layer.x,
                      width: layer.w,
                      height: LAYER_H - 3,
                      bottom: 16 + i * LAYER_H,
                      background: layer.color,
                      borderRadius: i === 0 ? '7px 7px 14px 14px' : undefined,
                      boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.12)',
                    }}
                  />
                ))}
                {phase === 'playing' && topLayer && (
                  <div
                    className='absolute rounded-[7px]'
                    style={{
                      left: movingX,
                      width: topLayer.w,
                      height: LAYER_H - 3,
                      bottom: 16 + layers.length * LAYER_H + 18,
                      background: movingColor.color,
                      boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.12)',
                    }}
                  />
                )}
              </div>

              {phase !== 'playing' && (
                <div className='absolute inset-0 bg-customs-gray-100 bg-opacity-90 flex flex-col items-center justify-center text-center px-6'>
                  {phase === 'idle' ? (
                    <>
                      <span className='text-[44px]'>🍔</span>
                      <h2 className='text-heading3 font-paperlogy text-customs-gray-10 mt-2'>몇 단까지 쌓을 수 있을까요?</h2>
                      <p className='text-label2 text-customs-gray-50 mt-2'>
                        재료가 좌우로 움직입니다. 화면을 눌러 떨어뜨리세요.
                        <br />
                        어긋난 부분은 잘려 나가고, 완전히 빗나가면 끝납니다.
                        <br />
                        제한 시간은 {TIME_LIMIT}초입니다.
                      </p>
                    </>
                  ) : (
                    <div className='pop-in'>
                      {timeUp && <p className='text-label2 text-customs-gray-50 mb-1'>시간 종료!</p>}
                      <p className='font-paperlogy font-bold text-[20px] text-customs-gray-10'>{gradeOf(count)}</p>
                      <h2 className='font-paperlogy font-bold text-[48px] leading-[120%] text-customs-orange-50'>
                        {count}
                        <span className='text-[22px] text-customs-gray-10'> 단 버거</span>
                      </h2>
                      <p className='text-caption1 text-customs-gray-50'>
                        퍼펙트 {perfect}번 · {count >= best && count > 0 ? '내 최고 기록!' : `최고 ${best}단`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className='px-4 py-5 flex flex-col gap-3'>
            {phase === 'playing' ? (
              <GameButton onClick={drop}>올리기</GameButton>
            ) : (
              <>
                <GameButton onClick={start}>{phase === 'done' ? '다시 쌓기' : '시작'}</GameButton>
                {phase === 'done' && (
                  <ShareButton
                    label='내기 신청하기'
                    text={`[버거 쌓기] ${count}단 버거 완성! 이 기록 깰 수 있나요? 점심 내기 하실래요?\n- 먹대리 드림`}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </Container>
  )
}

export default Page
