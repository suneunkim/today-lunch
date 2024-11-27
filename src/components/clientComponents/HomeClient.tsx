'use client'

import { useCallback, useState } from 'react'
import MenuSelection from '../MenuSelection'
import Button from '../elements/Button'
import { useRouter } from 'next/navigation'
import Loading from '../Loading'

const HomeClient = () => {
  const router = useRouter()
  const [selectedMenu, setSelectedMenu] = useState<string[]>(['전체'])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    setIsLoading(true)
    const categoriesString = selectedMenu.join(',')

    setTimeout(() => {
      router.push(`/result?categories=${categoriesString}`)
    }, 2000)
  }

  const handleClick = useCallback(
    (menu: string) => {
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
    },
    [selectedMenu]
  )

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
