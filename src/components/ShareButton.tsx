'use client'

import { useState } from 'react'
import Button from '@/components/elements/Button'
import { shareImage, shareText } from '@/lib/native'

interface Props {
  label: string
  text: string
  // 주어지면 글 대신 이미지 카드를 만들어 공유합니다.
  image?: () => Promise<Blob>
}

const ShareButton = ({ label, text, image }: Props) => {
  const [notice, setNotice] = useState('')

  const handleShare = async () => {
    let result: string
    try {
      result = image ? await shareImage(await image(), 'mukdaeri.png', text) : await shareText('오늘 점심은 먹대리가', text)
    } catch {
      result = await shareText('오늘 점심은 먹대리가', text)
    }
    const message = result === 'copied' ? '복사했습니다!' : result === 'downloaded' ? '이미지를 저장했습니다!' : ''
    if (message) {
      setNotice(message)
      setTimeout(() => setNotice(''), 2000)
    }
  }

  return (
    <Button type='sub' onClick={handleShare}>
      {notice || label}
    </Button>
  )
}

export default ShareButton
