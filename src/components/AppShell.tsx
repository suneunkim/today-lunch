'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { toast } from '@/lib/toast'

// 뒤로가기를 눌렀을 때 갈 곳: 하위 화면은 상위 화면으로, 탭 화면은 홈으로, 홈에서는 앱 종료
const parentOf = (path: string) => {
  if (path.startsWith('/games/') || path.startsWith('/worldcup')) return '/games'
  if (path.startsWith('/result') || path.startsWith('/weather')) return '/home'
  if (['/stats', '/privacy', '/project', '/licenses'].some((p) => path.startsWith(p))) return '/settings'
  if (['/slot', '/office', '/games', '/history', '/settings', '/onboarding'].some((p) => path.startsWith(p))) return '/home'
  return '' // 홈, 첫 화면
}

// 앱 전체에 한 번만 깔리는 것들: 토스트, 안드로이드 뒤로가기 처리
const AppShell = () => {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const pathRef = useRef(pathname)
  const lastBack = useRef(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    pathRef.current = pathname
  }, [pathname])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail)
      clearTimeout(timer)
      timer = setTimeout(() => setMessage(''), 2400)
    }
    window.addEventListener('mukdaeri-toast', onToast)
    return () => window.removeEventListener('mukdaeri-toast', onToast)
  }, [])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let remove = () => {}
    import('@capacitor/app').then(({ App }) => {
      App.addListener('backButton', () => {
        const parent = parentOf(pathRef.current)
        if (parent) {
          router.replace(parent)
          return
        }
        // 홈·첫 화면: 두 번 연달아 누르면 종료
        if (Date.now() - lastBack.current < 2000) {
          App.exitApp()
          return
        }
        lastBack.current = Date.now()
        toast('한 번 더 누르면 앱을 종료합니다.')
      }).then((handle) => {
        remove = () => handle.remove()
      })
    })
    return () => remove()
  }, [router])

  if (!message) return null
  return (
    <div className='fixed left-0 right-0 bottom-[84px] z-40 flex justify-center px-6 pointer-events-none'>
      <div className='pop-in max-w-[400px] rounded-[14px] bg-customs-gray-10 bg-opacity-90 text-customs-gray-100 text-label2 px-4 py-3 text-center'>
        {message}
      </div>
    </div>
  )
}

export default AppShell
