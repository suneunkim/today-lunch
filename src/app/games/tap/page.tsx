'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Card from '@/components/elements/Card'
import Ranking from '@/components/elements/Ranking'
import { fetchTapRank, submitTapScore, TapRank } from '@/lib/firebase/stats'
import { dateKey, getFlag, setFlag } from '@/lib/storage'
import ShareButton from '@/components/ShareButton'
import { renderDocCard } from '@/lib/shareCard'

// 헷갈리기 쉬운 메뉴끼리 묶은 메뉴판. 한 판에 한 묶음(9개)이 통째로 나옵니다.
const BOARDS = [
  ['김치찌개', '김치찜', '김치볶음밥', '김치전', '김치말이국수', '김치수제비', '된장찌개', '순두부찌개', '부대찌개'],
  ['짜장면', '간짜장', '삼선짜장', '쟁반짜장', '짬짜면', '짬뽕', '삼선짬뽕', '볶음짬뽕', '짬뽕밥'],
  ['칼국수', '바지락칼국수', '들깨칼국수', '닭칼국수', '팥칼국수', '잔치국수', '비빔국수', '막국수', '콩국수'],
  ['돈카츠 정식', '치즈돈카츠', '히레카츠', '카츠카레', '가츠동', '규카츠', '경양식 돈까스', '돈까스 김밥', '텐동'],
  ['순댓국', '돼지국밥', '소머리국밥', '수육국밥', '굴국밥', '콩나물국밥', '시래기국밥', '소고기국밥', '설렁탕'],
  ['김밥', '참치김밥', '충무김밥', '키토김밥', '유부초밥', '주먹밥', '오니기리', '후토마끼', '컵밥'],
  ['까르보나라', '알리오올리오', '봉골레파스타', '로제파스타', '투움바파스타', '토마토파스타', '명란 파스타', '라구 파스타', '아라비아따'],
  ['우동', '냉우동', '카레우동', '붓카케우동', '미소라멘', '쇼유라멘', '돈코츠 라멘', '츠케멘', '마제소바'],
  ['비빔밥', '돌솥비빔밥', '육회비빔밥', '꼬막비빔밥', '열무비빔밥', '멍게비빔밥', '중화비빔밥', '회덮밥', '알밥'],
  ['갈비탕', '삼계탕', '설렁탕', '곰탕', '도가니탕', '추어탕', '해물탕', '매운탕', '감자탕'],
]
const ROUNDS = 10
const PENALTY = 1000 // 잘못 누르면 1초 추가
const MAX_TRIES = 3

const ADJ = ['배고픈', '든든한', '매콤한', '느긋한', '재빠른', '출출한', '야무진', '깔끔한', '용감한', '신중한']
const NOUN = ['너구리', '국밥', '돈까스', '김밥', '만두', '라면', '떡볶이', '비빔밥', '우동', '탕수육']
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5)
const makeNickname = () => `${pick(ADJ)} ${pick(NOUN)} ${1000 + Math.floor(Math.random() * 9000)}`

type Round = { order: string; board: string[]; table: number }
// 10판: 메뉴판 묶음 순서를 섞고, 판마다 주문 메뉴 하나와 자리 배치를 새로 정합니다.
const makeRounds = (): Round[] =>
  shuffle(BOARDS)
    .slice(0, ROUNDS)
    .map((board) => ({ order: pick(board), board: shuffle(board), table: 1 + Math.floor(Math.random() * 12) }))

const sec = (ms: number) => (ms / 1000).toFixed(2)
const grade = (ms: number) =>
  ms < 8000
    ? '주문이 들어오기도 전에 누르셨습니다. 전설의 홀 매니저.'
    : ms < 11000
    ? '점심 러시도 거뜬합니다. 랭킹을 노려 보세요.'
    : ms < 15000
    ? '무난하게 받아냈습니다. 한 번 더 하면 줄어듭니다.'
    : '손님이 조금 기다렸습니다. 메뉴판을 눈에 익혀 보세요.'

// 스피드 주문받기: 주문 들어온 메뉴를 헷갈리는 메뉴판에서 최대한 빨리 찾아 누르는 게임
const Page = () => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [rounds, setRounds] = useState<Round[]>([])
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [misses, setMisses] = useState(0)
  const [wrong, setWrong] = useState('')
  const [tries, setTries] = useState(0)
  const [best, setBest] = useState(0)
  const [rank, setRank] = useState<TapRank[] | null>(null)
  const [registered, setRegistered] = useState('')
  const [nickname, setNickname] = useState('')
  const startedAt = useRef(0)
  const penalty = useRef(0)
  const frame = useRef(0)
  const today = dateKey()
  const triesLeft = MAX_TRIES - tries

  useEffect(() => {
    fetchTapRank(10).then(setRank)
    setTries(Number(getFlag(`orderTries:${today}`)) || 0)
    setBest(Number(getFlag('orderBest')) || 0)
    setNickname(getFlag('tapNickname'))
    return () => cancelAnimationFrame(frame.current)
  }, [today])

  const start = () => {
    if (triesLeft <= 0) return
    setRounds(makeRounds())
    setIndex(0)
    setMisses(0)
    setRegistered('')
    setElapsed(0)
    penalty.current = 0
    setTries(tries + 1)
    setFlag(`orderTries:${today}`, String(tries + 1))
    setPhase('playing')
    startedAt.current = performance.now()
    const tick = () => {
      setElapsed(performance.now() - startedAt.current + penalty.current)
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  const tap = (name: string) => {
    if (phase !== 'playing') return
    if (name !== rounds[index].order) {
      penalty.current += PENALTY
      setMisses((m) => m + 1)
      setWrong(name)
      setTimeout(() => setWrong(''), 250)
      return
    }
    if (index + 1 < ROUNDS) {
      setIndex(index + 1)
      return
    }
    cancelAnimationFrame(frame.current)
    const ms = Math.round(performance.now() - startedAt.current + penalty.current)
    setElapsed(ms)
    setPhase('done')
    if (!best || ms < best) {
      setBest(ms)
      setFlag('orderBest', String(ms))
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

  const round = rounds[index]

  return (
    <Container title='스피드 주문받기'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-5 min-h-[calc(100vh-48px)]'>
        <section className='bg-customs-gray-100 rounded-[28px] overflow-hidden'>
          {/* 위쪽 띠: 진행 상황과 시간 */}
          <div className='bg-customs-gray-10 px-5 py-4 flex items-center justify-between rounded-b-[28px]'>
            <span className='text-label2 text-customs-gray-75'>
              {phase === 'playing' ? `주문 ${index + 1} / ${ROUNDS}` : `오늘 남은 도전 ${Math.max(0, triesLeft)}번`}
            </span>
            <span className='px-4 py-1 rounded-full bg-[#2b292e] font-paperlogy font-bold text-[26px] text-customs-orange-50 tabular-nums'>
              {sec(elapsed)}
            </span>
          </div>

          <div className='px-4 pt-5 pb-6'>
            {phase === 'idle' && (
              <div className='flex flex-col items-center text-center px-2'>
                <img className='w-[110px] h-[102px] object-contain' src='/comment.png' alt='먹대리' />
                <h2 className='text-heading3 font-paperlogy text-customs-gray-10 mt-4'>점심 러시입니다. 주문 받아 주세요!</h2>
                <p className='text-label2 text-customs-gray-50 mt-2'>
                  주문이 들어오면 메뉴판에서 같은 메뉴를 최대한 빨리 누르세요.
                  <br />
                  총 {ROUNDS}건, 잘못 누르면 1초가 더해집니다.
                  {best > 0 && (
                    <>
                      <br />내 최고 기록 <b className='text-customs-orange-50'>{sec(best)}초</b>
                    </>
                  )}
                </p>
              </div>
            )}

            {phase === 'playing' && round && (
              <>
                {/* 주문서 */}
                <div key={index} className='reel-tick rounded-[18px] bg-customs-orange-95-bg px-4 py-4 text-center'>
                  <p className='text-caption1 text-customs-gray-50'>{round.table}번 테이블 주문이요!</p>
                  <h2 className='font-paperlogy font-bold text-[28px] leading-[125%] text-customs-orange-50 mt-1'>{round.order}</h2>
                </div>
                {/* 메뉴판: 판마다 메뉴와 자리가 바뀝니다 */}
                <div className='grid grid-cols-3 gap-x-2 gap-y-[14px] mt-5'>
                  {round.board.map((name) => (
                    <button
                      key={name}
                      onPointerDown={() => tap(name)}
                      className={`h-[68px] px-1 rounded-[16px] font-paperlogy font-bold text-[15px] leading-[125%] break-keep select-none touch-manipulation transition-transform duration-75 ${
                        wrong === name
                          ? 'bg-customs-gray-25 text-customs-gray-100 shadow-[0_2px_0_#19181b] translate-y-[4px]'
                          : 'bg-customs-gray-100 text-customs-gray-10 border-2 border-customs-gray-10 shadow-[0_6px_0_#19181b] active:translate-y-[4px] active:shadow-[0_2px_0_#19181b]'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <p className='text-caption1 text-customs-gray-50 text-center mt-5 h-4'>{misses > 0 && `잘못 누름 ${misses}번 (+${misses}초)`}</p>
              </>
            )}

            {phase === 'done' && (
              <div className='text-center pop-in'>
                <div className='rounded-[20px] bg-customs-orange-95-bg px-5 py-5'>
                  <p className='text-label2 text-customs-gray-25'>{grade(elapsed)}</p>
                  <h2 className='font-paperlogy font-bold text-[44px] leading-[120%] text-customs-orange-50 mt-1'>
                    {sec(elapsed)}
                    <span className='text-[22px] text-customs-gray-10'> 초</span>
                  </h2>
                  <p className='text-caption1 text-customs-gray-50 mt-1'>
                    주문 {ROUNDS}건 처리{misses > 0 && ` · 잘못 누름 ${misses}번`}
                    {best === Math.round(elapsed) ? ' · 내 최고 기록!' : best > 0 ? ` · 최고 ${sec(best)}초` : ''}
                  </p>
                </div>
                {registered && <p className='text-label2 text-customs-orange-50 mt-3'>{registered}</p>}
                <div className='flex gap-[10px] mt-3'>
                  {!registered && (
                    <Button type='sub' onClick={register}>
                      오늘의 랭킹에 넣기
                    </Button>
                  )}
                  <ShareButton
                    label='내기 신청하기'
                    text={`[스피드 주문받기] 주문 ${ROUNDS}건 ${sec(elapsed)}초!\n이 기록 깰 수 있나요? 점심 내기 하실래요? 진 사람이 쏘기!\n- 먹대리 드림`}
                    image={() =>
                      renderDocCard({
                        title: '스피드 주문받기 도전장',
                        lines: [
                          { label: `${sec(elapsed)}초`, sub: `주문 ${ROUNDS}건을 받는 데 걸린 시간`, badge: '★', checked: true },
                          { label: '점심 내기 하실래요?', sub: '이 기록을 못 깨면 점심 쏘기', badge: '?' },
                        ],
                      })
                    }
                  />
                </div>
              </div>
            )}

            {phase !== 'playing' && (
              <div className='mt-5 px-1'>
                <button
                  onClick={start}
                  disabled={triesLeft <= 0}
                  className={`w-full py-4 rounded-full font-paperlogy font-bold text-[18px] ${
                    triesLeft <= 0
                      ? 'bg-customs-gray-90 text-customs-gray-75'
                      : 'bg-customs-orange-50 text-customs-gray-100 shadow-[0_6px_0_#c2531b] active:translate-y-[4px] active:shadow-[0_2px_0_#c2531b]'
                  }`}
                >
                  {triesLeft <= 0 ? '오늘 영업 종료! 내일 다시 만나요' : phase === 'done' ? `다시 도전 (${triesLeft}번 남음)` : '영업 시작'}
                </button>
              </div>
            )}
          </div>
        </section>

        <Card title='오늘의 랭킹 TOP 10'>
          <p className='text-caption1 text-customs-gray-50 -mt-2 mb-4'>주문 {ROUNDS}건을 가장 빨리 받은 순서 · 매일 새로 시작합니다.</p>
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
