// 지도 앱 검색 링크. 앱이 깔려 있으면 앱으로, 없으면 웹 지도로 열립니다.
export type MapApp = 'kakao' | 'naver'

export const MAP_LABEL: Record<MapApp, string> = { kakao: '카카오맵', naver: '네이버 지도' }

export const buildMapQuery = (place: string, keyword: string, extra = '') =>
  [place.trim(), keyword.trim(), extra.trim()].filter(Boolean).join(' ')

export const mapSearchUrl = (app: MapApp, query: string) => {
  const q = encodeURIComponent(query)
  return app === 'kakao'
    ? `https://map.kakao.com/link/search/${q}`
    : `https://map.naver.com/p/search/${q}`
}
