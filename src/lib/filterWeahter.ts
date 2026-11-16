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

export const getRandomItems = (menuList: MenuType[], count: number) => {
  const shuffled = [...menuList].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// 날씨로 메뉴 필터링
export const getWeatherFilteredMenus = (menuList: MenuType[], apiWeather: string) => {
  const weather = apiWeather?.toLowerCase()
  // 이슬비·천둥번개는 비 오는 날 메뉴로 묶습니다.
  const normalized = weather === 'drizzle' || weather === 'thunderstorm' ? 'rain' : weather

  const filteredMenus = menuList.filter((menu) => {
    if (normalized === 'snow' || normalized === 'rain') {
      return menu.weather === normalized
    }
    return !menu.weather
  })

  return getRandomItems(filteredMenus, 4)
}

export const getTemperatureFilteredMenus = (
  menuList: MenuType[],
  tempCondition: string,
  weatherFilteredMenus: MenuType[] // 날씨로 필터링되어 랜덤 4개 메뉴
) => {
  const filteredMenus = menuList.filter((menu) => {
    if (tempCondition === 'cold' || tempCondition === 'hot') {
      return menu.temperature === tempCondition
    }
    // 그 외의 경우에는 temperature 속성이 없는 메뉴 (mild로 간주)
    return !menu.temperature
  })

  // 중복 방지로 날씨로 필터링 된 메뉴 제외
  const finalMenus = filteredMenus.filter(
    (menu) => !weatherFilteredMenus.some((wm) => wm.name === menu.name)
  )

  return getRandomItems(finalMenus, 4)
}
