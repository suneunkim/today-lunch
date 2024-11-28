import Container from '@/components/Container'
import WeatherButton from '@/components/elements/WeatherButton'
import BestMenuList from '@/components/features/result/BestMenuList'
import MenuSuggestionForm from '@/components/features/result/MenuSuggestionForm'
import { CategoryType, getRandomItemsList } from '@/lib/filterWeahter'
import { fetchTopMenu } from '@/lib/firebase/approval'

type Params = Promise<{ categories: string }>

const page = async ({ searchParams }: { searchParams: Params }) => {
  const { categories } = (await searchParams) ?? '' // ex) 양식,국물,일식

  const categoryList = categories?.split(',') as CategoryType[]
  const data = getRandomItemsList(categoryList, 3)

  const Top5 = await fetchTopMenu()

  return (
    <Container title='결과'>
      <div className='p-5 bg-customs-orange-50'>
        <MenuSuggestionForm initialSuggestions={data} categories={categories} />
        <BestMenuList items={Top5} />
        <div className='flex flex-col gap-4 mb-20'>
          <WeatherButton iconName='날씨' />
          <WeatherButton iconName='리뷰' />
        </div>
      </div>
    </Container>
  )
}

export default page
