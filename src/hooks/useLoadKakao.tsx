import { useEffect, useState } from 'react'

declare global {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  interface Window {
    Kakao: any
  }
  /* eslint-disable @typescript-eslint/no-explicit-any */
}

const useLoadKakao = () => {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)

  useEffect(() => {
    if (window.Kakao && window.Kakao.isInitialized()) return

    // script 태그 생성
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
    script.async = true

    script.onload = () => {
      if (window.Kakao) {
        try {
          // Kakao SDK 초기화
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY)

          // Verify initialization
          if (window.Kakao.isInitialized()) {
            setIsKakaoLoaded(true)
          } else {
            console.error('Kakao SDK initialization failed')
          }
        } catch (error) {
          console.error('Error initializing Kakao SDK:', error)
        }
      } else {
        console.error('Kakao object not found on window')
      }
    }

    script.onerror = () => {
      console.error('Failed to load Kakao SDK script')
    }

    // 헤더에 추가하기
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return isKakaoLoaded
}

export default useLoadKakao
