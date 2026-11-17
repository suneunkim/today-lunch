// 이용 집계 (Firestore). 모든 호출은 화면을 막지 않습니다:
// 쓰기는 기다리지 않고, 읽기는 몇 초 안에 답이 없으면 포기합니다.
import { db, firebaseEnabled } from '@/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  addDoc,
} from 'firebase/firestore'
import { dateKey, getFlag, setFlag } from '@/lib/storage'

const withTimeout = <T>(promise: Promise<T>, fallback: T, ms = 5000): Promise<T> =>
  Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])

// 같은 순위를 화면을 열 때마다 다시 읽지 않도록 몇 분간 기기에 기억해 둡니다. (하루 읽기 한도 절약)
const cached = async <T>(key: string, minutes: number, load: () => Promise<T>, isEmpty: (v: T) => boolean): Promise<T> => {
  try {
    const raw = window.localStorage.getItem('mukdaeri:cache:' + key)
    if (raw) {
      const { at, value } = JSON.parse(raw)
      if (Date.now() - at < minutes * 60000) return value as T
    }
  } catch {}
  const value = await load()
  try {
    if (!isEmpty(value)) window.localStorage.setItem('mukdaeri:cache:' + key, JSON.stringify({ at: Date.now(), value }))
  } catch {}
  return value
}
export const clearCache = (key: string) => {
  try {
    window.localStorage.removeItem('mukdaeri:cache:' + key)
  } catch {}
}

const bump = (path: [string, string], fields: Record<string, number>) => {
  if (!firebaseEnabled) return
  const data = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, increment(v)]))
  setDoc(doc(db, ...path), data, { merge: true }).catch(() => {})
}

const totalDoc: [string, string] = ['serviceClick', 'serviceClickCount']

// 추천 1회 = 이용 1회. 기기별 첫 이용(설치 수)과 하루 첫 이용(일간 이용자 수)도 함께 셉니다.
export const trackUse = () => {
  const today = dateKey()
  const total: Record<string, number> = { useCount: 1 }
  const daily: Record<string, number> = { uses: 1 }
  if (!getFlag('installed')) {
    total.installs = 1
    setFlag('installed', today)
  }
  if (getFlag('lastUseDay') !== today) {
    daily.users = 1
    setFlag('lastUseDay', today)
  }
  bump(totalDoc, total)
  bump(['dailyStats', today], daily)
}

// "이걸로 할게!" 로 결재된 메뉴 집계
export const trackPick = (menuName: string) => {
  bump(['menuCounts', menuName], { count: 1 })
  bump(['dailyStats', dateKey()], { picks: 1 })
}

export const getTotals = () => cached('totals', 10, loadTotals, (v) => v === null)
const loadTotals = async () => {
  if (!firebaseEnabled) return null
  const snap = await withTimeout(getDoc(doc(db, ...totalDoc)), null)
  if (!snap || !snap.exists()) return null
  const data = snap.data()
  return { useCount: (data.useCount as number) ?? 0, installs: (data.installs as number) ?? 0 }
}

export const fetchTopMenu = (count = 5) => cached(`top${count}`, 10, () => loadTopMenu(count), (v) => v.length === 0)
const loadTopMenu = async (count: number) => {
  if (!firebaseEnabled) return []
  const q = query(collection(db, 'menuCounts'), orderBy('count', 'desc'), limit(count))
  const snap = await withTimeout(getDocs(q), null)
  if (!snap) return []
  return snap.docs.map((d) => ({ name: d.id, count: d.data().count as number }))
}

export type DailyStat = { date: string; uses: number; users: number; picks: number }

export const fetchDailyStats = async (days = 14): Promise<DailyStat[]> => {
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return dateKey(d)
  })
  if (!firebaseEnabled) return dates.map((date) => ({ date, uses: 0, users: 0, picks: 0 }))
  const snaps = await Promise.all(
    dates.map((date) => withTimeout(getDoc(doc(db, 'dailyStats', date)), null))
  )
  return dates.map((date, i) => {
    const data = snaps[i]?.exists() ? snaps[i]!.data() : {}
    return { date, uses: data.uses ?? 0, users: data.users ?? 0, picks: data.picks ?? 0 }
  })
}

// ── 메뉴 월드컵: 한 판이 끝나면 고른 횟수(득표)와 우승을 한꺼번에 올립니다.
export const trackWorldcup = (picks: Record<string, number>, winner: string) => {
  clearCache('worldcup')
  Object.entries(picks).forEach(([name, count]) => {
    bump(['worldcup', name], name === winner ? { picks: count, wins: 1 } : { picks: count })
  })
}

export type WorldcupRank = { name: string; wins: number; picks: number }

export const fetchWorldcupRank = (count = 10) => cached('worldcup', 5, () => loadWorldcupRank(count), (v) => v.length === 0)
const loadWorldcupRank = async (count: number): Promise<WorldcupRank[]> => {
  if (!firebaseEnabled) return []
  const q = query(collection(db, 'worldcup'), orderBy('wins', 'desc'), limit(count))
  const snap = await withTimeout(getDocs(q), null)
  if (!snap) return []
  return snap.docs.map((d) => ({ name: d.id, wins: d.data().wins ?? 0, picks: d.data().picks ?? 0 }))
}

// ── 주문 받기 게임: 오늘의 랭킹 (날짜별로 따로 쌓입니다)
export type TapRank = { name: string; ms: number }

// board: 'scores' = 기본, 'hard' = 챌린저 (랭킹을 따로 둡니다)
export const submitTapScore = async (name: string, ms: number, board: 'scores' | 'hard' = 'scores') => {
  if (!firebaseEnabled) return false
  return withTimeout(
    addDoc(collection(db, 'tapRank', dateKey(), board), { name, ms }).then(() => {
      clearCache(`tap:${board}:${dateKey()}`)
      return true
    }),
    false
  )
}

export const fetchTapRank = (count = 10, board: 'scores' | 'hard' = 'scores') =>
  cached(`tap:${board}:${dateKey()}`, 2, () => loadTapRank(count, board), (v) => v.length === 0)
const loadTapRank = async (count: number, board: 'scores' | 'hard'): Promise<TapRank[]> => {
  if (!firebaseEnabled) return []
  const q = query(collection(db, 'tapRank', dateKey(), board), orderBy('ms', 'asc'), limit(count))
  const snap = await withTimeout(getDocs(q), null)
  if (!snap) return []
  return snap.docs.map((d) => ({ name: d.data().name as string, ms: d.data().ms as number }))
}

// ── 주문받기 기록 분포: 끝낸 판의 시간을 1초 단위 칸에 익명으로 쌓습니다.
// 실제 사람들이 몇 초에 깨는지 보고 등급 기준을 조정하고, "상위 몇 %"를 보여 주는 데 씁니다.
export const trackOrderTime = (ms: number, board: 'scores' | 'hard') => {
  const bucket = Math.min(60, Math.floor(ms / 1000))
  bump(['orderStats', board], { plays: 1, [`s${bucket}`]: 1 })
}

// 내 기록보다 느린 판의 비율로 "상위 몇 %"를 계산합니다. 판 수가 적으면 null.
export const fetchOrderPercentile = async (ms: number, board: 'scores' | 'hard') => {
  if (!firebaseEnabled) return null
  const snap = await withTimeout(getDoc(doc(db, 'orderStats', board)), null)
  if (!snap || !snap.exists()) return null
  const data = snap.data() as Record<string, number>
  const plays = data.plays ?? 0
  if (plays < 20) return null
  const mine = Math.min(60, Math.floor(ms / 1000))
  let faster = 0
  for (let i = 0; i < mine; i++) faster += data[`s${i}`] ?? 0
  return Math.max(1, Math.round(((faster + 1) / plays) * 100))
}

// 기록 분포 전체 (이용 현황 화면용)
export const fetchOrderStats = async (board: 'scores' | 'hard') => {
  if (!firebaseEnabled) return null
  const snap = await withTimeout(getDoc(doc(db, 'orderStats', board)), null)
  if (!snap || !snap.exists()) return null
  const data = snap.data() as Record<string, number>
  const buckets = Array.from({ length: 61 }, (_, i) => data[`s${i}`] ?? 0)
  return { plays: data.plays ?? 0, buckets }
}
