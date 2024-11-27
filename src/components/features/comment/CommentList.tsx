'use client'

import { CommentType, CommentsDataType } from '@/types/types'
import CommentBox from './CommentBox'
import Button from '@/components/elements/Button'
import { useState } from 'react'
import { getComments } from '@/lib/firebase/comments'

interface Props {
  initialData: CommentsDataType
  commentsCount: number
}

const CommentList = ({ initialData, commentsCount }: Props) => {
  const { comments: initialComments, lastVisible } = initialData

  const [comments, setComments] = useState<CommentType[]>(initialComments)
  const [lastDoc, setLastDoc] = useState(lastVisible)
  const [loading, setLoading] = useState(false)

  console.log(comments.length)

  const handleLoadMoreComments = async () => {
    if (loading || !lastDoc) return // 로딩 중이거나 더 이상 불러올 데이터가 없으면 중단

    setLoading(true)
    try {
      // lastDoc은 현재 마지막으로 불러온 문서
      const { comments: newComments, lastVisible: newLastVisible } = await getComments(lastDoc)

      // 기존 댓글에 새 댓글 추가
      setComments((prevComments) => {
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
    <div className='mt-8'>
      <h5 className='text-headline2 text-customs-gray-25 font-paperlogy mb-3'>
        코멘트 {commentsCount}
      </h5>
      {/* 코멘트 카드 간격 8px*/}
      <div className='grid grid-cols-2 gap-2'>
        {comments && comments.length > 0 ? (
          comments?.map((comment: CommentType) => (
            <CommentBox nickname={comment.nickname} comment={comment.comment} key={comment.id} />
          ))
        ) : (
          <div>아직 코멘트가 없습니다</div>
        )}
      </div>
      {lastDoc && (
        <Button
          onClick={handleLoadMoreComments}
          disabled={loading || !lastDoc}
          className='mt-6'
          type='ghost'
        >
          {loading ? '로딩중...' : '코멘트 더보기'}
        </Button>
      )}
    </div>
  )
}

export default CommentList
