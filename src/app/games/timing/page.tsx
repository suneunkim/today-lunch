'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Card from '@/components/elements/Card'
import Chip from '@/components/elements/Chip'
import { getFlag, getMembers, setFlag } from '@/lib/storage'

const TARGET = 10000 // 11:59:50 에서 시작해 10초 뒤가 12시 정각
const HIDE_AFTER = 4000 // 4초 뒤부터는 시계를 가립니다

const clockText = (elapsed: number) => {
  const total = 50 * 1000 + elapsed // 11:59:50.00 기준
  const sec = Math.floor(total / 1000)
  const cs = Math.floor((total % 1000) / 10)
  const hh = sec >= 60 ? 12 : 11
  const mm = sec >= 60 ? Math.floor((sec - 60) / 60) : 59
  const ss = sec >= 60 ? (sec - 60) % 60 : sec
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${hh}:${pad(mm)}:${pad(ss)}.${pad(cs)}`
}

const verdict = (diff: number) => {
  const abs = Math.abs(diff)
  const sec = (abs / 1000).toFixed(2)
  if (abs <= 50) return { title: '점심의 신', desc: `오차 ${sec}초. 12시 정각, 식당 1등 도착입니다.` }
  if (diff < 0) {
    if (abs <= 300) return { title: '아슬아슬 선발대', desc: `${sec}초 일찍 일어났습니다. 눈치껏 넘어가 드립니다.` }
    return { title: '성급한 출발', desc: `${sec}초나 일찍 나갔습니다. 아직 점심시간이 아닙니다.` }
  }
  if (abs <= 300) return { title: '정시 출발', desc: `${sec}초 늦었지만 훌륭합니다. 줄은 안 서도 됩니다.` }
  if (abs <= 1500) return { title: '한발 늦음', desc: `${sec}초 늦었습니다. 앞에 세 팀 대기 중입니다.` }
  return { title: '웨이팅 확정', desc: `${sec}초 늦었습니다. 먹대리는 이미 먹고 있습니다.` }
}

type Result = { name: string; diff: number }

// 점심시간 10초 전: 시계가 가려진 뒤 12시 정각을 감으로 맞추는 타이밍 게임
const Page = () => {
  const [mode, setMode] = useState<'solo' | 'bet'>('solo')
  const [players, setPlayers] = useState<string[]>([])
  const [count, setCount] = useState(3)
  const [turn, setTurn] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [display, setDisplay] = useState(clockText(0))
  const [hidden, setHidden] = useState(false)
  const [diff, setDiff] = useState(0)
  const [best, setBest] = useState<number | null>(null)
  const startedAt = useRef(0)
  const frame = useRef(0)

  useEffect(() => {
    const members = getMembers()
    setPlayers(members)
    if (members.length >= 2) setCount(members.length)
    const saved = Number(getFlag('timingBest'))
    if (saved) setBest(saved)
    return () => cancelAnimationFrame(frame.current)
  }, [])

  const names =
    players.length >= 2 ? players : Array.from({ length: count }, (_, i) => `${i + 1}번 선수`)
  const betOver = mode === 'bet' && results.length === names.length
  const loser = betOver
    ? [...results].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0]
    : null

  const start = () => {
    startedAt.current = performance.now()
    setPhase('running')
    setHidden(false)
    const tick = () => {
      const elapsed = performance.now() - startedAt.current
      setDisplay(clockText(elapsed))
      setHidden(elapsed > HIDE_AFTER)
      // 30초가 지나도록 안 누르면 자동 종료
      if (elapsed > 30000) return stop()
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  const stop = () => {
    cancelAnimationFrame(frame.current)
    const elapsed = performance.now() - startedAt.current
    const d = Math.round(elapsed - TARGET)
    setDisplay(clockText(elapsed))
    setHidden(false)
    setDiff(d)
    setPhase('done')
    if (mode === 'solo') {
      if (best === null || Math.abs(d) < best) {
        setBest(Math.abs(d))
        setFlag('timingBest', String(Math.abs(d)))
      }
    } else {
      setResults((prev) => [...prev, { name: names[turn], diff: d }])
    }
  }

  const next = () => {
    setPhase('idle')
    setDisplay(clockText(0))
    if (mode === 'bet') setTurn((t) => t + 1)
  }

  const resetBet = (nextMode: 'solo' | 'bet' = mode) => {
    cancelAnimationFrame(frame.current)
    setMode(nextMode)
    setTurn(0)
    setResults([])
    setPhase('idle')
    setDisplay(clockText(0))
  }

  const v = verdict(diff)

  return (
    <Container title='점심시간 10초 전'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-5 min-h-[calc(100vh-48px)]'>
        <div className='flex gap-2'>
          <Chip selected={mode === 'solo'} onClick={() => resetBet('solo')}>
            혼자 하기
          </Chip>
          <Chip selected={mode === 'bet'} onClick={() => resetBet('bet')}>
            내기 (꼴찌가 쏘기)
          </Chip>
        </div>

        {mode === 'bet' && results.length === 0 && phase === 'idle' && (
          <Card>
            {players.length >= 2 ? (
              <p className='text-label2 text-customs-gray-25'>
                참가자: <b>{players.join(', ')}</b>
                <br />
                <span className='text-caption1 text-customs-gray-50'>
                  점심 회의실의 “누가 쏠까” 명단입니다. 폰 하나를 돌려가며 차례로 도전하세요.
                </span>
              </p>
            ) : (
              <div className='flex items-center justify-between'>
                <span className='text-label2 text-customs-gray-25'>참가 인원 (폰 하나로 돌아가며)</span>
                <div className='flex items-center gap-3'>
                  <button className='w-9 h-9 rounded-full bg-customs-gray-95' onClick={() => setCount((c) => Math.max(2, c - 1))}>
                    −
                  </button>
                  <span className='text-heading2 w-8 text-center'>{count}</span>
                  <button className='w-9 h-9 rounded-full bg-customs-gray-95' onClick={() => setCount((c) => Math.min(8, c + 1))}>
                    +
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {!betOver && (
          <section className='px-6 py-7 bg-customs-gray-100 rounded-[20px]'>
            {mode === 'bet' && (
              <p className='text-caption2 font-paperlogy text-customs-orange-50 mb-2'>
                {turn + 1} / {names.length} · {names[turn]} 차례
              </p>
            )}
            <p className='text-label2 text-customs-gray-50'>
              12시 정각(12:00:00.00)에 버튼을 누르세요. 4초 뒤부터는 먹대리가 시계를 가립니다.
            </p>
            <div className='mt-4 h-[108px] rounded-[14px] bg-customs-orange-95-bg flex items-center justify-center'>
              <span className='font-paperlogy font-bold text-[34px] text-customs-orange-50 tabular-nums'>
                {hidden ? '1?:??:??.??' : display}
              </span>
            </div>

            {phase === 'done' && (
              <div className='mt-5 pop-in'>
                <h3 className='text-[24px] font-bold font-paperlogy text-customs-gray-10'>{v.title}</h3>
                <p className='text-body2 text-customs-gray-25 mt-1'>{v.desc}</p>
                {mode === 'solo' && best !== null && (
                  <p className='text-caption1 text-customs-gray-50 mt-2'>내 최고 기록: 오차 {(best / 1000).toFixed(2)}초</p>
                )}
              </div>
            )}

            <div className='mt-5'>
              {phase === 'idle' && (
                <Button type='primary' onClick={start}>
                  시작 (11:59:50)
                </Button>
              )}
              {phase === 'running' && (
                <Button type='primary' onClick={stop}>
                  점심 먹으러 출발!
                </Button>
              )}
              {phase === 'done' && (
                <Button type='primary' onClick={next}>
                  {mode === 'bet' ? (turn + 1 < names.length ? `다음: ${names[turn + 1]}` : '결과 보기') : '다시 도전'}
                </Button>
              )}
            </div>
          </section>
        )}

        {mode === 'bet' && results.length > 0 && (phase === 'idle' || betOver) && (
          <Card title={betOver ? '내기 결과' : '현재 기록'}>
            {betOver && loser && (
              <div className='rounded-[14px] bg-customs-orange-95-bg px-5 py-4 mb-4 pop-in'>
                <div className='text-label2 text-customs-gray-25'>오늘의 결제자</div>
                <div className='font-paperlogy font-bold text-[26px] text-customs-orange-50'>{loser.name} 님</div>
                <div className='text-caption1 text-customs-gray-50 mt-1'>12시에서 가장 멀었습니다. 결제 감사합니다!</div>
              </div>
            )}
            <ul>
              {[...results]
                .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))
                .map((r, i) => (
                  <li key={r.name} className='flex justify-between py-2 text-label2 text-customs-gray-25 border-b border-customs-gray-95 last:border-b-0'>
                    <span>
                      {i + 1}위 {r.name}
                    </span>
                    <span>
                      {r.diff < 0 ? '빠름' : '늦음'} {(Math.abs(r.diff) / 1000).toFixed(2)}초
                    </span>
                  </li>
                ))}
            </ul>
            {betOver && (
              <div className='mt-4'>
                <Button type='secondary' onClick={() => resetBet()}>
                  한 판 더
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </Container>
  )
}

export default Page
