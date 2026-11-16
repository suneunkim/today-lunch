'use client'

import { useEffect, useRef, useState } from 'react'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Card from '@/components/elements/Card'
import Chip from '@/components/elements/Chip'
import Ladder from '@/components/features/office/Ladder'
import { getMembers, saveMembers } from '@/lib/storage'

const inputStyle =
  'flex-1 min-w-0 h-11 px-3 rounded-[10px] border border-customs-gray-90 text-label2 bg-customs-gray-100'
const smallButton = 'h-11 px-4 rounded-[10px] bg-customs-gray-10 text-customs-gray-100 text-label1 shrink-0'

const PAY_LINES = [
  '결제… 아니, 결재 감사합니다!',
  '오늘 점심은 이분이 쏘십니다. 박수!',
  '법카가 아니라는 점 양해 부탁드립니다.',
  '커피는 다른 분이 사는 걸로 하시죠.',
]

// 오늘 누가 쏠까: 이름을 넣고 한 명 뽑기
const WhoPays = () => {
  const [members, setMembers] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [display, setDisplay] = useState('')
  const [winner, setWinner] = useState('')
  const [line, setLine] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [method, setMethod] = useState<'roulette' | 'ladder'>('roulette')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMembers(getMembers())
    return () => void (timer.current && clearTimeout(timer.current))
  }, [])

  const update = (next: string[]) => {
    setMembers(next)
    saveMembers(next)
    setWinner('')
  }

  const add = () => {
    const names = draft
      .split(/[,\s]+/)
      .map((n) => n.trim())
      .filter((n) => n && !members.includes(n))
    if (names.length) update([...members, ...names].slice(0, 20))
    setDraft('')
  }

  const pick = () => {
    if (members.length < 2 || spinning) return
    const chosen = members[Math.floor(Math.random() * members.length)]
    setSpinning(true)
    setWinner('')
    const step = (i: number) => {
      if (i >= 18) {
        setDisplay(chosen)
        setWinner(chosen)
        setLine(PAY_LINES[Math.floor(Math.random() * PAY_LINES.length)])
        setSpinning(false)
        return
      }
      setDisplay(members[i % members.length])
      timer.current = setTimeout(() => step(i + 1), 70 + i * 12)
    }
    step(0)
  }

  return (
    <Card title='오늘 누가 쏠까'>
      <div className='flex gap-2'>
        <input
          className={inputStyle}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder='이름 (쉼표로 여러 명)'
          maxLength={40}
        />
        <button className={smallButton} onClick={add}>
          추가
        </button>
      </div>
      {members.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-3'>
          {members.map((name) => (
            <button
              key={name}
              onClick={() => update(members.filter((n) => n !== name))}
              className='px-3 py-[6px] rounded-full bg-customs-gray-95 text-label2 text-customs-gray-25'
            >
              {name} ✕
            </button>
          ))}
        </div>
      )}

      <div className='flex gap-2 mt-4'>
        <Chip selected={method === 'roulette'} onClick={() => setMethod('roulette')}>
          룰렛
        </Chip>
        <Chip selected={method === 'ladder'} onClick={() => setMethod('ladder')}>
          사다리 타기
        </Chip>
      </div>

      {method === 'ladder' ? (
        <div className='mt-4'>
          {members.length < 2 ? (
            <p className='text-label2 text-customs-gray-50'>두 명 이상 넣으면 사다리가 그려집니다.</p>
          ) : members.length > 8 ? (
            <p className='text-label2 text-customs-gray-50'>사다리는 8명까지 가능합니다. 인원을 줄이거나 룰렛을 이용해 주세요.</p>
          ) : (
            <Ladder members={members} />
          )}
        </div>
      ) : (
        <>
      <div className='mt-4 h-[96px] rounded-[14px] bg-customs-orange-95-bg flex flex-col items-center justify-center'>
        {display ? (
          <>
            {winner && <span className='text-caption1 text-customs-gray-50'>오늘의 결제자</span>}
            <span
              className={`font-paperlogy font-bold text-[26px] ${
                winner ? 'text-customs-orange-50 pop-in' : 'text-customs-gray-25'
              }`}
            >
              {display}
              {winner && ' 님'}
            </span>
          </>
        ) : (
          <span className='text-label2 text-customs-gray-50'>두 명 이상 넣고 뽑아 보세요</span>
        )}
      </div>
      {winner && <p className='text-label2 text-customs-gray-25 mt-3 text-center'>🦝 {line}</p>}
      <div className='mt-4'>
        <Button type='primary' onClick={pick} disabled={members.length < 2 || spinning}>
          {winner ? '다시 뽑기' : '결제자 뽑기'}
        </Button>
      </div>
        </>
      )}
    </Card>
  )
}

const won = (n: number) => n.toLocaleString('ko-KR') + '원'

// N빵 계산기
const SplitBill = () => {
  const [total, setTotal] = useState('')
  const [people, setPeople] = useState(4)
  const [round, setRound] = useState(true)

  const amount = Number(total.replace(/[^0-9]/g, '')) || 0
  const exact = amount / people
  const each = round ? Math.ceil(exact / 100) * 100 : Math.ceil(exact)
  const extra = each * people - amount

  return (
    <Card title='N빵 계산기'>
      <label className='text-label1 text-customs-gray-25'>총 금액</label>
      <input
        className={`${inputStyle} w-full mt-1 mb-4`}
        inputMode='numeric'
        value={amount ? amount.toLocaleString('ko-KR') : ''}
        onChange={(e) => setTotal(e.target.value)}
        placeholder='예: 48,000'
      />
      <div className='flex items-center justify-between mb-4'>
        <span className='text-label1 text-customs-gray-25'>인원</span>
        <div className='flex items-center gap-4'>
          <button
            className='w-10 h-10 rounded-full bg-customs-gray-95 text-heading2'
            onClick={() => setPeople((p) => Math.max(2, p - 1))}
            aria-label='인원 줄이기'
          >
            −
          </button>
          <span className='text-heading2 w-10 text-center'>{people}명</span>
          <button
            className='w-10 h-10 rounded-full bg-customs-gray-95 text-heading2'
            onClick={() => setPeople((p) => Math.min(30, p + 1))}
            aria-label='인원 늘리기'
          >
            +
          </button>
        </div>
      </div>
      <label className='flex items-center gap-2 text-label2 text-customs-gray-25 mb-4'>
        <input type='checkbox' checked={round} onChange={(e) => setRound(e.target.checked)} />
        100원 단위로 올림
      </label>
      <div className='rounded-[14px] bg-customs-orange-95-bg px-5 py-4'>
        <div className='text-label2 text-customs-gray-25'>1인당</div>
        <div className='font-paperlogy font-bold text-[26px] text-customs-orange-50'>
          {amount ? won(each) : '—'}
        </div>
        {amount > 0 && extra > 0 && (
          <div className='text-caption1 text-customs-gray-50 mt-1'>
            이렇게 걷으면 {won(extra)} 남습니다. 커피값에 보태세요.
          </div>
        )}
      </div>
    </Card>
  )
}

const Page = () => {
  return (
    <Container title='점심 회의실'>
      <div className='bg-customs-beige-85 p-5 flex flex-col gap-5 min-h-[calc(100vh-48px)] pb-20'>
        <WhoPays />
        <SplitBill />
      </div>
    </Container>
  )
}

export default Page
