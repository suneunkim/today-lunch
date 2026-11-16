'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Card from '@/components/elements/Card'
import DocTitle from '@/components/elements/DocTitle'
import Ranking from '@/components/elements/Ranking'
import MapPanel from '@/components/features/map/MapPanel'
import ShareButton from '@/components/ShareButton'
import { findMenu } from '@/app/data/food'
import { WORLDCUP_MODES } from '@/app/data/worldcup'
import { fetchWorldcupRank, trackPick, trackWorldcup, WorldcupRank } from '@/lib/firebase/stats'
import { renderDocCard } from '@/lib/shareCard'
import { addHistory } from '@/lib/storage'

const shuffle = <T,>(list: readonly T[]) => [...list].sort(() => Math.random() - 0.5)
const roundName = (size: number) => (size === 2 ? '결승' : size === 4 ? '준결승' : `${size}강`)

const RankList = ({ refreshKey }: { refreshKey: number }) => {
  const [rank, setRank] = useState<WorldcupRank[] | null>(null)
  useEffect(() => {
    fetchWorldcupRank(10).then(setRank)
  }, [refreshKey])

  return (
    <Card title='역대 우승 메뉴 TOP 10'>
      {!rank ? (
        <p className='text-label2 text-customs-gray-50'>순위를 불러오는 중입니다…</p>
      ) : rank.length === 0 ? (
        <p className='text-label2 text-customs-gray-50'>아직 집계된 우승 메뉴가 없습니다. 첫 우승 메뉴를 만들어 주세요!</p>
      ) : (
        <div className='flex flex-col gap-[10px]'>
          {rank.map((menu, i) => (
            <div key={menu.name} className='flex items-center gap-4'>
              <Ranking isFirst={i === 0}>{i + 1}위</Ranking>
              <div className='flex w-full justify-between items-baseline text-label2 text-customs-gray-10'>
                <p className={i === 0 ? 'font-bold' : ''}>{menu.name}</p>
                <div>
                  <b>우승 {menu.wins}회</b>
                  <span className='text-caption1 text-customs-gray-50'> · {menu.picks}표</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

const Page = () => {
  const [round, setRound] = useState<string[]>([]) // 이번 라운드 출전 메뉴
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState('') // 방금 고른 메뉴 (잠깐 강조)
  const [champion, setChampion] = useState('')
  const [finalists, setFinalists] = useState<string[]>([]) // 준우승, 4강
  const [approved, setApproved] = useState(false)
  const [rankKey, setRankKey] = useState(0)
  const winners = useRef<string[]>([])
  const picks = useRef<Record<string, number>>({})
  const semis = useRef<string[]>([])

  const start = (key: string) => {
    const mode = WORLDCUP_MODES.find((m) => m.key === key)!
    winners.current = []
    picks.current = {}
    semis.current = []
    setChampion('')
    setApproved(false)
    setIndex(0)
    setRound(shuffle(mode.pool).slice(0, mode.size))
  }

  const choose = (name: string) => {
    if (picked) return
    setPicked(name)
    picks.current[name] = (picks.current[name] ?? 0) + 1
    setTimeout(() => {
      setPicked('')
      if (round.length === 4) semis.current.push(round[index] === name ? round[index + 1] : round[index])
      winners.current.push(name)
      if (index + 2 < round.length) {
        setIndex(index + 2)
        return
      }
      if (winners.current.length === 1) {
        const runnerUp = round[0] === name ? round[1] : round[0]
        setFinalists([runnerUp, ...semis.current])
        setChampion(name)
        trackWorldcup(picks.current, name)
        setTimeout(() => setRankKey((k) => k + 1), 1500)
        return
      }
      setRound(winners.current)
      winners.current = []
      setIndex(0)
    }, 450)
  }

  const approve = () => {
    if (approved) return
    setApproved(true)
    addHistory(champion)
    trackPick(champion)
  }

  const reset = () => {
    setRound([])
    setChampion('')
  }

  return (
    <Container title='메뉴 월드컵'>
      <div className='bg-customs-beige-85 p-5 pb-28 flex flex-col gap-5 min-h-[calc(100vh-48px)]'>
        {/* 시작 전: 대진 고르기 */}
        {round.length === 0 && (
          <>
            <Card title='어떤 대진으로 할까요?'>
              <div className='flex flex-col gap-[10px]'>
                {WORLDCUP_MODES.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => start(mode.key)}
                    className='w-full text-left px-5 py-4 rounded-[14px] border border-customs-gray-90 active:bg-customs-orange-95-bg'
                  >
                    <div className='text-body1Normal text-customs-gray-10'>{mode.label}</div>
                    <div className='text-caption1 text-customs-gray-50 mt-1'>{mode.desc}</div>
                  </button>
                ))}
              </div>
            </Card>
            <RankList refreshKey={rankKey} />
          </>
        )}

        {/* 진행 중 */}
        {round.length > 0 && !champion && (
          <>
            <div className='flex items-end justify-between'>
              <h2 className='text-[24px] font-bold font-paperlogy text-customs-gray-10'>{roundName(round.length)}</h2>
              <span className='text-label2 text-customs-gray-50'>
                {index / 2 + 1} / {round.length / 2} 경기
              </span>
            </div>
            <div className='relative flex flex-col gap-3'>
              {[round[index], round[index + 1]].map((name) => (
                <button
                  key={name}
                  onClick={() => choose(name)}
                  className={`w-full h-[150px] rounded-[20px] px-5 flex flex-col items-center justify-center gap-2 border-2 transition-all duration-200 ${
                    picked === name
                      ? 'bg-customs-orange-50 border-customs-orange-50 text-customs-gray-100 scale-[1.02]'
                      : picked
                      ? 'bg-customs-gray-100 border-customs-gray-100 opacity-40'
                      : 'bg-customs-gray-100 border-customs-gray-100 text-customs-gray-10'
                  }`}
                >
                  <span className='text-[26px] leading-[120%] font-bold font-paperlogy'>{name}</span>
                  <span className={`text-label2 ${picked === name ? '' : 'text-customs-gray-50'}`}>
                    {findMenu(name)?.shortDescription}
                  </span>
                </button>
              ))}
              <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-customs-gray-10 text-customs-gray-100 font-paperlogy text-label1 flex items-center justify-center'>
                VS
              </span>
            </div>
            <p className='text-label2 text-customs-gray-50 text-center'>지금 더 먹고 싶은 쪽을 눌러 주세요.</p>
            <Button type='ghost' onClick={reset}>
              그만하기
            </Button>
          </>
        )}

        {/* 결과 */}
        {champion && (
          <>
            <section className='px-6 py-7 bg-customs-gray-100 rounded-[20px] pop-in'>
              <DocTitle>메뉴 월드컵 결과 보고</DocTitle>
              <p className='text-label2 text-customs-gray-50 mt-6'>🏆 오늘의 우승 메뉴</p>
              <h2 className='text-[30px] leading-[130%] font-bold font-paperlogy text-customs-orange-50 mt-1'>
                {champion}
              </h2>
              <p className='text-body2 text-customs-gray-25 mt-2'>{findMenu(champion)?.description}</p>
              <p className='text-label2 text-customs-gray-50 mt-4'>
                준우승 {finalists[0]}
                {finalists.length > 1 && ` · 4강 ${finalists.slice(1).join(', ')}`}
              </p>
              <div className='flex gap-[10px] mt-6'>
                <Button type='secondary' onClick={reset}>
                  다시 하기
                </Button>
                <Button type='primary' onClick={approve} disabled={approved}>
                  {approved ? '결재 완료' : '이걸로 결재'}
                </Button>
              </div>
              <div className='mt-[10px]'>
                <ShareButton
                  label='결과 공유하기'
                  text={`[메뉴 월드컵]\n오늘의 우승 메뉴는 ‘${champion}’! (준우승 ${finalists[0]})\n- 먹대리 드림`}
                  image={() =>
                    renderDocCard({
                      title: '메뉴 월드컵 결과',
                      lines: [
                        { label: champion, sub: '우승', badge: '1', checked: true },
                        { label: finalists[0], sub: '준우승', badge: '2' },
                        ...finalists.slice(1).map((name) => ({ label: name, sub: '4강', badge: '4' })),
                      ],
                    })
                  }
                />
              </div>
            </section>
            <MapPanel menu={champion} />
            <RankList refreshKey={rankKey} />
          </>
        )}
      </div>
    </Container>
  )
}

export default Page
