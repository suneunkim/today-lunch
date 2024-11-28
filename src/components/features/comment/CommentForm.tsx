'use client'

import { useEffect, useState } from 'react'
import getRandomNickname from '@/lib/nicknameUtils'
import { addComment } from '@/lib/firebase/comments'
interface Props {
  refreshComments: () => Promise<void>
}

const CommentForm = ({ refreshComments }: Props) => {
  const [nickname, setNickname] = useState('')
  const [comment, setComment] = useState('')

  const isCommentTooLong = comment.length > 100

  useEffect(() => {
    setNickname(getRandomNickname())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (comment.length > 100) return

    await addComment(nickname, comment)
    refreshComments()
    setComment('')
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setNickname(getRandomNickname)
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='w-[185px] flex justify-between border border-customs-gray-90 rounded-[8px] py-[10px] pl-[12px] pr-[6px] text-customs-gray-50'>
        <p className='text-label3 font-paperlogy'>{nickname}</p>
        <button
          onClick={handleClick}
          type='button'
          className='w-[46px] px-1 py-[2px] rounded-[4px] bg-customs-gray-95 text-label2'
        >
          변경
        </button>
      </div>
      <textarea
        value={comment}
        onChange={handleCommentChange}
        className={`mt-2 mb-4 w-full ${
          comment.length > 40 ? 'h-[120px]' : 'h-[85px]'
        } border border-customs-gray-90 rounded-[8px] p-3 text-customs-gray-25 text-headline3 font-paperlogy`}
        placeholder='먹대리에 대한 평가, 후기 등 의견을 자유롭게 남겨주세요.'
      />
      {isCommentTooLong && <p className='text-caption1 text-[#F66]'>100자 이내로 작성해주세요!</p>}
      <div className='mt-4 w-[71px] ml-auto'>
        <button
          type='submit'
          className='p-2 w-full text-label1 rounded-[8px] bg-customs-gray-10 text-customs-gray-100  hover:bg-[#323036]'
        >
          올리기
        </button>
      </div>
    </form>
  )
}

export default CommentForm
