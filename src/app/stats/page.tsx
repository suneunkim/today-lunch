'use client'

import { useEffect, useState } from 'react'
import Container from '@/components/Container'
import Card from '@/components/elements/Card'
import Ranking from '@/components/elements/Ranking'
import { firebaseEnabled } from '@/firebase'
import { DailyStat, fetchDailyStats, fetchOrderStats, fetchTopMenu, getTotals } from '@/lib/firebase/stats'

type Totals = { useCount: number; installs: number }

const Tile = ({ label, value }: { label: string; value: string }) => (
  <div className='flex-1 rounded-[14px] bg-customs-gray-95 px-4 py-3'>
    <div className='text-caption1 text-customs-gray-50'>{label}</div>
    <div className='font-paperlogy font-bold text-[22px] text-customs-gray-10 mt-1'>{value}</div>
  </div>
)

type OrderStats = { plays: number; buckets: number[] } | null

// 주문받기 기록이 몇 초대에 몰려 있는지 (등급 기준을 조정할 때 봅니다)
const Distribution = ({ title, stats }: { title: string; stats: OrderStats }) => {
  if (!stats || stats.plays === 0) {
    return (
      <p className='text-label2 text-customs-gray-50 mb-3'>
        {title}: 아직 기록이 없습니다.
      </p>
    )
  }
  const last = Math.max(10, stats.buckets.reduce((acc, n, i) => (n > 0 ? i : acc), 0))
  const rows = stats.buckets.slice(0, last + 1)
  const max = Math.max(...rows)
  let acc = 0
  const median = rows.findIndex((n) => (acc += n) >= stats.plays / 2)
  return (
    <div className='mb-5'>
      <p className='text-label1 text-customs-gray-25 mb-2'>
        {title} · {stats.plays}판 · 가운데 기록 {median}초대
      </p>
      <div className='flex items-end gap-[2px] h-[70px]'>
        {rows.map((n, i) => (
          <div key={i} className='flex-1 rounded-t-[3px] bg-customs-orange-50' style={{ height: `${Math.max(2, (n / max) * 70)}px`, opacity: n ? 1 : 0.15 }} />
        ))}
      </div>
      <div className='flex justify-between text-caption1 text-customs-gray-50 mt-1'>
        <span>0초</span>
        <span>{last}초</span>
      </div>
    </div>
  )
}

// 이용 현황 보고: 얼마나 쓰였는지 한눈에 보는 화면
const Page = () => {
  const [totals, setTotals] = useState<Totals | null>(null)
  const [days, setDays] = useState<DailyStat[]>([])
  const [top, setTop] = useState<{ name: string; count: number }[]>([])
  const [loaded, setLoaded] = useState(false)
  const [order, setOrder] = useState<{ basic: OrderStats; hard: OrderStats }>({ basic: null, hard: null })

  useEffect(() => {
    Promise.all([getTotals(), fetchDailyStats(14), fetchTopMenu(10)]).then(([t, d, m]) => {
      setTotals(t)
      setDays(d)
      setTop(m)
      setLoaded(true)
    })
    Promise.all([fetchOrderStats('scores'), fetchOrderStats('hard')]).then(([basic, hard]) => setOrder({ basic, hard }))
  }, [])

  const num = (n: number | undefined) => (n === undefined ? '—' : n.toLocaleString('ko-KR'))
  const today = days[days.length - 1]
  const max = Math.max(1, ...days.map((d) => d.uses))
  const weekUses = days.slice(-7).reduce((sum, d) => sum + d.uses, 0)

  return (
    <Container title='이용 현황 보고'>
      <div className='bg-customs-beige-85 p-5 flex flex-col gap-5 min-h-[calc(100vh-48px)] pb-20'>
        {!firebaseEnabled ? (
          <Card>
            <p className='text-label2 text-customs-gray-50'>집계 서버(Firebase) 키가 설정되지 않아 집계를 볼 수 없습니다.</p>
          </Card>
        ) : !loaded ? (
          <Card>
            <p className='text-label2 text-customs-gray-50'>집계를 불러오는 중입니다…</p>
          </Card>
        ) : (
          <>
            <Card title='한눈에 보기'>
              <div className='flex gap-2'>
                <Tile label='누적 추천 횟수' value={num(totals?.useCount)} />
                <Tile label='누적 이용자' value={num(totals?.installs)} />
              </div>
              <div className='flex gap-2 mt-2'>
                <Tile label='오늘 추천' value={num(today?.uses)} />
                <Tile label='오늘 이용자' value={num(today?.users)} />
                <Tile label='최근 7일' value={num(weekUses)} />
              </div>
              {!totals && (
                <p className='text-caption1 text-customs-gray-50 mt-3'>
                  집계를 받아오지 못했습니다. 네트워크나 Firebase 설정을 확인해 주세요.
                </p>
              )}
            </Card>

            <Card title='최근 14일 추천 횟수'>
              <div className='flex items-end gap-[3px] h-[120px]'>
                {days.map((d) => (
                  <div key={d.date} className='flex-1 flex flex-col items-center justify-end h-full'>
                    <span className='text-[10px] text-customs-gray-50 mb-[2px]'>{d.uses || ''}</span>
                    <div
                      className='w-full rounded-t-[4px] bg-customs-orange-50'
                      style={{ height: `${Math.max(2, (d.uses / max) * 96)}px`, opacity: d.uses ? 1 : 0.2 }}
                    />
                  </div>
                ))}
              </div>
              <div className='flex justify-between text-caption1 text-customs-gray-50 mt-2'>
                <span>{days[0]?.date.slice(5).replace('-', '/')}</span>
                <span>오늘</span>
              </div>
            </Card>

            <Card title='가장 많이 결재된 메뉴'>
              {top.length === 0 ? (
                <p className='text-label2 text-customs-gray-50'>아직 집계된 메뉴가 없습니다.</p>
              ) : (
                <div className='flex flex-col gap-[10px]'>
                  {top.map((menu, i) => (
                    <div key={menu.name} className='flex items-center gap-4'>
                      <Ranking isFirst={i === 0}>{i + 1}위</Ranking>
                      <div className='flex w-full justify-between text-label2 text-customs-gray-10'>
                        <p className={i === 0 ? 'font-bold' : ''}>{menu.name}</p>
                        <div className={i === 0 ? 'font-bold' : ''}>{menu.count}번</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card title='스피드 주문받기 기록 분포'>
              <Distribution title='기본' stats={order.basic} />
              <Distribution title='챌린저' stats={order.hard} />
              <p className='text-caption1 text-customs-gray-50'>등급 기준 시간을 조정할 때 참고합니다.</p>
            </Card>
            <p className='text-caption1 text-customs-gray-50 px-1'>
              이용 기기·일간 이용자 수는 앱 버전부터 집계됩니다. 개인을 식별하는 정보는 수집하지 않습니다.
            </p>
          </>
        )}
      </div>
    </Container>
  )
}

export default Page
