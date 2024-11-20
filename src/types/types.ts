export type IconName =
  | '한식'
  | '국물'
  | '해장'
  | '일식'
  | '양식'
  | '중식'
  | '간편식'
  | '기타'
  | '날씨'
  | '맛집'
  | '리뷰'

export type MenuType = {
  name: string
  description: string
  weather?: string
  temperature?: string
  type?: string
  shortDescription?: string
}

export type WeatherCategoryType = 'cold' | 'hot' | 'rain' | 'snow' | 'clear' | 'mild'

export type apiWeahterData = 'Clear' | 'Clouds' | 'Snow' | 'Rain' | 'Drizzle' | 'Thunderstorm'
