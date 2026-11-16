'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const icon = (d: string) => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
    <path d={d} />
  </svg>
)

const tabs = [
  { href: '/home', label: '홈', match: ['/home', '/result', '/weather', '/weekly'], icon: icon('M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z') },
  { href: '/slot', label: '전결', match: ['/slot'], icon: icon('M5 5h14v14H5zM9.5 5v14M14.5 5v14M5 12h14') },
  { href: '/office', label: '회의실', match: ['/office'], icon: icon('M4 7h16v11H4zM4 11h16M8 15h3') },
  { href: '/games', label: '휴게실', match: ['/games', '/worldcup'], icon: icon('M6 9h12a3 3 0 0 1 3 3v3a3 3 0 0 1-5.5 1.6L14.5 15h-5l-1 1.6A3 3 0 0 1 3 15v-3a3 3 0 0 1 3-3zM8 12v2M7 13h2M16 13h.01') },
  { href: '/history', label: '문서함', match: ['/history', '/settings', '/stats'], icon: icon('M4 7l2-3h5l2 3h7v12H4zM9 13h6') },
]

// 어느 화면에서든 한 번에 이동할 수 있는 하단 탭
const BottomNav = () => {
  const pathname = usePathname() ?? ''
  return (
    <nav className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 bg-customs-gray-100 border-t border-customs-gray-90 pb-[env(safe-area-inset-bottom,0px)]'>
      <ul className='flex h-[60px]'>
        {tabs.map((tab) => {
          const active = tab.match.some((m) => pathname.startsWith(m))
          return (
            <li key={tab.href} className='flex-1'>
              <Link
                href={tab.href}
                className={`h-full flex flex-col items-center justify-center gap-[2px] text-caption1 ${
                  active ? 'text-customs-orange-50 font-bold' : 'text-customs-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
