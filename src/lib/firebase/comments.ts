import { db } from '@/firebase'
import { CommentType } from '@/types/types'
import {
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
  startAfter,
  limit,
  getCountFromServer,
} from 'firebase/firestore'

// 댓글 추가 함수
export const addComment = async (nickname: string, comment: string) => {
  try {
    await addDoc(collection(db, 'comments'), {
      nickname: nickname,
      comment: comment,
      timestamp: serverTimestamp(),
    })
  } catch (e) {
    console.error('댓글 저장 오류: ', e)
  }
}

// 댓글 총 갯수
export const getCommentsCount = async () => {
  const commentsRef = collection(db, 'comments')
  const countSnapshot = await getCountFromServer(query(commentsRef))
  return countSnapshot.data().count // 총 문서 수 반환
}

// 댓글 초기 데이터용
export const getInitialComments = async () => {
  const commentsRef = collection(db, 'comments')

  // 코멘트 가져오기
  const q = query(commentsRef, orderBy('timestamp', 'desc'), limit(4))
  const querySnapshot = await getDocs(q)

  const comments = querySnapshot.docs.map((doc) => {
    const data = doc.data()

    return {
      id: doc.id,
      nickname: data.nickname,
      comment: data.comment,
      // timestamp를 ISO 문자열로 변환
      timestamp: data.timestamp?.toDate().toISOString() || null,
    }
  }) as CommentType[]

  const lastVisible =
    querySnapshot.docs.length > 0
      ? {
          id: querySnapshot.docs[querySnapshot.docs.length - 1].id,
          timestamp: querySnapshot.docs[querySnapshot.docs.length - 1]
            .data()
            .timestamp?.toDate()
            .toISOString(),
        }
      : null

  // lastVisible을 직렬화 가능한 형태로 변환

  return { comments, lastVisible }
}

// 댓글 리스트 불러오는 함수
export const getComments = async (lastDoc: { id: string; timestamp: string | null } | null) => {
  try {
    const commentsRef = collection(db, 'comments')

    const q =
      lastDoc && lastDoc.timestamp
        ? query(
            commentsRef,
            orderBy('timestamp', 'desc'),
            startAfter(new Date(lastDoc.timestamp)),
            limit(6)
          )
        : query(commentsRef, orderBy('timestamp', 'desc'), limit(6))

    const querySnapshot = await getDocs(q)

    const comments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nickname: doc.data().nickname,
      comment: doc.data().comment,
      timestamp: doc.data().timestamp?.toDate().toISOString() || null,
    })) as CommentType[]

    const lastVisible =
      querySnapshot.docs.length > 0
        ? {
            id: querySnapshot.docs[querySnapshot.docs.length - 1].id,
            timestamp: querySnapshot.docs[querySnapshot.docs.length - 1]
              .data()
              .timestamp?.toDate()
              .toISOString(),
          }
        : null

    return { comments, lastVisible }
  } catch (error) {
    console.error('Error fetching comments', error)
    return { comments: [], lastVisible: null }
  }
}
