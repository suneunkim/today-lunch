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
    'https://cdn.discordapp.com/attachments/1298624877435027492/1311970297804488785/-_.png?ex=674acb0e&is=6749798e&hm=064687a2bd24818c8a7e030cb0f144b3f3920e8d0d6481caa366f82a67e9f80d&'

  const weatherImage =
    'https://cdn.discordapp.com/attachments/1298624877435027492/1311970298316328980/-_-1.png?ex=674acb0e&is=6749798e&hm=7777c5254701a50b4ce8817ad861cd25ae57e5b4d05d94b63a6984f7309ac26d&'

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
