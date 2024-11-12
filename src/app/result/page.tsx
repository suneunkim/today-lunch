import Container from '@/components/Container'
import WeatherButton from '@/components/elements/WeatherButton'
import BestMenuList from '@/components/features/result/BestMenuList'
import MenuSuggestionForm from '@/components/features/result/MenuSuggestionForm'

const menuSuggestions = [
  {
    name: '김치찌개',
    description:
      '매콤한 맛이 입맛을 돋우고, 뜨거운 국물로 속을 든든하게 채워줘 바쁜 오후에도 활력을 줄 수 있습니다.',
  },
  {
    name: '순두부찌개',
    description: '담백하고 부드러운 콩비지의 풍미가 속을 편안하게 해주며, 영양가 높은 메뉴입니다.',
  },
  {
    name: '칼국수',
    description: '쫄깃한 면발과 따뜻한 국물이 어우러져 든든하고 편안한 메뉴입니다.',
  },
]

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

const page = () => {
  return (
    <Container title='결과'>
      <div className='p-5 bg-customs-orange-50'>
        <MenuSuggestionForm initialSuggestions={menuSuggestions} />
        <BestMenuList items={best} />
        <div className='flex flex-col gap-4 mb-20'>
          <WeatherButton iconName='날씨' />
          <WeatherButton iconName='메뉴' />
          <WeatherButton iconName='리뷰' />
        </div>
      </div>
    </Container>
  )
}

export default page
