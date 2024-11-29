'use client'

import { useRouter } from 'next/navigation'
import BasicIcon from './BasicIcon'

interface Props {
  name: 'left' | 'home'
}

const HeaderAction = ({ name }: Props) => {
  const router = useRouter()

  const handleClick = () => {
    if (name === 'left') {
      router.back()
    } else {
      router.push('/home')
    }
  }
  return (
    <button onClick={handleClick}>
      <BasicIcon name={name} />
    </button>
  )
}

export default HeaderAction
