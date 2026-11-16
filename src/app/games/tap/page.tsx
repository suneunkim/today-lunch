'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Card from '@/components/elements/Card'
import Chip from '@/components/elements/Chip'
import Ranking from '@/components/elements/Ranking'
import { fetchTapRank, submitTapScore, TapRank } from '@/lib/firebase/stats'
import { dateKey, getFlag, setFlag } from '@/lib/storage'

// 제시어는 글자 몇 개가 뒤섞여 반복되는 말입니다. 버튼은 글자 종류만큼만 나오고, 제시어 전체를 순서대로 눌러야 합니다.
// 고정 제시어 (첫 번째가 랭킹 종목). 공백은 줄바꿈 위치입니다.
const PHRASES = [
  '먹대리점심먹먹 대리점먹심대리먹',
  '짜장짬뽕짬짜짜 장뽕짬짜뽕장짬',
  '김밥국밥볶음밥 김국밥볶밥국김',
  '돈까스까스돈돈 까까스돈스까돈',
]
// 도전자 모드: 글자 묶음에서 매번 새 제시어를 만들어 냅니다.
const CHALLENGE_SETS = ['김치찌개밥', '탕수육짬뽕', '라면김밥떡', '제육볶음밥', '순대국밥탕', '냉면만두국']
const makeChallenge = () => {
  const chars = [...CHALLENGE_SETS[Math.floor(Math.random() * CHALLENGE_SETS.length)]]
  const out: string[] = [...chars] // 처음엔 원래 단어 그대로 시작
  while (out.length < 14) {
    const next = chars[Math.floor(Math.random() * chars.length)]
    // 같은 글자가 세 번 연속 나오지 않게
    if (out[out.length - 1] === next && out[out.length - 2] === next) continue
    out.push(next)
  }
  return out.slice(0, 7).join('') + ' ' + out.slice(7).join('')
}
const MAX_TRIES = 3

const ADJ = ['배고픈', '든든한', '매콤한', '느긋한', '재빠른', '출출한', '야무진', '깔끔한', '용감한', '신중한']
const NOUN = ['너구리', '국밥', '돈까스', '김밥', '만두', '라면', '떡볶이', '비빔밥', '우동', '탕수육']
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const makeNickname = () => `${pick(ADJ)} ${pick(NOUN)} ${1000 + Math.floor(Math.random() * 9000)}`

// 버튼: 제시어에 쓰인 글자 종류만큼, 매번 다른 자리에 놓입니다.
const makeButtons = (phrase: string) =>
  [...new Set(phrase.replace(/\s/g, ''))].sort(() => Math.random() - 0.5)

const sec = (ms: number) => (ms / 1000).toFixed(2)

// 제시어 빨리 누르기: 몇 개 안 되는 글자 버튼으로 긴 제시어를 처음부터 끝까지 빨리 누르는 게임
const Page = () => {
  const [mode, setMode] = useState(0) // 0~3 고정 제시어, -1 도전자 모드
  const [phrase, setPhrase] = useState(PHRASES[0])
  const [buttons, setButtons] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [wrong, setWrong] = useState('')
  const [pressed, setPressed] = useState('')
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
      setPhrase(makeChallenge())
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
    const nextPhrase = mode === -1 && phase === 'done' ? makeChallenge() : phrase
    setPhrase(nextPhrase)
    setButtons(makeButtons(nextPhrase))
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

  const tap = (char: string) => {
    if (phase !== 'playing') return
    if (char !== target[progress]) {
      setWrong(char)
      setTimeout(() => setWrong(''), 220)
      return
    }
    setPressed(char)
    setTimeout(() => setPressed(''), 90)
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

  const grade = (ms: number) =>
    ms < 3500 ? '손가락이 안 보입니다. 혹시 선수십니까?' : ms < 5000 ? '상당한 실력입니다. 랭킹을 노려 보세요.' : ms < 7000 ? '무난합니다. 한 번 더 하면 줄어듭니다.' : '천천히, 정확하게. 다음엔 더 빨라집니다.'

  // 제시어 두 줄: 누른 글자까지 색이 채워집니다.
  let counter = 0
  const lines = phrase.split(' ').map((line) => [...line].map((char) => ({ char, index: counter++ })))

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

        <section className='bg-customs-gray-100 rounded-[28px] overflow-hidden'>
          {/* 위쪽 띠: 시간 */}
          <div className='bg-customs-gray-10 px-5 py-4 flex items-center justify-between rounded-b-[28px]'>
            <span className='text-caption1 text-customs-gray-75'>
              {mode === -1 ? '매번 새 제시어 · 무제한' : `오늘 남은 도전 ${Math.max(0, triesLeft)}번`}
            </span>
            <span className='px-4 py-1 rounded-full bg-[#2b292e] font-paperlogy font-bold text-[26px] text-customs-orange-50 tabular-nums'>
              {sec(elapsed)}
            </span>
          </div>

          <div className='px-5 pt-5 pb-7 flex flex-col items-center'>
            <span className='px-4 py-[6px] rounded-full bg-customs-gray-10 text-customs-gray-100 text-label1'>제시어</span>
            <div className='mt-4 text-center font-paperlogy font-bold text-[30px] leading-[130%] tracking-[1px]'>
              {lines.map((line, i) => (
                <div key={i}>
                  {line.map(({ char, index }) => (
                    <span
                      key={index}
                      className={
                        index < progress
                          ? 'text-customs-orange-50'
                          : index === progress && phase === 'playing'
                          ? 'text-customs-gray-10 underline decoration-customs-orange-50 decoration-4 underline-offset-4'
                          : 'text-customs-gray-10'
                      }
                    >
                      {mode === -1 && phase === 'idle' ? '?' : char}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {phase === 'playing' && (
              <div className='flex flex-wrap justify-center gap-x-4 gap-y-5 mt-8 max-w-[300px]'>
                {buttons.map((char) => (
                  <button
                    key={char}
                    onPointerDown={() => tap(char)}
                    className={`w-[80px] h-[80px] rounded-full font-paperlogy font-bold text-[32px] select-none touch-manipulation transition-transform duration-75 ${
                      wrong === char
                        ? 'bg-customs-gray-25 text-customs-gray-100 shadow-[0_3px_0_#19181b] translate-y-[5px]'
                        : pressed === char
                        ? 'bg-customs-orange-50 text-customs-gray-100 shadow-[0_2px_0_#c2531b] translate-y-[6px]'
                        : 'bg-customs-orange-50 text-customs-gray-100 shadow-[0_8px_0_#c2531b,0_12px_0_rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}

            {phase === 'idle' && (
              <p className='text-label2 text-customs-gray-50 mt-5 text-center'>
                동그란 버튼이 글자 종류만큼 나옵니다.
                <br />
                제시어를 처음부터 끝까지 순서대로 누르세요.
                {best > 0 && (
                  <>
                    <br />내 최고 기록 <b className='text-customs-orange-50'>{sec(best)}초</b>
                  </>
                )}
              </p>
            )}

            {phase === 'done' && (
              <div className='mt-6 w-full text-center pop-in'>
                <div className='rounded-[20px] bg-customs-orange-95-bg px-5 py-5'>
                  <p className='text-label2 text-customs-gray-25'>{grade(elapsed)}</p>
                  <h2 className='font-paperlogy font-bold text-[44px] leading-[120%] text-customs-orange-50 mt-1'>
                    {sec(elapsed)}
                    <span className='text-[22px] text-customs-gray-10'> 초</span>
                  </h2>
                  <p className='text-caption1 text-customs-gray-50 mt-1'>
                    {mode !== -1 && best === Math.round(elapsed) ? '내 최고 기록입니다!' : best > 0 ? `내 최고 기록 ${sec(best)}초` : ''}
                  </p>
                </div>
                {ranked && (
                  <div className='mt-3'>
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
              <div className='mt-5 w-full'>
                <button
                  onClick={start}
                  disabled={triesLeft <= 0}
                  className={`w-full py-4 rounded-full font-paperlogy font-bold text-[18px] ${
                    triesLeft <= 0
                      ? 'bg-customs-gray-90 text-customs-gray-75'
                      : 'bg-customs-orange-50 text-customs-gray-100 shadow-[0_6px_0_#c2531b] active:translate-y-[4px] active:shadow-[0_2px_0_#c2531b]'
                  }`}
                >
                  {triesLeft <= 0 ? '오늘 도전은 끝! 내일 다시 만나요' : phase === 'done' ? (mode === -1 ? '다음 제시어' : `다시 도전 (${triesLeft}번 남음)`) : '시작'}
                </button>
              </div>
            )}
          </div>
        </section>

        <Card title='오늘의 랭킹 TOP 10'>
          <p className='text-caption1 text-customs-gray-50 -mt-2 mb-4'>종목: 기본 제시어 · 매일 새로 시작합니다.</p>
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
