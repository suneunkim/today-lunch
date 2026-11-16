import type { NextConfig } from 'next'

// 서버 없이 동작하는 정적 앱으로 내보냅니다 (out/ 폴더 → Capacitor가 앱으로 포장).
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
