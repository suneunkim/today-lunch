'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Container from '@/components/Container'
import Card from '@/components/elements/Card'
import Chip from '@/components/elements/Chip'
import { MENUS } from '@/app/data/menus'
import { MAP_LABEL, MapApp } from '@/lib/maps'
import { cancelLunchNotifications, isNative, scheduleLunchNotifications } from '@/lib/native'
import {
  addDislike,
  getPrefs,
  getSettings,
  Prefs,
  removeDislike,
  saveSettings,
  Settings,
} from '@/lib/storage'

const inputStyle =
  'flex-1 min-w-0 h-11 px-3 rounded-[10px] border border-customs-gray-90 text-label2 bg-customs-gray-100'
const smallButton = 'h-11 px-4 rounded-[10px] bg-customs-gray-10 text-customs-gray-100 text-label1 shrink-0'
const hint = 'text-caption1 text-customs-gray-50 mt-2'

const pad = (n: number) => String(n).padStart(2, '0')

const Page = () => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [placeDraft, setPlaceDraft] = useState('')
  const [dislikeDraft, setDislikeDraft] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const s = getSettings()
    setSettings(s)
    setPlaceDraft(s.place)
    setPrefs(getPrefs())
  }, [])

  if (!settings || !prefs) return <Container title='설정'>{null}</Container>

  const update = (patch: Partial<Settings>) => setSettings(saveSettings(patch))

  const applyNotify = async (enabled: boolean, hour: number, minute: number) => {
    if (!enabled) {
      await cancelLunchNotifications()
      update({ notify: false, lunchHour: hour, lunchMinute: minute })
      setNotice('')
      return
    }
    const result = await scheduleLunchNotifications(hour, minute)
    if (result === 'scheduled') {
      update({ notify: true, lunchHour: hour, lunchMinute: minute })
      setNotice('평일 점심 30분 전에 알려드리겠습니다.')
    } else {
      update({ notify: false, lunchHour: hour, lunchMinute: minute })
      setNotice(
        result === 'denied'
          ? '알림 권한이 꺼져 있습니다. 휴대폰 설정에서 알림을 허용해 주세요.'
          : '알림은 앱에서만 쓸 수 있습니다.'
      )
    }
  }

  const handleTime = (value: string) => {
    const [h, m] = value.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return
    if (settings.notify) applyNotify(true, h, m)
    else update({ lunchHour: h, lunchMinute: m })
  }

  const handleAddDislike = () => {
    const name = dislikeDraft.trim()
    if (!name) return
    setPrefs(addDislike(name))
    setDislikeDraft('')
  }

  return (
    <Container title='설정'>
      <div className='bg-customs-beige-85 p-5 flex flex-col gap-5 min-h-[calc(100vh-48px)] pb-20'>
        <Card title='내 점심 유형'>
          <p className='text-body1Normal text-customs-orange-50'>
            {prefs.typeName || '아직 취향 조사를 하지 않았습니다.'}
          </p>
          <Link href='/onboarding' className='inline-block mt-3 text-label1 underline text-customs-gray-25'>
            취향 조사 {prefs.typeName ? '다시 하기' : '하러 가기'}
          </Link>
        </Card>

        <Card title='점심시간 · 알림'>
          <div className='flex items-center justify-between'>
            <span className='text-label2 text-customs-gray-25'>우리 회사 점심시간</span>
            <input
              type='time'
              className='h-11 px-3 rounded-[10px] border border-customs-gray-90 text-label2'
              value={`${pad(settings.lunchHour)}:${pad(settings.lunchMinute)}`}
              onChange={(e) => handleTime(e.target.value)}
            />
          </div>
          <label className='flex items-center justify-between mt-4'>
            <span className='text-label2 text-customs-gray-25'>평일 점심 30분 전 알림</span>
            <input
              type='checkbox'
              className='w-5 h-5 accent-[#fe5f01]'
              checked={settings.notify}
              onChange={(e) => applyNotify(e.target.checked, settings.lunchHour, settings.lunchMinute)}
            />
          </label>
          <p className={hint}>
            {notice || (isNative() ? '먹대리가 메뉴 정할 시간을 알려드립니다.' : '알림은 앱에서만 쓸 수 있습니다.')}
          </p>
        </Card>

        <Card title='회사 위치 · 지도'>
          <div className='flex gap-2'>
            <input
              className={inputStyle}
              value={placeDraft}
              onChange={(e) => setPlaceDraft(e.target.value)}
              placeholder='예: 강남역, 성수동'
              maxLength={20}
            />
            <button className={smallButton} onClick={() => update({ place: placeDraft.trim() })}>
              저장
            </button>
          </div>
          <p className={hint}>
            {settings.place
              ? `지도에서 ‘${settings.place} + 메뉴 이름’으로 찾습니다.`
              : '비워 두면 지도 앱이 현재 위치 주변으로 찾습니다.'}
          </p>
          <div className='flex gap-2 mt-4'>
            {(Object.keys(MAP_LABEL) as MapApp[]).map((app) => (
              <Chip key={app} selected={settings.mapApp === app} onClick={() => update({ mapApp: app })}>
                {MAP_LABEL[app]}
              </Chip>
            ))}
          </div>
        </Card>

        <Card title='최근 먹은 메뉴 제외'>
          <div className='flex flex-wrap gap-2'>
            {[0, 2, 3, 5, 7].map((days) => (
              <Chip
                key={days}
                selected={settings.excludeDays === days}
                onClick={() => update({ excludeDays: days })}
              >
                {days === 0 ? '끄기' : `${days}일`}
              </Chip>
            ))}
          </div>
          <p className={hint}>결재 문서함에 기록된 메뉴는 이 기간 동안 다시 제안하지 않습니다.</p>
        </Card>

        <Card title='그만 추천받는 메뉴'>
          <div className='flex gap-2'>
            <input
              className={inputStyle}
              list='menu-names'
              value={dislikeDraft}
              onChange={(e) => setDislikeDraft(e.target.value)}
              placeholder='메뉴 이름'
              maxLength={20}
            />
            <datalist id='menu-names'>
              {MENUS.map((menu) => (
                <option key={menu.name} value={menu.name} />
              ))}
            </datalist>
            <button className={smallButton} onClick={handleAddDislike}>
              추가
            </button>
          </div>
          {prefs.dislikes.length === 0 ? (
            <p className={hint}>아직 없습니다. 결과 화면에서도 바로 추가할 수 있습니다.</p>
          ) : (
            <div className='flex flex-wrap gap-2 mt-3'>
              {prefs.dislikes.map((name) => (
                <button
                  key={name}
                  onClick={() => setPrefs(removeDislike(name))}
                  className='px-3 py-[6px] rounded-full bg-customs-gray-95 text-label2 text-customs-gray-25'
                >
                  {name} ✕
                </button>
              ))}
            </div>
          )}
        </Card>

        <p className='text-caption1 text-customs-gray-50 px-1'>
          취향·기록·설정은 이 휴대폰 안에만 저장됩니다. 앱을 지우면 함께 사라집니다.
        </p>
      </div>
    </Container>
  )
}

export default Page
