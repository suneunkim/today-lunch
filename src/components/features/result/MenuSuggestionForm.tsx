'use client'

import { useState } from 'react'
import Button from '@/components/elements/Button'
import CheckBox from '@/components/elements/CheckBox'

interface Props {
  name: string
  description: string
}
const MenuSuggestionForm = ({ initialSuggestions }: { initialSuggestions: Props[] }) => {
  const [selectedMenu, setSelectedMenu] = useState(initialSuggestions[0].name)

  const handleSelectMenu = (name: string) => {
    setSelectedMenu(name)
  }

  const handleSubmit = async () => {
    try {
      // Firebase DB 통신 로직 추가
      console.log('handleSubmit 함수', selectedMenu)
    } catch (error) {
      console.error('Error submitting menu', error)
    }
  }

  const handleRegenerate = () => {
    // 메뉴 재추천 로직
  }

  return (
    <div>
      <section className='px-[24px] py-[28px] bg-customs-gray-100 rounded-[20px]'>
        <h2 className='w-full flex items-center justify-center border-t-2 border-b h-[53px] text-heading2 text-customs-gray-10 border-customs-gray-10'>
          오늘점심 제안서
        </h2>
        {initialSuggestions.map((menu, i) => (
          <div key={i}>
            <div
              onClick={() => handleSelectMenu(menu.name)}
              className='flex items-center mt-6 gap-2 cursor-pointer'
            >
              <CheckBox isSelected={menu.name === selectedMenu} />
              <h3 className='text-heading3 font-paperlogy'>{`${i + 1}안. ${menu.name}`}</h3>
            </div>
            <p className='text-label2 text-customs-gray-25 mt-2'>{menu.description}</p>
          </div>
        ))}
        <p className='font-paperlogy text-headline3 mt-6 pb-[28px] text-center'>
          승인 부탁드립니다 <span className='font-pretendard text-body1Normal'>^0^</span>
          {/* 표정 부분은 디자인과 달라서 논의 필요 */}
        </p>
      </section>
      <section className='flex flex-col gap-6 mt-6 mb-[20px]'>
        <div className='flex gap-[10px]'>
          <Button onClick={handleRegenerate} type='secondary'>
            다시 골라줘
          </Button>
          <Button onClick={handleSubmit} type='primary'>
            이걸로 할게!
          </Button>
        </div>
        <Button type='ghost'>결과 공유하기</Button>
      </section>
    </div>
  )
}

export default MenuSuggestionForm
