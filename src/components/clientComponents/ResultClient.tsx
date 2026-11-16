'use client'

import { useSearchParams } from 'next/navigation'
import MenuSuggestionForm from '@/components/features/result/MenuSuggestionForm'
import BestMenuList from '@/components/features/result/BestMenuList'
import WeatherButton from '@/components/elements/WeatherButton'
import { parseFilters } from '@/lib/recommend'

const ResultClient = () => {
  const searchParams = useSearchParams()
  const categories = (searchParams.get('categories') || '전체').split(',')
  const filters = parseFilters(searchParams.get('f'))

  return (
    <div className='p-5 bg-customs-orange-50'>
      <MenuSuggestionForm categories={categories} filters={filters} />
      <div className='flex flex-col gap-4 mt-8 mb-20'>
        <BestMenuList />
        <WeatherButton iconName='날씨' />
      </div>
    </div>
  )
}

export default ResultClient
