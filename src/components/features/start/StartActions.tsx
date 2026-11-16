'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/elements/Button'
import ServiceClickCount from './ServiceClickCount'
import { getTotals } from '@/lib/firebase/stats'
import { getPrefs } from '@/lib/storage'

export const StartButton = () => {
  // 처음 온 사람은 취향 조사부터, 아니면 바로 메뉴 고르기로
  const [href, setHref] = useState('/home')
  useEffect(() => {
    if (!getPrefs().onboarded) setHref('/onboarding')
  }, [])

  return (
    <Link href={href} className='z-10'>
      <Button
        type='primary'
        className='max-w-[155px] font-paperlogy mt-[28px] z-10'
        aria-label='점심 메뉴 추천 시작하기'
      >
        GO START
      </Button>
    </Link>
  )
}

// 누적 이용 수는 받아오는 대로 표시 (못 받아와도 화면은 그대로)
export const StartCount = () => {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    getTotals().then((totals) => totals && setCount(totals.useCount))
  }, [])

  if (count === null) return null
  return <ServiceClickCount count={count} />
}
