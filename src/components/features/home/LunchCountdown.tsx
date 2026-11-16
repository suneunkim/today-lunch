'use client'

import { useEffect, useState } from 'react'
import { getSettings } from '@/lib/storage'

const messageFor = (now: Date, lunchHour: number, lunchMinute: number) => {
  const day = now.getDay()
  if (day === 0 || day === 6) return '주말에도 메뉴 제안드리겠습니다!'
  const diff = lunchHour * 60 + lunchMinute - (now.getHours() * 60 + now.getMinutes())
  if (diff > 180) return '메뉴 제안드리겠습니다!'
  if (diff > 60) return `점심까지 ${Math.floor(diff / 60)}시간 ${diff % 60}분 남았습니다.`
  if (diff > 0) return `점심까지 ${diff}분! 조금만 버티십시오.`
  if (diff > -90) return '점심시간입니다. 메뉴 결재 부탁드립니다!'
  return '식사는 맛있게 하셨습니까?'
}

// 먹대리 말풍선 두 번째 줄: 점심시간까지 남은 시간
const LunchCountdown = () => {
  const [message, setMessage] = useState('메뉴 제안드리겠습니다!')

  useEffect(() => {
    const update = () => {
      const { lunchHour, lunchMinute } = getSettings()
      setMessage(messageFor(new Date(), lunchHour, lunchMinute))
    }
    update()
    const timer = setInterval(update, 30000)
    return () => clearInterval(timer)
  }, [])

  return <>{message}</>
}

export default LunchCountdown
