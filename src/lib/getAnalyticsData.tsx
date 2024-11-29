// lib/getAnalyticsData.ts
import { google } from 'googleapis'
import path from 'path'

// 서비스 계정 키 파일 경로 설정
const keyFilePath = path.join(process.cwd(), process.env.GOOGLE_SERVICE_KEY_PATH!)
// 인증 클라이언트 생성
const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
})

const analyticsData = google.analyticsdata('v1beta')

export async function getAnalyticsData() {
  try {
    const authClient = await auth.getClient()

    const totalUser = await analyticsData.properties.runReport({
      auth: authClient as any,
      property: 'properties/466314451', // 속성 ID를 직접 파라미터로 전달
      requestBody: {
        dateRanges: [
          {
            startDate: '2024-11-04',
            endDate: 'today',
          },
        ],
        metrics: [
          {
            name: 'totalUsers',
          },
        ],
      },
    })

    const clickCount = await analyticsData.properties.runReport({
      auth: authClient as any,
      property: 'properties/466314451',
      requestBody: {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: 'recommend_button_click' },
          },
        },
      },
    })

    return { totalUser, clickCount }
  } catch (error) {
    console.error('Error fetching Analytics Data:', error)
    throw error
  }
}
