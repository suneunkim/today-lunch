'use client'

import useLoadKakao from '@/hooks/useLoadKakao'
import Button from '@/components/elements/Button'

interface Props {
  page: 'result' | 'weather'
  categories?: string
}

const KakaoShareButton = ({ page, categories }: Props) => {
  const isKakaoLoaded = useLoadKakao()

  const resultImage =
    'https://cdn.discordapp.com/attachments/1298624877435027492/1309326486674735154/1993a523aba79b50.png?ex=674915d0&is=6747c450&hm=dfdf2a20f3e9a53163312c1997c8c5ea410ec1dba18e4e7f790f9dd068a08765&'

  const weatherImage =
    'https://cdn.discordapp.com/attachments/1298624877435027492/1309326486955626566/4b1426bc77ba75ef.png?ex=674915d0&is=6747c450&hm=cf40109fae744c7bc8ef5fb0d93e9ae959ce0eacc8f67958ac53cacbfba635b6&'

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
      {page === 'result' ? '결과 공유하기' : '페이지 공유하기'}
    </Button>
  )
}

export default KakaoShareButton
