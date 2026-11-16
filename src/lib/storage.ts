// 기기 안(localStorage)에만 저장되는 개인 설정·기록. 서버로 보내지 않습니다.
import { MenuTag } from '@/types/types'

const PREFIX = 'mukdaeri:'

const read = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return fallback && typeof fallback === 'object' && !Array.isArray(fallback)
      ? { ...fallback, ...parsed }
      : parsed
  } catch {
    return fallback
  }
}

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // 저장 공간이 막힌 환경에서는 조용히 넘어갑니다.
  }
}

// ── 날짜
export const dateKey = (d: Date = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ── 취향 (입사 첫날 취향 조사)
export type Prefs = {
  onboarded: boolean
  spicy: 'love' | 'ok' | 'no'
  base: '국물' | '밥' | '면' | null
  volume: '든든' | '가벼운' | null
  avoid: MenuTag[] // 피하는 재료 태그 (해산물, 내장, 향신료)
  dislikes: string[] // 다시 추천받지 않을 메뉴 이름
  typeName: string
}

const defaultPrefs: Prefs = {
  onboarded: false,
  spicy: 'ok',
  base: null,
  volume: null,
  avoid: [],
  dislikes: [],
  typeName: '',
}

export const getPrefs = () => read<Prefs>('prefs', defaultPrefs)
export const savePrefs = (patch: Partial<Prefs>) => {
  const next = { ...getPrefs(), ...patch }
  write('prefs', next)
  return next
}

export const addDislike = (name: string) => {
  const prefs = getPrefs()
  if (prefs.dislikes.includes(name)) return prefs
  return savePrefs({ dislikes: [...prefs.dislikes, name] })
}
export const removeDislike = (name: string) =>
  savePrefs({ dislikes: getPrefs().dislikes.filter((n) => n !== name) })

// ── 설정
export type Settings = {
  excludeDays: number // 최근 며칠 안에 먹은 메뉴를 추천에서 뺄지 (0 = 끔)
  place: string // 회사 근처 역·동네 (지도 검색어 앞에 붙음)
  mapApp: 'kakao' | 'naver'
  lunchHour: number
  lunchMinute: number
  notify: boolean // 점심시간 30분 전 알림
}

const defaultSettings: Settings = {
  excludeDays: 3,
  place: '',
  mapApp: 'kakao',
  lunchHour: 12,
  lunchMinute: 0,
  notify: false,
}

export const getSettings = () => read<Settings>('settings', defaultSettings)
export const saveSettings = (patch: Partial<Settings>) => {
  const next = { ...getSettings(), ...patch }
  write('settings', next)
  return next
}

// ── 점심 기록 (결재 문서함)
export type HistoryItem = { id: number; name: string; date: string }

export const getHistory = () => read<HistoryItem[]>('history', [])
export const addHistory = (name: string, date: string = dateKey()) => {
  const next = [{ id: Date.now(), name, date }, ...getHistory()].slice(0, 500)
  write('history', next)
  return next
}
export const removeHistory = (id: number) => {
  const next = getHistory().filter((item) => item.id !== id)
  write('history', next)
  return next
}

export const getRecentNames = (days: number) => {
  if (days <= 0) return []
  const from = new Date()
  from.setDate(from.getDate() - days)
  const fromKey = dateKey(from)
  return getHistory()
    .filter((item) => item.date > fromKey)
    .map((item) => item.name)
}

// ── 단골집 메모 (메뉴 이름 → 식당 이름)
export const getFavorites = () => read<Record<string, string>>('favorites', {})
export const saveFavorite = (menu: string, restaurant: string) => {
  const next = { ...getFavorites() }
  if (restaurant.trim()) next[menu] = restaurant.trim()
  else delete next[menu]
  write('favorites', next)
  return next
}

// ── 주간 점심 계획서
export type WeeklyPlan = { weekOf: string; menus: string[] }
export const getWeeklyPlan = () => read<WeeklyPlan | null>('weekly', null)
export const saveWeeklyPlan = (plan: WeeklyPlan) => write('weekly', plan)

// ── 누가 쏠까 참가자
export const getMembers = () => read<string[]>('members', [])
export const saveMembers = (members: string[]) => write('members', members)

// ── 집계용 플래그 (기기별 1회 / 하루 1회만 세기 위해)
export const getFlag = (key: string) => read<string>('flag:' + key, '')
export const setFlag = (key: string, value: string) => write('flag:' + key, value)
