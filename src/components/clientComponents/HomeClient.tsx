'use client'

import { useCallback, useState } from 'react'
import MenuSelection from '../MenuSelection'
import Button from '../elements/Button'
import Chip from '../elements/Chip'
import { useRouter } from 'next/navigation'
import Loading from '../Loading'
import { trackUse } from '@/lib/firebase/stats'
import { FilterKey, FILTERS } from '@/lib/recommend'

const HomeClient = () => {
  const router = useRouter()
  const [selectedMenu, setSelectedMenu] = useState<string[]>(['전체'])
  const [filters, setFilters] = useState<FilterKey[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    if (selectedMenu.length === 0) return
    setIsLoading(true)
    // 집계는 기다리지 않습니다. (서버가 느리거나 꺼져 있어도 결과 화면은 열려야 하므로)
    trackUse()

    const params = new URLSearchParams({ categories: selectedMenu.join(',') })
    if (filters.length > 0) params.set('f', filters.join(','))
    setTimeout(() => {
      router.push(`/result?${params.toString()}`)
    }, 900)
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

  const toggleFilter = (key: FilterKey) => {
    setFilters((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key)
      // 가볍게 ↔ 든든하게 는 둘 중 하나만
      const opposite = key === 'light' ? 'hearty' : key === 'hearty' ? 'light' : null
      return [...prev.filter((k) => k !== opposite), key]
    })
  }

  return (
    <div className='flex flex-col gap-5'>
      {isLoading ? (
        <div>
          <Loading />
        </div>
      ) : (
        <>
          <MenuSelection selectedMenu={selectedMenu} handleClick={handleClick} />
          <section>
            <p className='text-label1 text-customs-gray-25 mb-2'>요청 사항 (선택)</p>
            <div className='flex flex-wrap gap-2'>
              {FILTERS.map((filter) => (
                <Chip
                  key={filter.key}
                  selected={filters.includes(filter.key)}
                  onClick={() => toggleFilter(filter.key)}
                >
                  {filter.label}
                </Chip>
              ))}
            </div>
          </section>
          <Button onClick={handleSubmit} type='primary' disabled={selectedMenu.length === 0}>
            점심메뉴 제안받기
          </Button>
          <Button type='secondary' onClick={() => router.push('/slot')}>
            고민 없이 랜덤으로 뽑기
          </Button>
        </>
      )}
    </div>
  )
}

export default HomeClient
