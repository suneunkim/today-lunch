import Container from '@/components/Container'
import WeatherButton from '@/components/elements/WeatherButton'
import BestMenuList from '@/components/features/result/BestMenuList'
import MenuSuggestionForm from '@/components/features/result/MenuSuggestionForm'
import { getRandomItemsList } from '@/lib/filterWeahter'

const best = [
  {
    name: '김치찌개',
    count: 30,
  },
  {
    name: '칼국수',
    count: 27,
  },
  {
    name: '샌드위치',
    count: 22,
  },
  {
    name: '햄버거',
    count: 16,
  },
  {
    name: '초밥',
    count: 10,
  },
]

type Params = Promise<{ categories: string }>

const page = async ({ searchParams }: { searchParams: Params }) => {
  const { categories } = (await searchParams) ?? '' // ex) 양식,국물,일식

  const categoryList = categories?.split(',')

  const data = getRandomItemsList(categoryList, 4)

  return (
    <Container title='결과'>
      <div className='p-5 bg-customs-orange-50'>
        <MenuSuggestionForm initialSuggestions={data} categories={categories} />
        <WeatherButton iconName='맛집' />
        <BestMenuList items={best} />
        <div className='flex flex-col gap-4 mb-20'>
          <WeatherButton iconName='날씨' />
          <WeatherButton iconName='리뷰' />
        </div>
      </div>
    </Container>
  )
}

export default page
