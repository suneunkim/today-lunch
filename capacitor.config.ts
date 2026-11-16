import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // 스토어에 한 번 올리면 바꿀 수 없는 앱 고유 ID입니다. 첫 출시 전에만 변경하세요.
  appId: 'com.mukdaeri.todaylunch',
  appName: '먹대리',
  webDir: 'out',
  backgroundColor: '#ffffffff',
  plugins: {
    SystemBars: { insetsHandling: 'native' },
    LocalNotifications: { iconColor: '#FE5F01' },
  },
}

export default config
