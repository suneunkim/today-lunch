'use client'

import { useState } from 'react'
import { CategoryType, getRandomItemsList } from '@/lib/filterWeahter'
import { incrementCount } from '@/lib/firebase/approval'
import WeatherButton from '@/components/elements/WeatherButton'
import Stamp from '@/components/Stamp'
import Button from '@/components/elements/Button'
import HeaderSection from './HeaderSection'
import SuggestionItem from './SuggestionItem'
import Divider from './Divider'
import Clip from './Clip'
import KakaoShareButton from '@/components/KakaoShareButton'

export type initialSuggestionsType = {
  name: string
  description: string
}
interface Props {
  initialSuggestions: initialSuggestionsType[]
  categories: string
}

const MenuSuggestionForm = ({ initialSuggestions, categories }: Props) => {
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [selectedMenu, setSelectedMenu] = useState(initialSuggestions[0].name)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSelectMenu = (name: string) => {
    setSelectedMenu(name)
  }

  const handleRegenerate = () => {
    // 메뉴 재추천
    setIsSubmitted(false)
    const categoryList = categories.split(',') as CategoryType[]
    const newSuggestions = getRandomItemsList(categoryList, 3)
    setSuggestions(newSuggestions)
  }

  const handleSubmit = async () => {
    if (isSubmitted) return
    try {
      setIsSubmitted(true)
      await incrementCount(selectedMenu)
    } catch (error) {
      console.error('Error submitting menu', error)
    }
  }

  return (
    <div className='relative mt-[16px]'>
      <Clip />
      {isSubmitted && <Stamp />}

      {/* 콘텐츠 */}
      <div className='relative'>
        <div className='absolute bg-customs-gray-90 top-[-8px] right-[-8px] w-full h-full rounded-[20px]' />
        <section className='relative px-[24px] py-[28px] bg-customs-gray-100 rounded-[20px] '>
          <HeaderSection />
          {suggestions.map((menu, i) => (
            <SuggestionItem
              key={i}
              menu={menu}
              i={i}
              isSelected={menu.name === selectedMenu}
              onSelect={handleSelectMenu}
            />
          ))}
          <Divider />
        </section>
      </div>

      {/* 버튼 */}
      <section className='flex flex-col gap-6 mt-6 mb-[20px]'>
        <div className='flex gap-[10px]'>
          <Button onClick={handleRegenerate} type='secondary'>
            다시 골라줘
          </Button>
          <Button onClick={handleSubmit} type='primary' disabled={isSubmitted}>
            이걸로 할게!
          </Button>
        </div>
        <KakaoShareButton page='result' categories={categories} />
      </section>
      <WeatherButton iconName='맛집' recommendedMenu={selectedMenu} />
    </div>
  )
}

export default MenuSuggestionForm
