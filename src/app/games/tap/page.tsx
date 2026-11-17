'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Card from '@/components/elements/Card'
import GameButton from '@/components/elements/GameButton'
import Chip from '@/components/elements/Chip'
import Ranking from '@/components/elements/Ranking'
import { fetchOrderPercentile, fetchTapRank, submitTapScore, TapRank, trackOrderTime } from '@/lib/firebase/stats'
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
// 칸 모양: 게임을 시작할 때마다 하나를 무작위로 고릅니다. (모양은 globals.css의 .tile-*)
const SKINS = ['postit', 'plate', 'ticket', 'keycap', 'number', 'stamp', 'calendar', 'coaster'] as const
// 주문 수: 기본 10건, 챌린저는 한 주문에 메뉴 2개라 6건(메뉴 12개)
const roundsOf = (hard: boolean) => (hard ? 6 : 10)
const PENALTY = 1000 // 잘못 누르면 1초 추가
const MAX_REGISTER = 3 // 랭킹 등록은 하루 3번까지 (게임은 횟수 제한 없음)

const ADJ = ['배고픈', '든든한', '매콤한', '느긋한', '재빠른', '출출한', '야무진', '깔끔한', '용감한', '신중한']
const NOUN = ['너구리', '국밥', '돈까스', '김밥', '만두', '라면', '떡볶이', '비빔밥', '우동', '탕수육']
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5)
const makeNickname = () => `${pick(ADJ)} ${pick(NOUN)} ${1000 + Math.floor(Math.random() * 9000)}`

// 챌린저 모드
// - 한 주문에 메뉴가 2개: 적힌 순서대로 둘 다 눌러야 합니다.
// - 칸마다 파스텔 색이 깔리고 주문서에도 색이 칠해지지만, 색은 정답과 아무 상관이 없습니다(무작위).
// - 잘못 누르면 칸 위치와 색이 전부 다시 섞입니다.
// 색 하나는 바탕(tile), 연한 색(light), 진한 색(dark), 글씨용(deep), 어울리는 다른 색(accent)으로 이루어지고,
// 칸 모양마다 이 색들을 다르게 씁니다 (자판은 옆면에 dark, 접시는 안쪽 테두리에 accent 등).
const TILE_COLORS = [
  { tile: '#FFE9A8', light: '#FFF7DA', dark: '#E0C067', deep: '#A87B00', accent: '#F47A3A' },
  { tile: '#CFE6FF', light: '#ECF5FF', dark: '#98BDE6', deep: '#3A72B0', accent: '#F2A9C4' },
  { tile: '#D5F0C2', light: '#EFFAE6', dark: '#A2CC87', deep: '#4A8A2E', accent: '#F5C24B' },
  { tile: '#FFD6E6', light: '#FFF0F6', dark: '#E39FBB', deep: '#BF4F7B', accent: '#8FC7E8' },
  { tile: '#E3DBFF', light: '#F4F0FF', dark: '#B3A5E6', deep: '#6652BD', accent: '#F5C24B' },
  { tile: '#FFDCC8', light: '#FFF1E8', dark: '#E5AB8B', deep: '#C56433', accent: '#8CCFB0' },
]
type TileColor = (typeof TILE_COLORS)[number]
const tileVars = (c: TileColor) =>
  ({ '--tile': c.tile, '--tile-light': c.light, '--tile-dark': c.dark, '--tile-deep': c.deep, '--tile-accent': c.accent }) as React.CSSProperties

type Round = { orders: string[]; board: string[]; table: number; colors: TileColor[]; lure: TileColor }
// 10판: 메뉴판 묶음 순서를 섞고, 판마다 주문 메뉴 하나와 자리 배치를 새로 정합니다.
const makeRounds = (count: number): Round[] =>
  shuffle(BOARDS)
    .slice(0, count)
    .map((names, i) => {
      const board = shuffle(names)
      const colors = board.map(() => pick(TILE_COLORS))
      // 주문 2개(챌린저용). 기본 모드는 첫 번째만 씁니다.
      return { orders: shuffle(board).slice(0, 2), board, table: i + 1, colors, lure: pick(TILE_COLORS) }
    })

const sec = (ms: number) => (ms / 1000).toFixed(2)
// 등급: 6단계. [이 시간(초) 미만, 이름, 한마디]
// 기준 시간은 직접 해 본 기록(기본 14~15초, 챌린저 10건 37초)을 가운데 등급에 맞춰 잡았고,
// 쌓이는 기록 분포(이용 현황 화면)를 보고 조정합니다.
const GRADES_BASIC: [number, string, string][] = [
  [9, '전설의 홀 매니저', '주문이 들어오기도 전에 누르셨습니다.'],
  [11, '에이스 알바', '점심 러시도 거뜬합니다. 랭킹을 노려 보세요.'],
  [13, '능숙한 직원', '손님이 기다릴 틈이 없었습니다.'],
  [16, '무난한 신입', '무난하게 받아냈습니다. 한 번 더 하면 줄어듭니다.'],
  [20, '수습 기간', '손님이 조금 기다렸습니다. 메뉴판을 눈에 익혀 보세요.'],
  [Infinity, '첫 출근', '괜찮습니다. 누구나 처음엔 메뉴판이 낯섭니다.'],
]
const GRADES_HARD: [number, string, string][] = [
  [13, '주방의 지배자', '색깔 함정이 전혀 통하지 않았습니다.'],
  [16, '러시아워 해결사', '두 메뉴를 한 번에 외우는 실력입니다.'],
  [19, '멀티태스킹 고수', '헷갈릴 만한데 침착하게 받아냈습니다.'],
  [23, '침착한 서버', '순서만 조금 더 빨리 읽으면 됩니다.'],
  [28, '진땀 나는 홀', '색에 속지 말고 글자만 보세요.'],
  [Infinity, '주문 폭주', '챌린저는 원래 어렵습니다. 한 판 더 가시죠.'],
]
const gradeOf = (ms: number, hard: boolean) => {
  const list = hard ? GRADES_HARD : GRADES_BASIC
  const level = list.findIndex(([limit]) => ms / 1000 < limit)
  return { title: list[level][1], desc: list[level][2], level: level + 1 }
}

// 스피드 주문받기: 주문 들어온 메뉴를 헷갈리는 메뉴판에서 최대한 빨리 찾아 누르는 게임
const Page = () => {
  const [hard, setHard] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'ready' | 'playing' | 'done'>('idle')
  const [rounds, setRounds] = useState<Round[]>([])
  const [index, setIndex] = useState(0)
  const [skin, setSkin] = useState<(typeof SKINS)[number] | ''>('')
  const [count, setCount] = useState(3)
  const [step, setStep] = useState(0) // 챌린저: 한 주문 안에서 몇 번째 메뉴까지 눌렀는지
  const [elapsed, setElapsed] = useState(0)
  const [misses, setMisses] = useState(0)
  const [wrong, setWrong] = useState('')
  const [tries, setTries] = useState(0)
  const [best, setBest] = useState(0)
  const [rank, setRank] = useState<TapRank[] | null>(null)
  const [registered, setRegistered] = useState('')
  const [nickname, setNickname] = useState('')
  const [percentile, setPercentile] = useState<number | null>(null)
  const startedAt = useRef(0)
  const penalty = useRef(0)
  const frame = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const today = dateKey()
  const ROUNDS = roundsOf(hard)
  const registerLeft = MAX_REGISTER - tries // tries = 오늘 랭킹에 등록한 횟수

  const key = hard ? 'Hard' : ''
  const board = hard ? 'hard' : 'scores'

  // 모드를 바꾸면 그 모드의 랭킹, 오늘 남은 횟수, 최고 기록을 불러옵니다.
  useEffect(() => {
    cancelAnimationFrame(frame.current)
    timers.current.forEach(clearTimeout)
    setPhase('idle')
    setElapsed(0)
    setRegistered('')
    setRank(null)
    fetchTapRank(10, hard ? 'hard' : 'scores').then(setRank)
    setTries(Number(getFlag(`orderRegs${hard ? 'Hard' : ''}:${today}`)) || 0)
    setBest(Number(getFlag(`orderBest${hard ? 'Hard' : ''}`)) || 0)
    setNickname(getFlag('tapNickname'))
    return () => cancelAnimationFrame(frame.current)
  }, [today, hard])

  const start = () => {
    setRounds(makeRounds(ROUNDS))
    // 직전 판과 다른 모양으로
    setSkin((prev) => pick(SKINS.filter((name) => name !== prev)))
    setIndex(0)
    setStep(0)
    setMisses(0)
    setRegistered('')
    setElapsed(0)
    penalty.current = 0
    // 3, 2, 1 카운트다운 뒤에 시계가 돌기 시작합니다.
    setPhase('ready')
    setCount(3)
    timers.current.forEach(clearTimeout)
    timers.current = [
      setTimeout(() => setCount(2), 600),
      setTimeout(() => setCount(1), 1200),
      setTimeout(() => {
        setPhase('playing')
        startedAt.current = performance.now()
        const tick = () => {
          setElapsed(performance.now() - startedAt.current + penalty.current)
          frame.current = requestAnimationFrame(tick)
        }
        frame.current = requestAnimationFrame(tick)
      }, 1800),
    ]
  }

  const tap = (name: string) => {
    if (phase !== 'playing') return
    const current = rounds[index]
    const need = hard ? 2 : 1
    if (name !== current.orders[step]) {
      penalty.current += PENALTY
      setMisses((m) => m + 1)
      setWrong(name)
      setTimeout(() => setWrong(''), 250)
      if (hard) {
        // 챌린저: 틀리면 칸 위치와 색을 다시 섞습니다.
        setTimeout(() => {
          setRounds((prev) =>
            prev.map((r, i) =>
              i === index ? { ...r, board: shuffle(r.board), colors: r.board.map(() => pick(TILE_COLORS)), lure: pick(TILE_COLORS) } : r
            )
          )
        }, 250)
      }
      return
    }
    if (step + 1 < need) {
      setStep(step + 1)
      return
    }
    setStep(0)
    if (index + 1 < ROUNDS) {
      setIndex(index + 1)
      return
    }
    cancelAnimationFrame(frame.current)
    const ms = Math.round(performance.now() - startedAt.current + penalty.current)
    setElapsed(ms)
    setPhase('done')
    setPercentile(null)
    trackOrderTime(ms, board)
    fetchOrderPercentile(ms, board).then(setPercentile)
    if (!best || ms < best) {
      setBest(ms)
      setFlag(`orderBest${key}`, String(ms))
    }
  }

  const register = async () => {
    if (registered || registerLeft <= 0) return
    let name = getFlag('tapNickname')
    if (!name) {
      name = makeNickname()
      setFlag('tapNickname', name)
    }
    setNickname(name)
    setRegistered('등록 중…')
    const ok = await submitTapScore(name, Math.round(elapsed), board)
    setRegistered(ok ? `‘${name}’(으)로 등록했습니다.` : '등록하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    if (ok) {
      setTries(tries + 1)
      setFlag(`orderRegs${key}:${today}`, String(tries + 1))
      fetchTapRank(10, board).then(setRank)
    }
  }

  const round = rounds[index]

  return (
    <Container title='스피드 주문받기'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-5 min-h-[calc(100vh-48px)]'>
        <div className='flex gap-2'>
          <Chip selected={!hard} onClick={() => (phase === 'idle' || phase === 'done') && setHard(false)}>
            기본
          </Chip>
          <Chip selected={hard} onClick={() => (phase === 'idle' || phase === 'done') && setHard(true)}>
            챌린저
          </Chip>
        </div>

        <section className='bg-customs-gray-100 rounded-[28px] overflow-hidden'>
          {/* 위쪽 띠: 진행 상황과 시간 */}
          <div className='bg-customs-gray-10 px-5 py-4 flex items-center justify-between rounded-b-[28px]'>
            <span className='text-label2 text-customs-gray-75'>
              {phase === 'playing' ? `주문 ${index + 1} / ${ROUNDS}` : hard ? '챌린저 모드' : '기본 모드'}
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
                  {hard && (
                    <>
                      <br />
                      <b className='text-customs-gray-10'>
                        챌린저: 주문마다 메뉴 2개를 순서대로 누릅니다. 색은 함정이고, 틀리면 칸이 다시 섞입니다.
                      </b>
                    </>
                  )}
                  {best > 0 && (
                    <>
                      <br />내 최고 기록 <b className='text-customs-orange-50'>{sec(best)}초</b>
                    </>
                  )}
                </p>
              </div>
            )}

            {phase === 'ready' && (
              <div className='h-[300px] flex flex-col items-center justify-center'>
                <p className='text-label2 text-customs-gray-50'>첫 주문이 곧 들어옵니다</p>
                <span key={count} className='pop-in font-paperlogy font-bold text-[96px] leading-none text-customs-orange-50 mt-2'>
                  {count}
                </span>
              </div>
            )}

            {phase === 'playing' && round && (
              <>
                {/* 주문서 */}
                <div
                  key={index}
                  className='reel-tick rounded-[18px] bg-customs-orange-95-bg px-4 py-4 text-center'
                  style={hard ? { background: round.lure.tile } : undefined}
                >
                  <p className={`text-caption1 ${hard ? 'text-customs-gray-25' : 'text-customs-gray-50'}`}>{round.table}번 테이블 주문이요!</p>
                  {hard ? (
                    <h2 className='font-paperlogy font-bold text-[23px] leading-[130%] mt-1 text-customs-gray-10'>
                      <span className={step > 0 ? 'opacity-30 line-through' : ''}>{round.orders[0]}</span>
                      <span className='text-customs-gray-50 text-[16px]'> 다음 </span>
                      <span>{round.orders[1]}</span>
                    </h2>
                  ) : (
                    <h2 className='font-paperlogy font-bold text-[28px] leading-[125%] mt-1 text-customs-orange-50'>{round.orders[0]}</h2>
                  )}
                </div>
                {/* 메뉴판: 판마다 메뉴와 자리가 바뀝니다 */}
                <div className={`grid grid-cols-3 mt-5 items-center ${skin === 'postit' || skin === 'stamp' ? 'gap-x-3 gap-y-4' : 'gap-x-2 gap-y-[14px]'}`}>
                  {round.board.map((name, i) => (
                    <button
                      key={name}
                      onPointerDown={() => tap(name)}
                      className={`tile tile-${skin} font-paperlogy ${wrong === name ? 'tile-wrong' : ''}`}
                      style={hard ? tileVars(round.colors[i]) : undefined}
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
                  <p className='text-caption1 text-customs-gray-50'>
                    {gradeOf(elapsed, hard).level}등급{percentile !== null && ` · 상위 ${percentile}%`}
                  </p>
                  <p className='font-paperlogy font-bold text-[22px] text-customs-gray-10'>{gradeOf(elapsed, hard).title}</p>
                  <p className='text-label2 text-customs-gray-25 mt-1'>{gradeOf(elapsed, hard).desc}</p>
                  <h2 className='font-paperlogy font-bold text-[44px] leading-[120%] text-customs-orange-50 mt-1'>
                    {sec(elapsed)}
                    <span className='text-[22px] text-customs-gray-10'> 초</span>
                  </h2>
                  <p className='text-caption1 text-customs-gray-50 mt-1'>
                    주문 {ROUNDS}건{hard && ` (메뉴 ${ROUNDS * 2}개)`} 처리{misses > 0 && ` · 잘못 누름 ${misses}번`}
                    {best === Math.round(elapsed) ? ' · 내 최고 기록!' : best > 0 ? ` · 최고 ${sec(best)}초` : ''}
                  </p>
                </div>
                {registered && <p className='text-label2 text-customs-orange-50 mt-3'>{registered}</p>}
                <div className='flex gap-[10px] mt-3'>
                  {!registered && registerLeft > 0 && (
                    <Button type='sub' onClick={register}>
                      랭킹에 넣기 ({registerLeft}번 남음)
                    </Button>
                  )}
                  <ShareButton
                    label='내기 신청하기'
                    text={`[스피드 주문받기${hard ? ' 챌린저' : ''}] 주문 ${ROUNDS}건 ${sec(elapsed)}초!\n이 기록 깰 수 있나요? 점심 내기 하실래요? 진 사람이 쏘기!\n- 먹대리 드림`}
                    image={() =>
                      renderDocCard({
                        title: hard ? '주문받기 챌린저 도전장' : '스피드 주문받기 도전장',
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

            {(phase === 'idle' || phase === 'done') && (
              <div className='mt-5 px-1'>
                <GameButton onClick={start}>{phase === 'done' ? '다시 도전' : '영업 시작'}</GameButton>
              </div>
            )}
          </div>
        </section>

        <Card title={hard ? '오늘의 챌린저 랭킹 TOP 10' : '오늘의 랭킹 TOP 10'}>
          <p className='text-caption1 text-customs-gray-50 -mt-2 mb-4'>
            주문 {ROUNDS}건을 가장 빨리 받은 순서 · 매일 새로 시작 · 등록은 하루 {MAX_REGISTER}번
          </p>
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
