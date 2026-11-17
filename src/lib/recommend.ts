import { MENUS } from '@/app/data/menus'
import { 해장제외전체 } from '@/app/data/food'
import { CategoryName, MenuType } from '@/types/types'
import { getPrefs, getRecentNames, getSettings, getSnoozed, Prefs } from './storage'

export type FilterKey = 'mild' | 'light' | 'hearty' | 'solo' | 'cheap'

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'mild', label: '안 맵게' },
  { key: 'light', label: '가볍게' },
  { key: 'hearty', label: '든든하게' },
  { key: 'solo', label: '혼밥 가능' },
  { key: 'cheap', label: '가성비' },
]

const matchesFilter = (menu: MenuType, key: FilterKey) => {
  switch (key) {
    case 'mild':
      return !menu.tags.includes('매운')
    case 'light':
      return menu.tags.includes('가벼운')
    case 'hearty':
      return menu.tags.includes('든든')
    case 'solo':
      return menu.tags.includes('혼밥')
    case 'cheap':
      return menu.tags.includes('가성비')
  }
}

// 취향 조사에서 "못 먹어요"라고 한 것들은 어떤 경우에도 추천하지 않습니다.
const allowedByPrefs = (menu: MenuType, prefs: Prefs) => {
  if (prefs.dislikes.includes(menu.name)) return false
  if (prefs.spicy === 'no' && menu.tags.includes('매운')) return false
  if (prefs.avoid.some((tag) => menu.tags.includes(tag))) return false
  return true
}

// 취향에 맞는 메뉴가 조금 더 자주 나오도록 가중치를 줍니다.
const weightOf = (menu: MenuType, prefs: Prefs) => {
  let weight = 1
  const isSoup = menu.cats.includes('국물')
  const isNoodle = menu.tags.includes('면')
  if (prefs.base === '국물' && isSoup) weight += 1
  if (prefs.base === '면' && isNoodle) weight += 1
  if (prefs.base === '밥' && !isSoup && !isNoodle) weight += 0.5
  if (prefs.volume && menu.tags.includes(prefs.volume)) weight += 0.5
  if (prefs.spicy === 'love' && menu.tags.includes('매운')) weight += 0.5
  return weight
}

const pickWeighted = (pool: MenuType[], count: number, prefs: Prefs) => {
  const rest = [...pool]
  const picked: MenuType[] = []
  while (picked.length < count && rest.length > 0) {
    const weights = rest.map((menu) => weightOf(menu, prefs))
    let r = Math.random() * weights.reduce((a, b) => a + b, 0)
    let index = 0
    for (; index < rest.length - 1; index++) {
      r -= weights[index]
      if (r <= 0) break
    }
    picked.push(rest.splice(index, 1)[0])
  }
  return picked
}

type Options = {
  categories: string[] // '전체' 또는 카테고리 이름들
  filters?: FilterKey[]
  count: number
  exclude?: string[] // 방금 보여준 메뉴 등, 이번에만 빼고 싶은 이름
}

export const recommend = ({ categories, filters = [], count, exclude = [] }: Options) => {
  const prefs = getPrefs()
  // 최근 먹은 메뉴 + "3일간 제외"로 미뤄 둔 메뉴
  const recent = [...getRecentNames(getSettings().excludeDays), ...getSnoozed()]

  const isAll = categories.length === 0 || categories.includes('전체')
  const base = (isAll ? 해장제외전체 : MENUS).filter(
    (menu) =>
      (isAll || menu.cats.some((c) => categories.includes(c as CategoryName))) &&
      allowedByPrefs(menu, prefs)
  )

  const byFilters = (list: MenuType[]) =>
    list.filter((menu) => filters.every((key) => matchesFilter(menu, key)))
  const without = (list: MenuType[], names: string[]) =>
    list.filter((menu) => !names.includes(menu.name))

  // 조건을 다 지키면 메뉴가 모자랄 때는 덜 중요한 조건부터 차례로 풉니다.
  const steps = [
    without(byFilters(base), [...recent, ...exclude]),
    without(byFilters(base), exclude),
    byFilters(base),
    without(base, exclude),
    base,
  ]
  const pool = steps.find((list) => list.length >= count) ?? base
  return pickWeighted(pool, count, prefs)
}

export const parseFilters = (value: string | null): FilterKey[] =>
  (value ?? '')
    .split(',')
    .filter((key): key is FilterKey => FILTERS.some((f) => f.key === key))
