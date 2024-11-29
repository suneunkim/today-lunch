import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import GoogleAnalytics from '@/lib/GoogleAnalytics'

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

const paperlogy = localFont({
  src: [
    { path: './fonts/Paperlogy-4Regular.ttf', weight: '400' },
    { path: './fonts/Paperlogy-6SemiBold.ttf', weight: '600' },
    { path: './fonts/Paperlogy-7Bold.ttf', weight: '700' },
  ],
  variable: '--font-paperlogy',
})

export const metadata: Metadata = {
  title: '오늘 점심은 먹대리가',
  description: '먹대리에게 점심 메뉴 추천을 받아보세요!',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    url: 'https://today-lunch-smoky.vercel.app',
    title: '오늘 점심은 먹대리가',
    description: '먹대리에게 점심 메뉴 추천을 받아보세요!',
    images: [{ url: '/mukdaeri-id-card.png', width: 800, height: 600 }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='ko'>
      <body className={`${pretendard.className} ${paperlogy.variable} antialiased`}>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        <main>{children}</main>
      </body>
    </html>
  )
}
