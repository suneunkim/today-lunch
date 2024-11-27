import Lottie from 'react-lottie-player'
import lottieJson from '../../public/loading.json'

const Loading = () => {
  return (
    <div className='fixed inset-0 bg-customs-beige-85 z-50 flex items-center justify-center'>
      <Lottie loop play style={{ width: 200, height: 200 }} animationData={lottieJson} />
    </div>
  )
}

export default Loading
