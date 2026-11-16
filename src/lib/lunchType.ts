import { Prefs } from './storage'

// 취향 조사 결과로 붙여주는 "점심 유형" 이름
export const lunchTypeOf = (prefs: Pick<Prefs, 'spicy' | 'base' | 'volume'>) => {
  const table: Record<string, [string, string]> = {
    '국물-든든': ['뜨끈한 국밥 부장님형', '국물이 없으면 밥 먹은 것 같지 않은 타입. 뚝배기 앞에서 가장 행복합니다.'],
    '국물-가벼운': ['맑은 국물 선비형', '속 편한 맑은 국물을 선호하는 타입. 오후 업무 컨디션까지 계산합니다.'],
    '밥-든든': ['밥심으로 일하는 대리형', '점심은 무조건 밥. 든든하게 먹어야 오후 회의를 버팁니다.'],
    '밥-가벼운': ['깔끔한 한 그릇 주임형', '과하지 않게 딱 한 그릇. 식곤증 없는 오후를 지향합니다.'],
    '면-든든': ['면치기 달인 과장형', '면이라면 곱빼기도 마다하지 않는 타입. 공깃밥 추가는 기본입니다.'],
    '면-가벼운': ['후루룩 칼퇴 사원형', '빠르고 가볍게 한 그릇. 남은 점심시간은 산책과 커피에 씁니다.'],
  }
  const [name, desc] = table[`${prefs.base ?? '밥'}-${prefs.volume ?? '든든'}`]
  const prefix = prefs.spicy === 'love' ? '맵부심 ' : prefs.spicy === 'no' ? '순한맛 ' : ''
  return { name: prefix + name, desc }
}
