interface Props {
  nickname: string
  comment: string
}

const CommentBox = ({ comment, nickname }: Props) => {
  return (
    <div className='font-paperlogy min-w-[140px] max-w-[198px] min-h-[163px] bg-customs-gray-95 p-[12px] rounded-[8px]'>
      <p className='text-label3 text-customs-gray-50 pb-[6px] border-b'>{nickname}</p>
      <p className='mt-2 text-headline3 text-customs-orange-55 break-words over'>{comment}</p>
    </div>
  )
}

export default CommentBox
