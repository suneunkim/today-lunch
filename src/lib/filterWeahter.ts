import { 전체, 한식, 국물, 해장, 양식, 중식, 일식, 간편식 } from '@/app/data/food'
import { MenuType } from '@/types/types'

export const getTemperatureCondition = (temperature: number) => {
  if (temperature <= 13) {
    return 'cold'
  } else if (temperature >= 25) {
    return 'hot'
  } else {
    return 'mild'
  }
}

const categoryMenuMap = {
  한식: 한식,
  국물: 국물,
  해장: 해장,
  양식: 양식,
  중식: 중식,
  일식: 일식,
  간편식: 간편식,
} as const

export const getRandomItemsList = (categories: string[], count: number) => {
  // 카테고리에 해당하는 메뉴들 병합
  const combinedMenuList = categories.flatMap(
    (category) => (categoryMenuMap as any)[category] || []
  )

  // 중복 제거
  const uniqueMenuList = Array.from(new Set(combinedMenuList))

  // 랜덤하게 섞기 및 선택
  const shuffled = uniqueMenuList.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export const getRandomItems = (menuList: MenuType[], count: number) => {
  const shuffled = menuList.sort(() => 0.5 - Math.random()) // 배열 섞기
  return shuffled.slice(0, count)
}

// 날씨로 메뉴 필터링
export const getWeatherFilteredMenus = (menuList: MenuType[], apiWeather: string) => {
  const normalizedApiWeather = apiWeather?.toLowerCase()

  const filteredMenus = menuList.filter((menu) => {
    // apiWeather가 'rain' 또는 'snow' 이면 menu의 'weather와' 일치하는 음식 사용
    if (normalizedApiWeather === 'snow' || normalizedApiWeather === 'rain') {
      return menu.weather === normalizedApiWeather
    }
    // 그 외 날씨라면 menu의 'weather가' 없는 음식 필터링
    return !menu.weather
  })

  const randomMenus = getRandomItems(filteredMenus, 4)

  return randomMenus
}

export const getTemperatureFilteredMenus = (
  menuList: MenuType[],
  tempCondition: string,
  weatherFilteredMenus: MenuType[] // 날씨로 필터링되어 랜덤 4개 메뉴
) => {
  const filteredMenus = menuList.filter((menu) => {
    // tempCondition이 Cold 또는 Hot이라면, menu.temperature가 해당 기온 조건에 맞는지 체크
    if (tempCondition === 'Cold' || tempCondition === 'Hot') {
      return menu.temperature === tempCondition
    }
    // 그 외의 경우에는 temperature 속성이 없는 메뉴 필터링 (Mild로 간주)
    return !menu.temperature
  })

  // 중복 방지로 날씨로 필터링 된 메뉴 제외
  const fianlMenus = filteredMenus.filter((menu) => {
    return !weatherFilteredMenus.some((wm) => wm.name === menu.name)
  })

  const randomMenus = getRandomItems(fianlMenus, 4)

  return randomMenus
}
