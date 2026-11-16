'use client'

import dynamic from 'next/dynamic'

// Lottie는 브라우저에서만 동작하므로 화면이 뜬 뒤에 불러옵니다.
const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false })
import StampLottie from '../../public/stamp.json'

const Stamp = () => {
  return (
    <div className='absolute right-[-30px] top-[-30px] z-10'>
      <Lottie loop={false} play animationData={StampLottie} style={{ width: 180, height: 180 }} />
    </div>
  )
}

export default Stamp
