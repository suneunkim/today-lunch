'use client'

import { useEffect, useState } from 'react'
import Ranking from '@/components/elements/Ranking'
import { fetchTopMenu } from '@/lib/firebase/stats'

type ItemType = {
  name: string
  count: number
}

const BestMenuList = () => {
  const [items, setItems] = useState<ItemType[]>([])

  useEffect(() => {
    fetchTopMenu(5).then(setItems)
  }, [])

  // 집계를 못 받아오면(오프라인 등) 이 카드는 그냥 숨깁니다.
  if (items.length === 0) return null

  const basic = 'text-label2 text-customs-gray-10'

  return (
    <section className='px-[24px] py-[28px] bg-customs-gray-100 rounded-[20px]'>
      <h4 className='text-headline2 text-customs-gray-10 mb-6'>지금까지 가장 많이 승인받은 메뉴</h4>
      <div className='flex flex-col gap-[10px]'>
        {items.map((menu, i) => (
          <div key={menu.name} className='flex items-center gap-4'>
            <Ranking isFirst={i === 0}>{i + 1}위</Ranking>
            <div className='flex w-full justify-between'>
              <p className={`${basic} ${i === 0 ? 'font-bold' : ''}`}>{menu.name}</p>
              <div className={`${basic} ${i === 0 ? 'font-bold' : ''}`}>{menu.count}번</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BestMenuList
