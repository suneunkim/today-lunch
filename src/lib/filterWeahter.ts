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

const getRandomItems = (menuList: MenuType[], count: number) => {
  const shuffled = menuList.sort(() => 0.5 - Math.random()) // 배열 섞기
  return shuffled.slice(0, count) // 앞에서부터 count 개만큼 리턴
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
