'use client'

import { usePathname, useRouter } from 'next/navigation'
import BasicIcon from './BasicIcon'

interface Props {
  name: 'left' | 'settings'
}

const gear = (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#19181B' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='3.2' />
    <path d='M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4z' />
  </svg>
)

const HeaderAction = ({ name }: Props) => {
  const router = useRouter()
  const pathname = usePathname() ?? ''

  if (name === 'left') {
    return (
      <button onClick={() => (window.history.length > 1 ? router.back() : router.replace('/home'))} aria-label='뒤로'>
        <BasicIcon name='left' />
      </button>
    )
  }
  // 설정 화면에서는 설정 버튼 자리를 비워 둡니다.
  if (pathname.startsWith('/settings')) return <span className='w-6' />
  return (
    <button onClick={() => router.push('/settings')} aria-label='설정'>
      {gear}
    </button>
  )
}

export default HeaderAction
