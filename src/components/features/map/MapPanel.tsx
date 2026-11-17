'use client'

import { useEffect, useState } from 'react'
import Chip from '@/components/elements/Chip'
import { buildMapQuery, MapApp, mapSearchUrl } from '@/lib/maps'
import { getFavorites, getSettings, saveFavorite, saveSettings } from '@/lib/storage'

const EXTRAS = ['', '맛집', '혼밥', '점심특선']

const pin = (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' className='inline -mt-[2px] mr-1'>
    <path d='M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z' />
  </svg>
)

const inputStyle =
  'flex-1 min-w-0 h-11 px-3 rounded-[10px] border border-customs-gray-90 text-label2 text-customs-gray-10 bg-customs-gray-100'
const smallButton = 'h-11 px-4 rounded-[10px] bg-customs-gray-10 text-customs-gray-100 text-label1 shrink-0'

// 고른 메뉴를 회사 근처에서 바로 찾을 수 있게 해주는 패널
const MapPanel = ({ menu }: { menu: string }) => {
  const [place, setPlace] = useState('')
  const [placeDraft, setPlaceDraft] = useState('')
  const [editingPlace, setEditingPlace] = useState(false)
  const [mapApp, setMapApp] = useState<MapApp>('kakao')
  const [extra, setExtra] = useState('')
  const [favorite, setFavorite] = useState('')
  const [favoriteDraft, setFavoriteDraft] = useState('')
  const [editingFavorite, setEditingFavorite] = useState(false)

  useEffect(() => {
    const settings = getSettings()
    setPlace(settings.place)
    setPlaceDraft(settings.place)
    setMapApp(settings.mapApp)
  }, [])

  useEffect(() => {
    const saved = getFavorites()[menu] ?? ''
    setFavorite(saved)
    setFavoriteDraft(saved)
    setEditingFavorite(false)
  }, [menu])

  const handleSavePlace = () => {
    saveSettings({ place: placeDraft.trim() })
    setPlace(placeDraft.trim())
    setEditingPlace(false)
  }

  const handleSaveFavorite = () => {
    saveFavorite(menu, favoriteDraft)
    setFavorite(favoriteDraft.trim())
    setEditingFavorite(false)
  }

  const open = (app: MapApp, keyword: string, suffix = '') => {
    if (app !== mapApp) {
      setMapApp(app)
      saveSettings({ mapApp: app })
    }
    window.open(mapSearchUrl(app, buildMapQuery(place, keyword, suffix)), '_blank')
  }

  if (!menu) return null

  return (
    <section className='px-6 py-7 bg-customs-gray-100 rounded-[20px] text-customs-gray-10'>
      <h4 className='text-headline2 font-paperlogy'>‘{menu}’ 먹으러 갈 곳 찾기</h4>

      {/* 회사 위치 */}
      <div className='mt-3'>
        {place && !editingPlace ? (
          <p className='text-label2 text-customs-gray-25'>
            📍 <b>{place}</b> 근처에서 찾습니다.{' '}
            <button className='underline' onClick={() => setEditingPlace(true)}>
              변경
            </button>
          </p>
        ) : (
          <>
            <p className='text-label2 text-customs-gray-25 mb-2'>
              회사 근처 역이나 동네를 적어두면 항상 그 주변으로 찾아드립니다.
            </p>
            <div className='flex gap-2'>
              <input
                className={inputStyle}
                value={placeDraft}
                onChange={(e) => setPlaceDraft(e.target.value)}
                placeholder='예: 강남역, 성수동'
                maxLength={20}
              />
              <button className={smallButton} onClick={handleSavePlace}>
                저장
              </button>
            </div>
          </>
        )}
      </div>

      {/* 검색어 보태기 */}
      <div className='flex flex-wrap gap-2 mt-4'>
        {EXTRAS.map((word) => (
          <Chip key={word} selected={extra === word} onClick={() => setExtra(word)}>
            {word === '' ? '기본' : `+ ${word}`}
          </Chip>
        ))}
      </div>

      <div className='flex gap-2 mt-4'>
        <button
          onClick={() => open('kakao', menu, extra)}
          className='flex-1 py-[14px] rounded-[14px] text-label1 bg-[#FEE500] text-[#191919]'
        >
          {pin}
          카카오맵에서 찾기
        </button>
        <button
          onClick={() => open('naver', menu, extra)}
          className='flex-1 py-[14px] rounded-[14px] text-label1 bg-[#03C75A] text-white'
        >
          {pin}
          네이버 지도에서 찾기
        </button>
      </div>

      {/* 단골집 메모 */}
      <div className='mt-5 pt-4 border-t border-customs-gray-90'>
        {favorite && !editingFavorite ? (
          <div className='flex items-center justify-between gap-2'>
            <p className='text-label2'>
              📌 내 단골집: <b>{favorite}</b>
            </p>
            <div className='flex gap-3 text-label1 shrink-0'>
              <button className='underline' onClick={() => open(mapApp, favorite)}>
                지도
              </button>
              <button className='underline' onClick={() => setEditingFavorite(true)}>
                수정
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className='text-label2 text-customs-gray-25 mb-2'>
              이 메뉴 단골집이 있다면 메모해 두세요. 다음에 바로 알려드립니다.
            </p>
            <div className='flex gap-2'>
              <input
                className={inputStyle}
                value={favoriteDraft}
                onChange={(e) => setFavoriteDraft(e.target.value)}
                placeholder='식당 이름'
                maxLength={30}
              />
              <button className={smallButton} onClick={handleSaveFavorite}>
                메모
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default MapPanel
