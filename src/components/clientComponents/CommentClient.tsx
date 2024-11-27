'use client'

import CommentForm from '@/components/features/comment/CommentForm'
import CommentList from '@/components/features/comment/CommentList'
import { getComments, getCommentsCount, getInitialComments } from '@/lib/firebase/comments'
import { CommentsDataType, CommentType } from '@/types/types'
import { useState } from 'react'

interface Props {
  initialData: CommentsDataType
  initialCommentsCount: number
}

const CommentClient = ({ initialData, initialCommentsCount }: Props) => {
  const { comments: initialComments, lastVisible } = initialData

  const [commentsData, setCommentsData] = useState<CommentType[]>(initialComments)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [lastDoc, setLastDoc] = useState(lastVisible)
  const [loading, setLoading] = useState(false)

  const refreshComments = async () => {
    const latestData = await getInitialComments()
    const latestCount = await getCommentsCount()

    setCommentsData(latestData.comments)
    setLastDoc(latestData.lastVisible)
    setCommentsCount(latestCount)
  }

  const handleLoadMoreComments = async () => {
    if (loading || !lastDoc) return

    setLoading(true)
    try {
      // lastDoc은 현재 마지막으로 불러온 문서
      const { comments: newComments, lastVisible: newLastVisible } = await getComments(lastDoc)

      // 기존 댓글에 새 댓글 추가
      setCommentsData((prevComments) => {
        const allComments = [...prevComments, ...newComments]
        // id 기준으로 중복 제거
        const uniqueComments = Array.from(
          new Map(allComments.map((comment) => [comment.id, comment])).values()
        )
        return uniqueComments
      })

      // 새로운 마지막 문서 업데이트
      setLastDoc(newLastVisible)
    } catch (error) {
      console.error('Failed to load more comments', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='bg-customs-gray-100 p-4 pb-8 rounded-[12px] mb-[125px]'>
      <CommentForm refreshComments={refreshComments} />
      <CommentList
        commentsData={commentsData}
        commentsCount={commentsCount}
        onClick={handleLoadMoreComments}
        lastDoc={lastDoc}
        loading={loading}
      />
    </section>
  )
}

export default CommentClient
