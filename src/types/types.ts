export type CategoryName = '한식' | '국물' | '해장' | '일식' | '양식' | '중식' | '간편식' | '기타'

export type IconName = CategoryName | '날씨' | '맛집' | '리뷰'

export type HeaderTitleType = string

export type CommentType = {
  id: string
  comment: string
  nickname: string
  timestamp: string
}

export type lastDocType = {
  id: string
  timestamp: string | null
} | null

export type CommentsDataType = {
  comments: CommentType[]
  lastVisible: lastDocType
  // 페이지네이션을 위한 마지막 문서 참조
}

export type MenuTag =
  | '매운'
  | '가벼운'
  | '든든'
  | '혼밥'
  | '가성비'
  | '면'
  | '해산물'
  | '날것'
  | '내장'
  | '순대'
  | '고수'
  | '마라'
  | '향신료'

export type MenuType = {
  name: string
  description: string
  cats: CategoryName[]
  tags: MenuTag[]
  weather?: string
  temperature?: string
  shortDescription?: string
}

export type WeatherCategoryType = 'cold' | 'hot' | 'rain' | 'snow' | 'clear' | 'mild'

export type apiWeahterData = 'Clear' | 'Clouds' | 'Snow' | 'Rain' | 'Drizzle' | 'Thunderstorm'
