'use client'

import { useEffect, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import DocTitle from '@/components/elements/DocTitle'
import ShareButton from '@/components/ShareButton'
import Clip from '@/components/features/result/Clip'
import { findMenu } from '@/app/data/food'
import { recommend } from '@/lib/recommend'
import { dateKey, getWeeklyPlan, saveWeeklyPlan } from '@/lib/storage'
import { renderDocCard } from '@/lib/shareCard'

const WEEKDAYS = ['월', '화', '수', '목', '금']

// 이번 주 월요일 (주말에는 다음 주 월요일)
const mondayOf = (now = new Date()) => {
  const d = new Date(now)
  const day = d.getDay()
  const diff = day === 0 ? 1 : day === 6 ? 2 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

// 같은 종류가 연달아 나오지 않게 5일치를 뽑습니다.
const drawWeek = () => {
  const menus: string[] = []
  for (let i = 0; i < 5; i++) {
    const candidates = recommend({ categories: ['전체'], count: 4, exclude: menus })
    const prevCat = menus.length ? findMenu(menus[menus.length - 1])?.cats[0] : null
    const pick = candidates.find((menu) => menu.cats[0] !== prevCat) ?? candidates[0]
    if (pick) menus.push(pick.name)
  }
  return menus
}

const Page = () => {
  const [menus, setMenus] = useState<string[]>([])
  const monday = mondayOf()
  const weekOf = dateKey(monday)

  useEffect(() => {
    const saved = getWeeklyPlan()
    if (saved && saved.weekOf === weekOf && saved.menus.length === 5) {
      setMenus(saved.menus)
    } else {
      const fresh = drawWeek()
      setMenus(fresh)
      saveWeeklyPlan({ weekOf, menus: fresh })
    }
  }, [weekOf])

  const update = (next: string[]) => {
    setMenus(next)
    saveWeeklyPlan({ weekOf, menus: next })
  }

  const swap = (index: number) => {
    const [pick] = recommend({ categories: ['전체'], count: 1, exclude: menus })
    if (pick) update(menus.map((name, i) => (i === index ? pick.name : name)))
  }

  const dateOf = (index: number) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + index)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
  const todayIndex = dateKey() >= weekOf ? new Date().getDay() - 1 : -1

  const shareText = `[주간 점심 계획서]\n${menus
    .map((name, i) => `${WEEKDAYS[i]}(${dateOf(i)}) ${name}`)
    .join('\n')}\n- 먹대리 드림`

  return (
    <Container title='주간 점심 계획서'>
      <div className='p-5 pb-28 bg-customs-orange-50 min-h-[calc(100vh-48px)]'>
        <div className='relative mt-[16px]'>
          <Clip />
          <div className='relative'>
            <div className='absolute bg-[#D1C9BD] top-[-8px] right-[-8px] w-full h-full rounded-[20px]' />
            <section className='relative px-[24px] py-[28px] bg-customs-gray-100 rounded-[20px]'>
              <DocTitle>주간 점심 계획서</DocTitle>
              <p className='text-caption1 text-customs-gray-50 mt-3 text-right'>
                {dateOf(0)} ~ {dateOf(4)} · 기안자 먹대리
              </p>
              <ul className='mt-2'>
                {menus.map((name, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-3 py-[14px] border-b border-customs-gray-95 last:border-b-0'
                  >
                    <span
                      className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-paperlogy text-label1 ${
                        i === todayIndex
                          ? 'bg-customs-orange-50 text-customs-gray-100'
                          : 'bg-customs-gray-95 text-customs-gray-25'
                      }`}
                    >
                      {WEEKDAYS[i]}
                    </span>
                    <div className='flex-1 min-w-0'>
                      <div className='text-body1Normal text-customs-gray-10'>{name}</div>
                      <div className='text-caption1 text-customs-gray-50 truncate'>
                        {findMenu(name)?.shortDescription}
                      </div>
                    </div>
                    <button
                      className='text-caption1 text-customs-gray-50 underline p-2 shrink-0'
                      onClick={() => swap(i)}
                    >
                      바꾸기
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <section className='flex flex-col gap-2 mt-6'>
            <Button type='secondary' onClick={() => update(drawWeek())}>
              전부 다시 짜기
            </Button>
            <ShareButton
              label='단톡방에 계획서 공유하기'
              text={shareText}
              image={() =>
                renderDocCard({
                  title: '주간 점심 계획서',
                  meta: `${dateOf(0)} ~ ${dateOf(4)} · 기안자 먹대리`,
                  lines: menus.map((name, i) => ({
                    label: name,
                    sub: findMenu(name)?.shortDescription,
                    badge: WEEKDAYS[i],
                    checked: i === todayIndex,
                  })),
                })
              }
            />
          </section>
        </div>
      </div>
    </Container>
  )
}

export default Page
