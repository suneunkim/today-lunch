'use client'

import dynamic from 'next/dynamic'

// Lottie는 브라우저에서만 동작하므로 화면이 뜬 뒤에 불러옵니다.
const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false })
import lottieJson from '../../public/loading.json'

const Loading = () => {
  return (
    <div className='fixed inset-0 bg-customs-beige-85 z-50 flex items-center justify-center'>
      <Lottie loop play style={{ width: 200, height: 200 }} animationData={lottieJson} />
    </div>
  )
}

export default Loading
