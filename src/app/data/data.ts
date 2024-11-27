import { IconName } from '@/types/types'

export const menu = [
  ['한식', '국물', '해장'],
  ['일식', '양식', '중식'],
  ['간편식', '기타'],
] as Array<Array<IconName>>

// WeatherCard 날씨에 따른 배경 색상
export const weatherBackgroundColors = {
  sunny: `linear-gradient(113deg, #FFD700 -20%, #FFA500 106%)`, // 예시
  cloudy: `linear-gradient(113deg, #d3d6d9 -20%, #a9a9a9 106%)`, // 예시
  rainy: `linear-gradient(
      113deg,
      #d3d6d9 -20%,
      rgba(211, 214, 217, 0.36) -4%,
      rgba(136, 197, 255, 0.7) 106%
    )`,
  snowy: `linear-gradient(113deg, #FFFFFF -20%, #D3D3D3 106%)`, // 예시
}
