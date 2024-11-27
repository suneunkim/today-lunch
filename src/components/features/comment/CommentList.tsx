import { CommentType, lastDocType } from '@/types/types'
import CommentBox from './CommentBox'
import Button from '@/components/elements/Button'

interface Props {
  commentsData: CommentType[]
  commentsCount: number
  onClick: () => void
  lastDoc: lastDocType
  loading: boolean
}

const CommentList = ({ commentsData, commentsCount, onClick, lastDoc, loading }: Props) => {
  return (
    <div className='mt-8'>
      <h5 className='text-headline2 text-customs-gray-25 font-paperlogy mb-3'>
        코멘트 {commentsCount}
      </h5>
      {/* 코멘트 카드 간격 8px*/}
      <div className='grid grid-cols-2 gap-2'>
        {commentsData && commentsData.length > 0 ? (
          commentsData?.map((comment: CommentType) => (
            <CommentBox nickname={comment.nickname} comment={comment.comment} key={comment.id} />
          ))
        ) : (
          <div>아직 코멘트가 없습니다</div>
        )}
      </div>
      {lastDoc && (
        <Button onClick={onClick} disabled={loading || !lastDoc} className='mt-6' type='ghost'>
          {loading ? '로딩중...' : '코멘트 더보기'}
        </Button>
      )}
    </div>
  )
}

export default CommentList
