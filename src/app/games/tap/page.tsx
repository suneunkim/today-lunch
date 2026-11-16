'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Card from '@/components/elements/Card'
import Chip from '@/components/elements/Chip'
import Ranking from '@/components/elements/Ranking'
import { fetchTapRank, submitTapScore, TapRank } from '@/lib/firebase/stats'
import { dateKey, getFlag, setFlag } from '@/lib/storage'

// 고정 제시어 (첫 번째가 랭킹 종목)
const PHRASES = ['오늘 점심은 먹대리가', '아무거나 말고 정해줘', '김치찌개에 계란말이 추가', '점심시간은 왜 이리 짧은가']
// 도전자 모드: 매번 무작위로 나오는 제시어
const CHALLENGES = [
  '제육볶음 곱빼기에 공깃밥 추가', '짜장면이냐 짬뽕이냐 그것이 문제', '웨이팅 삼십분이면 다른 데 가자', '반찬 리필은 당당하게 요청하기',
  '국밥 한 그릇에 깍두기 국물 살짝', '탕수육은 부먹 말고 찍먹으로', '돈까스 김밥 한 줄에 라면 하나', '뜨끈한 순댓국에 다진 양념 추가',
  '점심 먹고 아이스 아메리카노 한 잔', '맛있게 먹으면 영 칼로리라고 믿기', '오늘은 내가 살게 다음엔 네가 사', '먹대리가 정해주는 대로 먹기',
]
const MAX_TRIES = 3

const ADJ = ['배고픈', '든든한', '매콤한', '느긋한', '재빠른', '출출한', '야무진', '깔끔한', '용감한', '신중한']
const NOUN = ['너구리', '국밥', '돈까스', '김밥', '만두', '라면', '떡볶이', '비빔밥', '우동', '탕수육']
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const makeNickname = () => `${pick(ADJ)} ${pick(NOUN)} ${1000 + Math.floor(Math.random() * 9000)}`

type Tile = { id: number; char: string; used: boolean }
const makeTiles = (phrase: string): Tile[] =>
  [...phrase.replace(/\s/g, '')]
    .map((char, id) => ({ id, char, used: false }))
    .sort(() => Math.random() - 0.5)

const sec = (ms: number) => (ms / 1000).toFixed(2)

// 제시어 빨리 누르기: 흩어진 글자를 제시어 순서대로 최대한 빨리 누르는 게임
const Page = () => {
  const [mode, setMode] = useState(0) // 0~3 고정 제시어, -1 도전자 모드
  const [phrase, setPhrase] = useState(PHRASES[0])
  const [tiles, setTiles] = useState<Tile[]>([])
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [wrong, setWrong] = useState(-1)
  const [tries, setTries] = useState(0)
  const [best, setBest] = useState(0)
  const [rank, setRank] = useState<TapRank[] | null>(null)
  const [registered, setRegistered] = useState('')
  const [nickname, setNickname] = useState('')
  const startedAt = useRef(0)
  const frame = useRef(0)
  const today = dateKey()

  const target = [...phrase.replace(/\s/g, '')]
  const ranked = mode === 0
  const triesLeft = mode === -1 ? Infinity : MAX_TRIES - tries

  useEffect(() => {
    fetchTapRank(10).then(setRank)
    return () => cancelAnimationFrame(frame.current)
  }, [])

  // 제시어를 바꾸면 오늘 남은 횟수와 최고 기록을 불러옵니다.
  useEffect(() => {
    cancelAnimationFrame(frame.current)
    setPhase('idle')
    setElapsed(0)
    setProgress(0)
    setRegistered('')
    if (mode === -1) {
      setPhrase(pick(CHALLENGES))
      setTries(0)
      setBest(0)
    } else {
      setPhrase(PHRASES[mode])
      setTries(Number(getFlag(`tapTries:${today}:${mode}`)) || 0)
      setBest(Number(getFlag(`tapBest:${mode}`)) || 0)
    }
  }, [mode, today])

  const start = () => {
    if (triesLeft <= 0) return
    const nextPhrase = mode === -1 && phase === 'done' ? pick(CHALLENGES.filter((p) => p !== phrase)) : phrase
    setPhrase(nextPhrase)
    setTiles(makeTiles(nextPhrase))
    setProgress(0)
    setRegistered('')
    setElapsed(0)
    setPhase('playing')
    if (mode !== -1) {
      setTries(tries + 1)
      setFlag(`tapTries:${today}:${mode}`, String(tries + 1))
    }
    startedAt.current = performance.now()
    const tick = () => {
      setElapsed(performance.now() - startedAt.current)
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  const tap = (tile: Tile) => {
    if (phase !== 'playing' || tile.used) return
    if (tile.char !== target[progress]) {
      setWrong(tile.id)
      setTimeout(() => setWrong(-1), 220)
      return
    }
    setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)))
    const next = progress + 1
    setProgress(next)
    if (next === target.length) {
      cancelAnimationFrame(frame.current)
      const ms = Math.round(performance.now() - startedAt.current)
      setElapsed(ms)
      setPhase('done')
      if (mode !== -1 && (!best || ms < best)) {
        setBest(ms)
        setFlag(`tapBest:${mode}`, String(ms))
      }
    }
  }

  const register = async () => {
    if (registered) return
    let name = getFlag('tapNickname')
    if (!name) {
      name = makeNickname()
      setFlag('tapNickname', name)
    }
    setNickname(name)
    setRegistered('등록 중…')
    const ok = await submitTapScore(name, Math.round(elapsed))
    setRegistered(ok ? `‘${name}’(으)로 등록했습니다.` : '등록하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    if (ok) fetchTapRank(10).then(setRank)
  }

  const cols = target.length <= 9 ? 3 : target.length <= 12 ? 4 : 5

  return (
    <Container title='제시어 빨리 누르기'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-5 min-h-[calc(100vh-48px)]'>
        <div className='flex gap-2 overflow-x-auto -mx-5 px-5 pb-1'>
          {PHRASES.map((_, i) => (
            <div key={i} className='shrink-0'>
              <Chip selected={mode === i} onClick={() => phase !== 'playing' && setMode(i)}>
                {i === 0 ? '기본 (랭킹)' : `제시어 ${i + 1}`}
              </Chip>
            </div>
          ))}
          <div className='shrink-0'>
            <Chip selected={mode === -1} onClick={() => phase !== 'playing' && setMode(-1)}>
              도전자 모드
            </Chip>
          </div>
        </div>

        <section className='px-5 py-6 bg-customs-gray-100 rounded-[20px]'>
          <div className='flex justify-between items-baseline'>
            <span className='text-caption1 text-customs-gray-50'>
              {mode === -1 ? '매번 다른 제시어 · 횟수 제한 없음' : `오늘 남은 도전 ${Math.max(0, triesLeft)}번`}
            </span>
            <span className='font-paperlogy font-bold text-[28px] text-customs-orange-50 tabular-nums'>{sec(elapsed)}초</span>
          </div>

          {/* 제시어: 누른 글자까지 색이 채워집니다 */}
          <p className='mt-3 text-[22px] leading-[150%] font-bold font-paperlogy text-center break-keep'>
            {(() => {
              let n = 0
              return [...phrase].map((char, i) => {
                if (char === ' ') return <span key={i}> </span>
                const done = n++ < progress
                return (
                  <span key={i} className={done ? 'text-customs-orange-50' : 'text-customs-gray-75'}>
                    {mode === -1 && phase === 'idle' ? '?' : char}
                  </span>
                )
              })
            })()}
          </p>

          {phase === 'playing' && (
            <div className='grid gap-2 mt-5' style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {tiles.map((tile) => (
                <button
                  key={tile.id}
                  onPointerDown={() => tap(tile)}
                  className={`h-[62px] rounded-[14px] text-[24px] font-bold font-paperlogy border-2 select-none touch-manipulation ${
                    tile.used
                      ? 'bg-customs-gray-95 border-customs-gray-95 text-customs-gray-90'
                      : wrong === tile.id
                      ? 'bg-customs-gray-10 border-customs-gray-10 text-customs-gray-100'
                      : 'bg-customs-gray-100 border-customs-gray-10 text-customs-gray-10'
                  }`}
                >
                  {tile.char}
                </button>
              ))}
            </div>
          )}

          {phase === 'idle' && (
            <p className='text-label2 text-customs-gray-50 mt-4 text-center'>
              시작하면 글자가 흩어져 나옵니다. 제시어 순서대로 최대한 빨리 누르세요.
              {best > 0 && (
                <>
                  <br />내 최고 기록 {sec(best)}초
                </>
              )}
            </p>
          )}

          {phase === 'done' && (
            <div className='mt-5 text-center pop-in'>
              <h2 className='text-[30px] font-bold font-paperlogy text-customs-gray-10'>{sec(elapsed)}초</h2>
              <p className='text-label2 text-customs-gray-50 mt-1'>
                {mode !== -1 && best === Math.round(elapsed) ? '내 최고 기록입니다!' : best > 0 ? `내 최고 기록 ${sec(best)}초` : '완료!'}
              </p>
              {ranked && (
                <div className='mt-4'>
                  {registered ? (
                    <p className='text-label2 text-customs-orange-50'>{registered}</p>
                  ) : (
                    <Button type='sub' onClick={register}>
                      이 기록 오늘의 랭킹에 넣기
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {phase !== 'playing' && (
            <div className='mt-5'>
              <Button type='primary' onClick={start} disabled={triesLeft <= 0}>
                {triesLeft <= 0 ? '오늘 도전은 끝! 내일 다시 만나요' : phase === 'done' ? (mode === -1 ? '다음 제시어' : `다시 도전 (${triesLeft}번 남음)`) : '시작'}
              </Button>
            </div>
          )}
        </section>

        <Card title='오늘의 랭킹 TOP 10'>
          <p className='text-caption1 text-customs-gray-50 -mt-2 mb-4'>종목: “{PHRASES[0]}” · 매일 새로 시작합니다.</p>
          {!rank ? (
            <p className='text-label2 text-customs-gray-50'>랭킹을 불러오는 중입니다…</p>
          ) : rank.length === 0 ? (
            <p className='text-label2 text-customs-gray-50'>아직 오늘 기록이 없습니다. 첫 번째로 이름을 올려 보세요!</p>
          ) : (
            <div className='flex flex-col gap-[10px]'>
              {rank.map((r, i) => (
                <div key={i} className='flex items-center gap-4'>
                  <Ranking isFirst={i === 0}>{i + 1}위</Ranking>
                  <div className='flex w-full justify-between text-label2 text-customs-gray-10'>
                    <p className={r.name === nickname ? 'font-bold text-customs-orange-50' : i === 0 ? 'font-bold' : ''}>{r.name}</p>
                    <div className={i === 0 ? 'font-bold' : ''}>{sec(r.ms)}초</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Container>
  )
}

export default Page
