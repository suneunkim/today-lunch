import { db } from '@/firebase'
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore'

// 제안받기 클릭 시 카운트 증가
export const incrementServiceUseCount = async () => {
  const docRef = doc(db, 'serviceClick', 'serviceClickCount')
  // Firestore에서 해당 문서 선택, 문서 ID는 serviceClickCount

  try {
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        useCount: increment(1), // useCount 필드를 1 증가시킴
      })
    } else {
      // 문서가 없다면 새로 생성하고 1로 설정
      await setDoc(docRef, {
        useCount: 1,
      })
    }
  } catch (error) {
    console.error('Error updating count:', error)
  }
}

// 카운트 수
export const getClickCount = async () => {
  const docRef = doc(db, 'serviceClick', 'serviceClickCount') // Firestore에서 해당 문서 선택
  try {
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data().useCount // useCount 값 반환
    } else {
      return 0
    }
  } catch (error) {
    console.error('Error fetching count:', error)
    return null
  }
}
