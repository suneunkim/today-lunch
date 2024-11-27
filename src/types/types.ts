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
  | '메뉴'
  | '리뷰'


export type HeaderTitleType = '오늘 점심은 먹대리가' | '결과' | '날씨 맞춤 메뉴' | '코멘트'

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

