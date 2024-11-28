import Lottie from 'react-lottie-player'
import StampLottie from '../../public/stamp.json'

const Stamp = () => {
  return (
    <div className='absolute right-[-30px] top-[-30px] z-10'>
      <Lottie loop={false} play animationData={StampLottie} style={{ width: 180, height: 180 }} />
    </div>
  )
}

export default Stamp
