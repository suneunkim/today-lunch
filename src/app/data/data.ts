import { IconName } from '@/types/types'

export const menu = [
  ['한식', '국물', '해장'],
  ['일식', '양식', '중식'],
  ['간편식', '기타'],
] as Array<Array<IconName>>

// WeatherCard 날씨에 따른 배경 색상
export const weatherBackgroundColors = {
  clear: `linear-gradient(90deg, #C2E9FB 0%, #A1C4FD 100%)`,
  clouds: `linear-gradient(90deg, #BCC5CE 0%, #929EAD 98%)`,
  thunderstorm: `linear-gradient(90deg, #BCC5CE 0%, #929EAD 98%)`,
  rain: `linear-gradient(90deg, #D1E9FF 0%, #C3CFE2 100%)`,
  drizzle: `linear-gradient(90deg, #D1E9FF 0%, #C3CFE2 100%)`,
  snow: `linear-gradient(0deg, #FFF -54.77%, #97BFF5 103.53%)`,
}

export const teamData = [
  {
    id: 1,
    name: '김선은',
    role: 'Front-end Developer',
    about: '프론트엔드 개발',
    image: '/profile/character1.png',
    links: [
      { type: 'Github', url: '' },
      { type: 'Website', url: '' },
    ],
  },
  {
    id: 2,
    name: '강수민',
    role: 'UXUI Designer',
    about: 'UXUI 디자인 / 캐릭터 일러스트 & 모션',
    image: '/profile/character2.png',
    links: [
      { type: 'Notion', url: '' },
      { type: 'Behance', url: '' },
    ],
  },
  {
    id: 3,
    name: '조수진',
    role: 'UXUI Designer',
    about: 'UXUI 디자인 / 캐릭터 스케치 / 디자인시스템',
    image: '/profile/character3.png',
    links: [
      { type: 'Notion', url: '' },
      { type: 'Behance', url: '' },
    ],
  },
]
