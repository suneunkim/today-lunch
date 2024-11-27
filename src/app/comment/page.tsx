import Container from '@/components/Container'

import TextBubble from '@/components/elements/TextBubble'
import CommentForm from '@/components/features/comment/CommentForm'
import CommentList from '@/components/features/comment/CommentList'
import { getCommentsCount, getInitialComments } from '@/lib/firebase/comments'

const page = async () => {
  const initialData = await getInitialComments()
  const commentsCount = await getCommentsCount()

  return (
    <div>
      <Container title='코멘트'>
        <div className='bg-customs-gray-10 p-5'>
          <div className='relative overflow-hidden'>
            <TextBubble bubbleTail={true} text='식사는 맛있게 하셨습니까?' color='orange' />
            <img src='comment.png' className='w-[96px] h-[90px] absolute right-0 top-[5px]' />
          </div>
          <section className='bg-customs-gray-100 p-4 pb-8 rounded-[12px] mb-[125px]'>
            <CommentForm />
            <CommentList initialData={initialData} commentsCount={commentsCount} />
          </section>
        </div>
      </Container>
    </div>
  )
}

export default page
