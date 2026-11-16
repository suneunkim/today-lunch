'use client'

import { useEffect, useMemo, useState } from 'react'
import Container from '@/components/Container'
import Card from '@/components/elements/Card'
import { MENUS } from '@/app/data/menus'
import { findMenu } from '@/app/data/food'
import { addHistory, dateKey, getHistory, HistoryItem, removeHistory } from '@/lib/storage'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const formatDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return `${m}월 ${d}일 (${DAYS[new Date(y, m - 1, d).getDay()]})`
}

// 결재 문서함: "이걸로 할게!"로 결재한 점심 기록과 이번 달 요약
const Page = () => {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [draft, setDraft] = useState('')

  useEffect(() => setHistory(getHistory()), [])

  const month = dateKey().slice(0, 7)
  const report = useMemo(() => {
    const items = history.filter((item) => item.date.startsWith(month))
    const menuCount: Record<string, number> = {}
    const catCount: Record<string, number> = {}
    items.forEach((item) => {
      menuCount[item.name] = (menuCount[item.name] ?? 0) + 1
      // 한 메뉴가 여러 카테고리에 속하면 대표(첫 번째) 카테고리로 셉니다.
      const cat = findMenu(item.name)?.cats[0] ?? '기타'
      catCount[cat] = (catCount[cat] ?? 0) + 1
    })
    const sort = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1])
    return { total: items.length, menus: sort(menuCount).slice(0, 3), cats: sort(catCount) }
  }, [history, month])

  const handleAdd = () => {
    const name = draft.trim()
    if (!name) return
    setHistory(addHistory(name))
    setDraft('')
  }

  return (
    <Container title='결재 문서함'>
      <div className='bg-customs-beige-85 p-5 flex flex-col gap-5 min-h-[calc(100vh-48px)] pb-20'>
        <Card title={`${Number(month.slice(5))}월 점심 보고`}>
          {report.total === 0 ? (
            <p className='text-label2 text-customs-gray-50'>
              이번 달 결재 내역이 없습니다. 메뉴를 제안받고 “이걸로 할게!”를 누르면 여기에 쌓입니다.
            </p>
          ) : (
            <>
              <p className='text-body2 text-customs-gray-25'>
                이번 달 결재 <b className='text-customs-orange-50'>{report.total}건</b>
                {report.menus[0] && (
                  <>
                    , 최다 메뉴는 <b>{report.menus[0][0]}</b> ({report.menus[0][1]}회)
                  </>
                )}
              </p>
              <div className='flex flex-col gap-2 mt-4'>
                {report.cats.map(([cat, count]) => (
                  <div key={cat} className='flex items-center gap-3 text-label2 text-customs-gray-25'>
                    <span className='w-12 shrink-0'>{cat}</span>
                    <div className='flex-1 h-3 rounded-full bg-customs-gray-95'>
                      <div
                        className='h-3 rounded-full bg-customs-orange-50'
                        style={{ width: `${(count / report.total) * 100}%` }}
                      />
                    </div>
                    <span className='w-8 text-right shrink-0'>{count}회</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card title='오늘 먹은 메뉴 직접 기록'>
          <div className='flex gap-2'>
            <input
              className='flex-1 min-w-0 h-11 px-3 rounded-[10px] border border-customs-gray-90 text-label2'
              list='menu-names'
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder='메뉴 이름'
              maxLength={20}
            />
            <datalist id='menu-names'>
              {MENUS.map((menu) => (
                <option key={menu.name} value={menu.name} />
              ))}
            </datalist>
            <button
              className='h-11 px-4 rounded-[10px] bg-customs-gray-10 text-customs-gray-100 text-label1 shrink-0'
              onClick={handleAdd}
            >
              기록
            </button>
          </div>
          <p className='text-caption1 text-customs-gray-50 mt-2'>
            기록한 메뉴는 며칠간 추천에서 빠집니다. (기간은 설정에서 변경)
          </p>
        </Card>

        <Card title='결재 내역'>
          {history.length === 0 ? (
            <div className='flex flex-col items-center py-4'>
              <img src='/nocomment.png' alt='' className='w-[110px] h-[99px] object-contain' />
              <p className='text-label2 text-customs-gray-50 mt-3'>아직 결재한 점심이 없습니다.</p>
            </div>
          ) : (
            <ul className='flex flex-col'>
              {history.slice(0, 60).map((item) => (
                <li
                  key={item.id}
                  className='flex items-center justify-between py-3 border-b border-customs-gray-95 last:border-b-0'
                >
                  <div>
                    <div className='text-body1Normal text-customs-gray-10'>{item.name}</div>
                    <div className='text-caption1 text-customs-gray-50 mt-[2px]'>{formatDate(item.date)}</div>
                  </div>
                  <button
                    className='text-caption1 text-customs-gray-50 underline p-2'
                    onClick={() => setHistory(removeHistory(item.id))}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Container>
  )
}

export default Page
