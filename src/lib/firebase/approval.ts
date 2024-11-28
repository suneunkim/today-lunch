import { realtimeDb } from '@/firebase'
import { get, goOffline, ref, runTransaction } from 'firebase/database'

import { db } from '@/firebase'
import {
  collection,
  query,
  getDoc,
  orderBy,
  limit,
  doc,
  updateDoc,
  increment,
  setDoc,
  getDocs,
} from 'firebase/firestore'

interface MenuCount {
  count: number
}
// FireStore DB 사용하는 함수
export const incrementCount = async (menuName: string) => {
  const menuRef = doc(db, 'menuCounts', menuName) // Firestore에서 메뉴 이름으로 문서 참조

  try {
    // 메뉴가 이미 있으면 카운트를 증가시키고, 없으면 새로 만들기
    const menuSnapshot = await getDoc(menuRef)
    if (menuSnapshot.exists()) {
      await updateDoc(menuRef, {
        count: increment(1), // count 필드 증가
      })
    } else {
      await setDoc(menuRef, {
        count: 1, // 처음 메뉴가 들어오는 경우 count를 1로 설정
      })
    }
  } catch (err) {
    console.error('Error incrementing menu count:', err)
  }
}

// 상위 5개 메뉴를 Firestore에서 가져오는 함수
export const fetchTopMenu = async () => {
  try {
    // Firestore에서 menuCounts 컬렉션을 쿼리하여 상위 5개 메뉴를 가져오기
    const menuCountsRef = collection(db, 'menuCounts')
    const q = query(menuCountsRef, orderBy('count', 'desc'), limit(5))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return [] // 카운트가 없으면 빈 배열 리턴
    }

    const topMenus = querySnapshot.docs.map((doc) => ({
      name: doc.id, // 문서 ID가 메뉴 이름
      count: doc.data().count,
    }))

    return topMenus
  } catch (error) {
    console.error('Error fetching top 5 menu counts:', error)
    return []
  }
}

// Realtime DB 사용하는 함수. 무료는 동시 연결 100개까지 가능
// 새로고침시 연결이 증가해서 동시 연결 갯수 관리 해야함
export const incrementMenuCount = async (menuName: string) => {
  const menuRef = ref(realtimeDb, `menuCounts/${menuName}/count`) // 카운트의 참조

  // 트랜잭션을 사용하여 카운트 증가
  await runTransaction(menuRef, (currentValue) => {
    // currentValue가 null이면 0을 기본값으로 사용
    return (currentValue || 0) + 1
  }).catch((err) => console.error('Error updating count:', err))
}

export const fetchTop5Menu = async () => {
  try {
    // Real-time DB에서 menuCounts 데이터를 불러와서 정렬
    const menuCountsRef = ref(realtimeDb, 'menuCounts')
    const snapshot = await get(menuCountsRef)

    if (snapshot.exists()) {
      const data = snapshot.val() as Record<string, MenuCount>

      // 카운트 순으로 내림차순 정렬, 상위 5개 메뉴 가져오기
      const sortedMenus = Object.entries(data)
        .map(([name, info]) => ({ name, count: info.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return sortedMenus
    } else {
      console.log('No menu counts available')
    }
  } catch (error) {
    console.error('Error fetching top 5 menu counts:', error)
  }
}

export const connectionOff = async () => {
  goOffline(realtimeDb)
  console.log('Firebase connection closed.')
}
