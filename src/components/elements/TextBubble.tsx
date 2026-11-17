import React from 'react'

interface Props {
  bubbleTail: boolean
  text: string
  color: 'gray' | 'orange'
  tailSide?: 'left' | 'right' // 말하는 캐릭터가 있는 쪽
}
const TextBubble = ({ bubbleTail, text, color, tailSide = 'left' }: Props) => {
  const colorType =
    color === 'gray'
      ? 'text-customs-gray-25 bg-customs-gray-95'
      : 'text-customs-gray-100 bg-customs-orange-55'

  const colorTypeTail = color === 'gray' ? 'bg-customs-gray-95' : 'bg-customs-orange-55'

  const styles = {
    speechBubble: `px-[14px] py-[10px] text-body1Normal rounded-[20px] inline-block w-auto ${colorType}`,
    speechBubbleTail: `absolute h-[15px] w-[15px] bg-customs-gray-95 -rotate-45 rounded-[3px] ${tailSide === 'right' ? '-right-[5px] bottom-[13px]' : 'left-[21px] -bottom-[5px]'} ${colorTypeTail}`,
  }

  return (
    <div className='mb-[11px]'>
      {bubbleTail ? (
        <p className={`${styles.speechBubble} mt-[6px] relative`}>
          {text}
          <span className={styles.speechBubbleTail} />
        </p>
      ) : (
        <p className={styles.speechBubble}>{text}</p>
      )}
    </div>
  )
}

export default TextBubble
