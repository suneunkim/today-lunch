import Container from '@/components/Container'

const sections: { title: string; body: string[] }[] = [
  {
    title: '1. 수집하는 정보',
    body: [
      '이 앱은 회원가입이나 로그인이 없으며, 이름·연락처 등 개인을 식별할 수 있는 정보를 수집하지 않습니다.',
      '서비스 이용 통계를 위해 다음 정보가 익명으로 집계됩니다: 메뉴 추천 횟수, 결재(선택)된 메뉴 이름과 횟수, 일자별 이용 횟수와 이용 기기 수(숫자만 더해지며 기기를 구분하는 값은 저장하지 않습니다).',
      '웹 버전에서는 방문 통계를 위해 Google Analytics가 사용될 수 있습니다.',
    ],
  },
  {
    title: '2. 기기에만 저장되는 정보',
    body: [
      '취향 조사 결과, 점심 기록, 그만 추천받는 메뉴, 회사 위치(직접 입력한 역·동네 이름), 단골집 메모, 알림 설정은 사용 중인 기기 안에만 저장되며 서버로 전송되지 않습니다. 앱을 삭제하면 함께 삭제됩니다.',
    ],
  },
  {
    title: '3. 위치 정보',
    body: [
      '날씨 맞춤 메뉴에서 “내 위치 불러오기”를 누른 경우에만 위치 권한을 요청하며, 가장 가까운 주요 도시를 고르는 데에만 사용합니다. 위치 정보는 저장하거나 서버로 전송하지 않습니다.',
    ],
  },
  {
    title: '4. 외부 서비스',
    body: [
      '이용 통계 집계: Google Firebase (Firestore)',
      '날씨 정보: Open-Meteo (도시 좌표만 전달)',
      '지도 검색: 카카오맵·네이버 지도 (버튼을 누르면 검색어와 함께 해당 서비스로 이동)',
    ],
  },
  {
    title: '5. 문의',
    body: ['문의 및 의견은 앱 하단의 “의견 보내기”를 이용해 주세요.'],
  },
]

const page = () => {
  return (
    <Container title='개인정보처리방침'>
      <div className='bg-customs-gray-100 p-5 pb-20 flex flex-col gap-6'>
        <p className='text-label2 text-customs-gray-50'>시행일: 2026년 11월 16일</p>
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className='text-headline2 font-paperlogy text-customs-gray-10 mb-2'>{section.title}</h2>
            {section.body.map((text, i) => (
              <p key={i} className='text-label2 text-customs-gray-25 mb-2'>
                {text}
              </p>
            ))}
          </section>
        ))}
      </div>
    </Container>
  )
}

export default page
