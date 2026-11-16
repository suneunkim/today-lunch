// 메뉴 월드컵 출전 메뉴: 누구나 아는 "국룰" 점심 메뉴로 고정합니다.
export const WORLDCUP_KOREAN = [
  '김치찌개', '된장찌개', '순두부찌개', '부대찌개', '제육볶음', '순댓국', '뼈해장국', '돼지국밥',
  '설렁탕', '육개장', '칼국수', '냉면', '비빔밥', '김치볶음밥', '닭갈비', '불고기 정식',
]

export const WORLDCUP_OTHERS = [
  '짜장면', '짬뽕', '마라탕', '탕수육', '초밥', '돈카츠 정식', '돈코츠 라멘', '우동',
  '카레라이스', '쌀국수', '햄버거', '까르보나라', '피자', '샌드위치', '떡볶이', '김밥',
]

export const WORLDCUP_MODES = [
  { key: 'all32', label: '점심 국룰 32강', desc: '대표 메뉴 32개 전부', size: 32, pool: [...WORLDCUP_KOREAN, ...WORLDCUP_OTHERS] },
  { key: 'all16', label: '점심 국룰 16강', desc: '32개 중 16개를 뽑아 빠르게', size: 16, pool: [...WORLDCUP_KOREAN, ...WORLDCUP_OTHERS] },
  { key: 'korean16', label: '한식 16강', desc: '찌개·국밥·볶음 한식 대결', size: 16, pool: WORLDCUP_KOREAN },
] as const
