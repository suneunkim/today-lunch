import { CategoryName } from '@/types/types'
import { MENUS } from './menus'

// 메뉴 원본은 menus.ts 한 곳에서 관리하고, 카테고리별 목록은 여기서 만들어 씁니다.
const by = (category: CategoryName) => MENUS.filter((menu) => menu.cats.includes(category))

export const 한식 = by('한식')
export const 국물 = by('국물')
export const 해장 = by('해장')
export const 양식 = by('양식')
export const 중식 = by('중식')
export const 일식 = by('일식')
export const 간편식 = by('간편식')
export const 기타 = by('기타')

export const 전체 = MENUS
// 해장 전용 메뉴(주스, 죽 등)는 일반 추천에서 제외
export const 해장제외전체 = MENUS.filter((menu) => menu.cats.some((c) => c !== '해장'))

export const findMenu = (name: string) => MENUS.find((menu) => menu.name === name)
