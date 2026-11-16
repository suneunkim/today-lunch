'use client'

import { useState } from 'react'
import Button from '@/components/elements/Button'
import { shareText } from '@/lib/native'

interface Props {
  label: string
  text: string
}

const ShareButton = ({ label, text }: Props) => {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const result = await shareText('오늘 점심은 먹대리가', text)
    if (result === 'copied') {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button type='ghost' onClick={handleShare}>
      {copied ? '복사했습니다. 붙여넣어 공유하세요!' : label}
    </Button>
  )
}

export default ShareButton
