// 앱(Capacitor)으로 실행될 때만 쓰는 기능들. 웹에서는 가능한 대체 수단을 쓰거나 조용히 넘어갑니다.
import { Capacitor } from '@capacitor/core'

export const isNative = () => Capacitor.isNativePlatform()

export const shareText = async (title: string, text: string) => {
  try {
    if (isNative()) {
      const { Share } = await import('@capacitor/share')
      await Share.share({ title, text, dialogTitle: title })
      return 'shared'
    }
    if (navigator.share) {
      await navigator.share({ title, text })
      return 'shared'
    }
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'cancelled'
  }
}

const NOTIFY_MESSAGES = [
  '점심 30분 전입니다. 메뉴 결재 올리셨습니까?',
  '곧 점심시간입니다. 먹대리가 메뉴 제안드리겠습니다!',
  '오늘 점심 안건이 아직 미결입니다. 지금 결재해 주세요.',
  '점심 메뉴 회의 소집합니다. 3안 준비해 뒀습니다.',
  '금요일 점심입니다. 오늘은 맛있는 걸로 가시죠!',
]

const NOTIFY_IDS = [101, 102, 103, 104, 105]

export const cancelLunchNotifications = async () => {
  if (!isNative()) return
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  await LocalNotifications.cancel({ notifications: NOTIFY_IDS.map((id) => ({ id })) })
}

// 평일(월~금) 점심시간 30분 전에 매주 반복 알림을 겁니다.
export const scheduleLunchNotifications = async (lunchHour: number, lunchMinute: number) => {
  if (!isNative()) return 'unsupported' as const
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  const permission = await LocalNotifications.requestPermissions()
  if (permission.display !== 'granted') return 'denied' as const

  const total = (lunchHour * 60 + lunchMinute - 30 + 24 * 60) % (24 * 60)
  const hour = Math.floor(total / 60)
  const minute = total % 60

  await cancelLunchNotifications()
  await LocalNotifications.schedule({
    notifications: NOTIFY_IDS.map((id, i) => ({
      id,
      title: '오늘 점심은 먹대리가',
      body: NOTIFY_MESSAGES[i],
      // weekday: 1 = 일요일 … 2 = 월요일 ~ 6 = 금요일
      schedule: { on: { weekday: i + 2, hour, minute }, allowWhileIdle: true },
    })),
  })
  return 'scheduled' as const
}
