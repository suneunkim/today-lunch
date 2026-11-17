'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import GameButton from '@/components/elements/GameButton'
import ShareButton from '@/components/ShareButton'
import { getFlag, setFlag } from '@/lib/storage'

const FOODS = ['🍚', '🍜', '🍙', '🍣', '🥟', '🍛', '🍔', '🥗']
const BLOCKS = ['🚧', '⛔', '🕳️']
const PLAYER_Y = 0.86 // 먹대리가 서 있는 높이 (화면 위에서부터의 비율)
const FIELD_H = 440

type Thing = { id: number; lane: number; y: number; food: boolean; emoji: string }

const gradeOf = (score: number) =>
  score >= 600
    ? '식당 오픈런의 전설'
    : score >= 400
    ? '점심 러시의 지배자'
    : score >= 250
    ? '발 빠른 미식가'
    : score >= 120
    ? '성실한 직진러'
    : '준비 운동 중'

// 점심 질주: 세 줄 길에서 좌우로 움직여 장애물을 피하고 음식을 줍는 게임
const Page = () => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [, setFrame] = useState(0) // 매 프레임 다시 그리기 위한 값
  const [best, setBest] = useState(0)
  const [hit, setHit] = useState(false)
  const lane = useRef(1)
  const things = useRef<Thing[]>([])
  const score = useRef(0)
  const lives = useRef(3)
  const time = useRef(0)
  const nextSpawn = useRef(0)
  const lastId = useRef(0)
  const raf = useRef(0)
  const prev = useRef(0)

  useEffect(() => {
    setBest(Number(getFlag('runBest')) || 0)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  const move = useCallback((dir: number) => {
    lane.current = Math.max(0, Math.min(2, lane.current + dir))
    setFrame((f) => f + 1)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1)
      if (e.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  const finish = () => {
    cancelAnimationFrame(raf.current)
    setPhase('done')
    const final = Math.floor(score.current)
    if (final > (Number(getFlag('runBest')) || 0)) {
      setFlag('runBest', String(final))
      setBest(final)
    }
  }

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - prev.current) / 1000)
    prev.current = now
    time.current += dt
    // 갈수록 빨라지고 촘촘해집니다.
    const speed = Math.min(1.25, 0.42 + time.current * 0.014)
    const gap = Math.max(0.42, 0.95 - time.current * 0.012)

    nextSpawn.current -= dt
    if (nextSpawn.current <= 0) {
      nextSpawn.current = gap
      // 한 줄에 장애물은 최대 2개 (항상 빠져나갈 길이 하나는 있음)
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5)
      const blocks = time.current > 12 && Math.random() < 0.4 ? 2 : 1
      for (let i = 0; i < blocks; i++) {
        things.current.push({ id: ++lastId.current, lane: lanes[i], y: -0.08, food: false, emoji: BLOCKS[Math.floor(Math.random() * BLOCKS.length)] })
      }
      if (Math.random() < 0.6) {
        things.current.push({ id: ++lastId.current, lane: lanes[2], y: -0.08, food: true, emoji: FOODS[Math.floor(Math.random() * FOODS.length)] })
      }
    }

    score.current += dt * 4 // 버틴 시간 점수
    const kept: Thing[] = []
    for (const t of things.current) {
      t.y += speed * dt
      const touching = t.lane === lane.current && t.y > PLAYER_Y - 0.07 && t.y < PLAYER_Y + 0.06
      if (touching) {
        if (t.food) score.current += 10
        else {
          lives.current -= 1
          setHit(true)
          setTimeout(() => setHit(false), 250)
        }
        continue
      }
      if (t.y < 1.1) kept.push(t)
    }
    things.current = kept
    setFrame((f) => f + 1)
    if (lives.current <= 0) return finish()
    raf.current = requestAnimationFrame(loop)
  }

  const start = () => {
    lane.current = 1
    things.current = []
    score.current = 0
    lives.current = 3
    time.current = 0
    nextSpawn.current = 0.6
    setPhase('playing')
    prev.current = performance.now()
    raf.current = requestAnimationFrame(loop)
  }

  const final = Math.floor(score.current)

  return (
    <Container title='점심 질주'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-4 min-h-[calc(100vh-48px)]'>
        <section className='bg-customs-gray-100 rounded-[28px] overflow-hidden'>
          <div className='bg-customs-gray-10 px-5 py-4 flex items-center justify-between rounded-b-[28px]'>
            <span className='text-[18px] tracking-[2px]' aria-label={`남은 기회 ${lives.current}번`}>
              {'🧡'.repeat(Math.max(0, lives.current))}
              <span className='opacity-25'>{'🧡'.repeat(3 - Math.max(0, lives.current))}</span>
            </span>
            <span className='px-4 py-1 rounded-full bg-[#2b292e] font-paperlogy font-bold text-[26px] text-customs-orange-50 tabular-nums'>
              {final}
            </span>
          </div>

          {/* 길: 왼쪽·오른쪽 절반을 눌러도 움직입니다 */}
          <div
            className={`relative mx-4 mt-4 rounded-[18px] overflow-hidden select-none touch-manipulation ${hit ? 'bg-customs-gray-90' : 'bg-[#FFF6E9]'}`}
            style={{ height: FIELD_H }}
            onPointerDown={(e) => {
              if (phase !== 'playing') return
              const box = e.currentTarget.getBoundingClientRect()
              move(e.clientX - box.left < box.width / 2 ? -1 : 1)
            }}
          >
            <div className='absolute inset-y-0 left-1/3 border-l-2 border-dashed border-[#F2D9BD]' />
            <div className='absolute inset-y-0 left-2/3 border-l-2 border-dashed border-[#F2D9BD]' />

            {phase === 'playing' &&
              things.current.map((t) => (
                <span
                  key={t.id}
                  className='absolute -translate-x-1/2 -translate-y-1/2 text-[38px] leading-none'
                  style={{ left: `${(t.lane + 0.5) * 33.333}%`, top: `${t.y * 100}%` }}
                >
                  {t.emoji}
                </span>
              ))}

            <img
              src='/comment.png'
              alt='먹대리'
              className='absolute -translate-x-1/2 -translate-y-1/2 w-[66px] transition-[left] duration-100'
              style={{ left: `${(lane.current + 0.5) * 33.333}%`, top: `${PLAYER_Y * 100}%` }}
            />

            {phase !== 'playing' && (
              <div className='absolute inset-0 bg-customs-gray-100 bg-opacity-90 flex flex-col items-center justify-center text-center px-6'>
                {phase === 'idle' ? (
                  <>
                    <h2 className='text-heading3 font-paperlogy text-customs-gray-10'>식당까지 달려라!</h2>
                    <p className='text-label2 text-customs-gray-50 mt-2'>
                      좌우로 움직여 장애물(🚧 ⛔ 🕳️)을 피하고
                      <br />
                      음식을 주우세요. 세 번 부딪히면 끝납니다.
                      {best > 0 && (
                        <>
                          <br />내 최고 기록 <b className='text-customs-orange-50'>{best}점</b>
                        </>
                      )}
                    </p>
                  </>
                ) : (
                  <div className='pop-in'>
                    <p className='font-paperlogy font-bold text-[20px] text-customs-gray-10'>{gradeOf(final)}</p>
                    <h2 className='font-paperlogy font-bold text-[48px] leading-[120%] text-customs-orange-50'>
                      {final}
                      <span className='text-[22px] text-customs-gray-10'> 점</span>
                    </h2>
                    <p className='text-caption1 text-customs-gray-50'>{final >= best ? '내 최고 기록!' : `최고 ${best}점`}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='px-4 py-5'>
            {phase === 'playing' ? (
              <div className='flex gap-3'>
                {[-1, 1].map((dir) => (
                  <button
                    key={dir}
                    onPointerDown={() => move(dir)}
                    aria-label={dir < 0 ? '왼쪽' : '오른쪽'}
                    className='flex-1 h-[64px] rounded-[20px] bg-customs-orange-50 text-customs-gray-100 text-[28px] font-bold shadow-[0_6px_0_#c2531b] active:translate-y-[4px] active:shadow-[0_2px_0_#c2531b] select-none touch-manipulation'
                  >
                    {dir < 0 ? '◀' : '▶'}
                  </button>
                ))}
              </div>
            ) : (
              <div className='flex flex-col gap-3'>
                <GameButton onClick={start}>{phase === 'done' ? '다시 달리기' : '출발'}</GameButton>
                {phase === 'done' && (
                  <ShareButton
                    label='내기 신청하기'
                    text={`[점심 질주] ${final}점! 이 기록 깰 수 있나요? 점심 내기 하실래요?\n- 먹대리 드림`}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </Container>
  )
}

export default Page
