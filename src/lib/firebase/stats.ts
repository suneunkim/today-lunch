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

export const getTotals = async () => {
  if (!firebaseEnabled) return null
  const snap = await withTimeout(getDoc(doc(db, ...totalDoc)), null)
  if (!snap || !snap.exists()) return null
  const data = snap.data()
  return { useCount: (data.useCount as number) ?? 0, installs: (data.installs as number) ?? 0 }
}

export const fetchTopMenu = async (count = 5) => {
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
  Object.entries(picks).forEach(([name, count]) => {
    bump(['worldcup', name], name === winner ? { picks: count, wins: 1 } : { picks: count })
  })
}

export type WorldcupRank = { name: string; wins: number; picks: number }

export const fetchWorldcupRank = async (count = 10): Promise<WorldcupRank[]> => {
  if (!firebaseEnabled) return []
  const q = query(collection(db, 'worldcup'), orderBy('wins', 'desc'), limit(count))
  const snap = await withTimeout(getDocs(q), null)
  if (!snap) return []
  return snap.docs.map((d) => ({ name: d.id, wins: d.data().wins ?? 0, picks: d.data().picks ?? 0 }))
}

// ── 제시어 빨리 누르기: 오늘의 랭킹 (날짜별로 따로 쌓입니다)
export type TapRank = { name: string; ms: number }

export const submitTapScore = async (name: string, ms: number) => {
  if (!firebaseEnabled) return false
  return withTimeout(
    addDoc(collection(db, 'tapRank', dateKey(), 'scores'), { name, ms }).then(() => true),
    false
  )
}

export const fetchTapRank = async (count = 10): Promise<TapRank[]> => {
  if (!firebaseEnabled) return []
  const q = query(collection(db, 'tapRank', dateKey(), 'scores'), orderBy('ms', 'asc'), limit(count))
  const snap = await withTimeout(getDocs(q), null)
  if (!snap) return []
  return snap.docs.map((d) => ({ name: d.data().name as string, ms: d.data().ms as number }))
}
