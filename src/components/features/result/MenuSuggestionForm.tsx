'use client'

import { useEffect, useState } from 'react'
import { FilterKey, recommend } from '@/lib/recommend'
import { trackPick, trackUse } from '@/lib/firebase/stats'
import { addDislike, addHistory, getFavorites } from '@/lib/storage'
import { MenuType } from '@/types/types'
import Stamp from '@/components/Stamp'
import Button from '@/components/elements/Button'
import DocTitle from '@/components/elements/DocTitle'
import MapPanel from '@/components/features/map/MapPanel'
import ShareButton from '@/components/ShareButton'
import SuggestionItem from './SuggestionItem'
import Divider from './Divider'
import Clip from './Clip'

interface Props {
  categories: string[]
  filters: FilterKey[]
}

const MenuSuggestionForm = ({ categories, filters }: Props) => {
  const [suggestions, setSuggestions] = useState<MenuType[]>([])
  const [selectedMenu, setSelectedMenu] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [favorites, setFavorites] = useState<Record<string, string>>({})

  const draw = (exclude: string[] = []) => {
    const next = recommend({ categories, filters, count: 3, exclude })
    setSuggestions(next)
    setSelectedMenu(next[0]?.name ?? '')
    setIsSubmitted(false)
  }

  // 추천은 기기에 저장된 취향·기록을 써야 해서 화면이 뜬 뒤에 뽑습니다.
  useEffect(() => {
    draw()
    setFavorites(getFavorites())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRegenerate = () => {
    draw(suggestions.map((menu) => menu.name))
    trackUse()
  }

  const handleSubmit = () => {
    if (isSubmitted || !selectedMenu) return
    setIsSubmitted(true)
    addHistory(selectedMenu)
    trackPick(selectedMenu)
  }

  const handleDislike = () => {
    if (!selectedMenu) return
    addDislike(selectedMenu)
    draw(suggestions.map((menu) => menu.name))
  }

  if (suggestions.length === 0) return <div className='h-[420px]' />

  const shareBody = suggestions.map((menu, i) => `${i + 1}안. ${menu.name}`).join('\n')
  const shareMessage = isSubmitted
    ? `[오늘점심 제안서]\n오늘 점심은 ‘${selectedMenu}’(으)로 결재 완료!\n- 먹대리 드림`
    : `[오늘점심 제안서]\n${shareBody}\n어떤 안으로 결재하시겠습니까?\n- 먹대리 드림`

  return (
    <div className='relative mt-[16px]'>
      <Clip />
      {isSubmitted && <Stamp />}

      {/* 콘텐츠 */}
      <div className='relative'>
        <div className='absolute bg-[#D1C9BD] top-[-8px] right-[-8px] w-full h-full rounded-[20px]' />
        <section className='relative px-[24px] py-[28px] bg-customs-gray-100 rounded-[20px] '>
          <DocTitle>오늘점심 제안서</DocTitle>
          {suggestions.map((menu, i) => (
            <SuggestionItem
              key={menu.name}
              menu={menu}
              i={i}
              isSelected={menu.name === selectedMenu}
              onSelect={(name) => !isSubmitted && setSelectedMenu(name)}
              favorite={favorites[menu.name]}
            />
          ))}
          <Divider />
        </section>
      </div>

      {/* 버튼 */}
      <section className='flex flex-col gap-4 mt-6 mb-[20px]'>
        <div className='flex gap-[10px]'>
          <Button onClick={handleRegenerate} type='secondary'>
            다시 골라줘
          </Button>
          <Button onClick={handleSubmit} type='primary' disabled={isSubmitted}>
            {isSubmitted ? '결재 완료' : '이걸로 할게!'}
          </Button>
        </div>
        <div className='flex'>
          <ShareButton
            label={isSubmitted ? '동료에게 결과 공유하기' : '동료에게 제안서 공유하기'}
            text={shareMessage}
          />
          {!isSubmitted && (
            <Button type='ghost' onClick={handleDislike}>
              선택한 메뉴 그만 추천받기
            </Button>
          )}
        </div>
      </section>
      <MapPanel menu={selectedMenu} />
    </div>
  )
}

export default MenuSuggestionForm
