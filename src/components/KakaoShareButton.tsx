'use client'

import useLoadKakao from '@/hooks/useLoadKakao'
import Button from '@/components/elements/Button'

interface Props {
  page: 'result' | 'weather'
  categories?: string
}

const KakaoShareButton = ({ page, categories }: Props) => {
  const isKakaoLoaded = useLoadKakao()

  const resultImage = '/kakao/result_share.png'

  const weatherImage = '/kakao/weather_share.png'

  const handleKakaoShare = () => {
    if (isKakaoLoaded) {
      let shareUrl = 'https://today-lunch-smoky.vercel.app'

      // 페이지에 따른 URL 설정
      if (page === 'result' && categories) {
        // categories를 query string으로 추가
        shareUrl += `/result?categories=${encodeURIComponent(categories)}`
      } else if (page === 'weather') {
        shareUrl += '/weather'
      }

      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '오늘 점심은 먹대리가',
          description:
            page === 'result' ? '메뉴 추천 결과를 확인해보세요!' : '오늘 날씨에 어울리는 음식은?',
          imageUrl: page === 'result' ? resultImage : weatherImage,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '자세히 보기',
            link: { webUrl: shareUrl },
          },
        ],
      })
    }
  }

  return (
    <Button type='ghost' onClick={handleKakaoShare}>
      {page === 'result' ? '카카오톡으로 결과 공유하기' : '카카오톡으로 페이지 공유하기'}
    </Button>
  )
}

export default KakaoShareButton
