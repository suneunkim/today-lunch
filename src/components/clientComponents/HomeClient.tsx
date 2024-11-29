'use client'

import { useCallback, useEffect, useState } from 'react'
import MenuSelection from '../MenuSelection'
import Button from '../elements/Button'
import { useRouter } from 'next/navigation'
import Loading from '../Loading'

import { app } from '@/firebase'
import { getAnalytics } from 'firebase/analytics'
import { logEvent } from 'firebase/analytics'
import { incrementServiceUseCount } from '@/lib/firebase/clickCount'

const HomeClient = () => {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null) // 상태로 analytics 관리
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<string[]>(['전체'])
  const [isLoading, setIsLoading] = useState(false)

  // firebase로 추가 연동한 구글 분석에 버튼 이벤트 보내보기
  // getAnalytics() 초기화는 클라이언트에서만 가능
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const analyticsInstance = getAnalytics(app)
      setAnalytics(analyticsInstance) // 초기화된 analytics를 상태에 저장
      setAnalyticsInitialized(true)
    }
  }, [])

  const handleSubmit = async () => {
    setIsLoading(true)
    const categoriesString = selectedMenu.join(',')

    if (analyticsInitialized && analytics) {
      logEvent(analytics, 'recommend_button_click')
    }

    // fireStore로 서비스 버튼 클릭 카운트
    await incrementServiceUseCount()

    setTimeout(() => {
      router.push(`/result?categories=${categoriesString}`)
    }, 1000)
  }

  const handleClick = useCallback((menu: string) => {
    setSelectedMenu((prev) => {
      if (menu === '전체') {
        // '전체'가 눌리면 나머지 선택 해제
        return prev.includes('전체') ? [] : ['전체']
      }

      // '전체'가 선택되어 있으면 '전체'를 제거하고 선택된 메뉴만 추가
      if (prev.includes('전체')) {
        return [...prev.filter((item) => item !== '전체'), menu]
      }

      // 이미 선택된 메뉴라면 제거
      if (prev.includes(menu)) {
        return prev.filter((item) => item !== menu)
      }

      // 전체를 제외하고 나머지 8개 메뉴 모두 선택되면 '전체'로 설정
      if (prev.length === 7) {
        return ['전체']
      }

      return [...prev, menu]
    })
  }, [])

  return (
    <div className='flex flex-col gap-5'>
      {isLoading ? (
        <div>
          <Loading />
        </div>
      ) : (
        <>
          <MenuSelection selectedMenu={selectedMenu} handleClick={handleClick} />
          <Button onClick={handleSubmit} type='primary'>
            점심메뉴 제안받기
          </Button>
        </>
      )}
    </div>
  )
}

export default HomeClient
