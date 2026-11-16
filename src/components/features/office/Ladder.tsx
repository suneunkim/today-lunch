'use client'

import { useMemo, useState } from 'react'
import Button from '@/components/elements/Button'

const COLORS = ['#f47a3a', '#2f6fed', '#1f9d6b', '#b23a8f', '#d99a00', '#0e8c8c', '#8a5cf6', '#555']
const ROWS = 9
const TOP = 46
const BOTTOM = 286
const HEIGHT = 340

type Rung = { row: number; col: number } // col과 col+1 사이의 가로줄

// 가로줄을 무작위로 놓습니다. 같은 높이에서 옆 칸과 이어지지 않게 하고, 모든 칸에 최소 하나는 있게 합니다.
const makeRungs = (cols: number): Rung[] => {
  const rungs: Rung[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const taken = rungs.some((r) => r.row === row && r.col === col - 1)
      if (!taken && Math.random() < 0.42) rungs.push({ row, col })
    }
  }
  for (let col = 0; col < cols - 1; col++) {
    if (!rungs.some((r) => r.col === col)) {
      const free = Array.from({ length: ROWS }, (_, row) => row).filter(
        (row) => !rungs.some((r) => r.row === row && Math.abs(r.col - col) === 1)
      )
      rungs.push({ row: free[Math.floor(Math.random() * free.length)] ?? 0, col })
    }
  }
  return rungs
}

interface Props {
  members: string[]
}

// 사다리 타기: 이름을 누르면 선이 사다리를 타고 내려가 결과에 도착합니다.
const Ladder = ({ members }: Props) => {
  const cols = members.length
  const [seed, setSeed] = useState(0)
  const [started, setStarted] = useState<number[]>([]) // 출발한 사람(열 번호)
  const [arrived, setArrived] = useState<number[]>([])

  const { rungs, payCol } = useMemo(
    () => ({ rungs: makeRungs(cols), payCol: Math.floor(Math.random() * cols) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cols, seed, members.join(',')]
  )

  const width = Math.max(320, cols * 64)
  const x = (col: number) => (width / cols) * (col + 0.5)
  const y = (row: number) => TOP + ((BOTTOM - TOP) / (ROWS + 1)) * (row + 1)

  // 한 사람의 이동 경로와 도착 칸
  const trace = (start: number) => {
    let col = start
    const points: [number, number][] = [[x(col), TOP]]
    for (let row = 0; row < ROWS; row++) {
      const right = rungs.some((r) => r.row === row && r.col === col)
      const left = rungs.some((r) => r.row === row && r.col === col - 1)
      if (right || left) {
        points.push([x(col), y(row)])
        col += right ? 1 : -1
        points.push([x(col), y(row)])
      }
    }
    points.push([x(col), BOTTOM])
    const length = points.slice(1).reduce((sum, p, i) => sum + Math.abs(p[0] - points[i][0]) + Math.abs(p[1] - points[i][1]), 0)
    return { points, end: col, length }
  }

  const go = (col: number) => {
    if (started.includes(col)) return
    setStarted((prev) => [...prev, col])
    setTimeout(() => setArrived((prev) => [...prev, col]), 2300)
  }

  const reset = () => {
    setStarted([])
    setArrived([])
    setSeed((s) => s + 1)
  }

  const traces = members.map((_, col) => trace(col))
  const payer = traces.findIndex((t) => t.end === payCol)
  const revealed = (endCol: number) => traces.some((t, col) => t.end === endCol && arrived.includes(col))
  const done = arrived.includes(payer)

  return (
    <div>
      <p className='text-label2 text-customs-gray-50 mb-2'>이름을 누르면 사다리를 타고 내려갑니다.</p>
      <div className='overflow-x-auto -mx-2'>
        <svg viewBox={`0 0 ${width} ${HEIGHT}`} style={{ width: '100%', minWidth: cols > 5 ? width : undefined }}>
          {/* 세로줄과 가로줄 */}
          {members.map((_, col) => (
            <line key={col} x1={x(col)} y1={TOP} x2={x(col)} y2={BOTTOM} stroke='#bebbc3' strokeWidth='4' strokeLinecap='round' />
          ))}
          {rungs.map((r, i) => (
            <line key={i} x1={x(r.col)} y1={y(r.row)} x2={x(r.col + 1)} y2={y(r.row)} stroke='#bebbc3' strokeWidth='4' strokeLinecap='round' />
          ))}

          {/* 내려가는 선 */}
          {started.map((col) => {
            const t = traces[col]
            return (
              <polyline
                key={`${seed}-${col}`}
                points={t.points.map((p) => p.join(',')).join(' ')}
                fill='none'
                stroke={COLORS[col % COLORS.length]}
                strokeWidth='6'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeDasharray={t.length}
                strokeDashoffset={t.length}
              >
                <animate attributeName='stroke-dashoffset' from={t.length} to='0' dur='2.2s' fill='freeze' />
              </polyline>
            )
          })}

          {/* 위: 이름 */}
          {members.map((name, col) => (
            <g key={name} onClick={() => go(col)} style={{ cursor: 'pointer' }}>
              <rect x={x(col) - 28} y={6} width={56} height={30} rx={15} fill={started.includes(col) ? COLORS[col % COLORS.length] : '#19181b'} />
              <text x={x(col)} y={26} textAnchor='middle' fontSize='13' fontWeight='600' fill='#fff'>
                {name.length > 3 ? name.slice(0, 3) : name}
              </text>
            </g>
          ))}

          {/* 아래: 결과 (도착해야 공개) */}
          {members.map((_, col) => (
            <g key={col}>
              <rect x={x(col) - 28} y={BOTTOM + 10} width={56} height={30} rx={8} fill={revealed(col) ? (col === payCol ? '#f47a3a' : '#f2f1f3') : '#e5e4e7'} />
              <text x={x(col)} y={BOTTOM + 30} textAnchor='middle' fontSize='13' fontWeight='700' fill={revealed(col) && col === payCol ? '#fff' : '#3e3c44'}>
                {revealed(col) ? (col === payCol ? '결제' : '통과') : '?'}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {done && (
        <div className='rounded-[14px] bg-customs-orange-95-bg px-5 py-4 mt-3 pop-in'>
          <div className='text-label2 text-customs-gray-25'>오늘의 결제자</div>
          <div className='font-paperlogy font-bold text-[26px] text-customs-orange-50'>{members[payer]} 님</div>
        </div>
      )}

      <div className='flex gap-[10px] mt-4'>
        <Button type='secondary' onClick={reset}>
          사다리 새로 그리기
        </Button>
        <Button type='primary' onClick={() => members.forEach((_, col) => go(col))} disabled={started.length === cols}>
          전부 출발
        </Button>
      </div>
    </div>
  )
}

export default Ladder
