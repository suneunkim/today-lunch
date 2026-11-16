'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/Container'
import Button from '@/components/elements/Button'
import Chip from '@/components/elements/Chip'
import DocTitle from '@/components/elements/DocTitle'
import TextBubble from '@/components/elements/TextBubble'
import { lunchTypeOf } from '@/lib/lunchType'
import { Prefs, savePrefs } from '@/lib/storage'
import { MenuTag } from '@/types/types'

type Answers = Pick<Prefs, 'spicy' | 'base' | 'volume'>

const QUESTIONS: {
  key: keyof Answers
  ask: string
  options: { value: string; label: string; sub: string }[]
}[] = [
  {
    key: 'spicy',
    ask: '약속 장소가 매운 떡볶이집으로 잡혔습니다. 어떠십니까?',
    options: [
      { value: 'love', label: '오히려 좋아', sub: '매운 건 언제나 환영' },
      { value: 'ok', label: '먹을 수는 있지', sub: '적당히 매운 정도면 괜찮아요' },
      { value: 'no', label: '저는 계란찜만…', sub: '매운 음식은 못 먹어요' },
    ],
  },
  {
    key: 'base',
    ask: '오전 내내 정신없이 바빴습니다. 지금 가장 끌리는 건?',
    options: [
      { value: '국물', label: '뜨끈한 국물', sub: '뚝배기에 밥 말아서' },
      { value: '밥', label: '든든한 밥', sub: '반찬 놓고 제대로 한 끼' },
      { value: '면', label: '후루룩 면', sub: '빠르게 한 그릇' },
    ],
  },
  {
    key: 'volume',
    ask: '오후에 중요한 일정이 있습니다. 점심은?',
    options: [
      { value: '든든', label: '든든하게 먹어야 힘이 나지', sub: '밥심으로 버팁니다' },
      { value: '가벼운', label: '졸리면 안 되니 가볍게', sub: '식곤증은 사절' },
    ],
  },
]

const AVOID_OPTIONS: { tag: MenuTag; label: string }[] = [
  { tag: '해산물', label: '해산물' },
  { tag: '내장', label: '내장·선지·순대' },
  { tag: '향신료', label: '고수·마라 같은 향신료' },
]

const optionStyle =
  'w-full text-left px-5 py-4 rounded-[14px] border border-customs-gray-90 bg-customs-gray-100 active:bg-customs-orange-95-bg'

// 첫 실행 취향 조사: 심리테스트처럼 몇 가지만 고르면 추천에 반영됩니다. 건너뛰어도 됩니다.
const Page = () => {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({ spicy: 'ok', base: null, volume: null })
  const [avoid, setAvoid] = useState<MenuTag[]>([])

  const finish = (save: boolean) => {
    if (save) {
      savePrefs({ ...answers, avoid, onboarded: true, typeName: lunchTypeOf(answers).name })
    } else {
      savePrefs({ onboarded: true })
    }
    router.replace('/home')
  }

  const answer = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setStep((prev) => prev + 1)
  }

  const question = QUESTIONS[step]
  const isAvoidStep = step === QUESTIONS.length
  const isResult = step === QUESTIONS.length + 1
  const type = lunchTypeOf(answers)

  return (
    <Container title='취향 조사' onlyTitle={true} nav={false}>
      <div className='bg-customs-beige-85 p-5 min-h-[calc(100vh-48px)] flex flex-col gap-5'>
        <section className='rounded-[20px] bg-customs-gray-100 px-5 pt-5 pb-4 flex justify-between items-end'>
          <div>
            <TextBubble
              bubbleTail={false}
              color='gray'
              text={isResult ? '분석이 끝났습니다.' : '처음 뵙겠습니다!'}
            />
            <TextBubble
              bubbleTail={true}
              color='gray'
              text={isResult ? '결과 보고드립니다.' : '취향 조사 부탁드립니다.'}
            />
          </div>
          <img className='w-[110px] h-[80px] object-contain' src='/mukdaeri.png' alt='먹대리' />
        </section>

        {question && (
          <section className='px-6 py-7 bg-customs-gray-100 rounded-[20px]'>
            <p className='text-caption2 font-paperlogy text-customs-orange-50 mb-2'>
              질문 {step + 1} / {QUESTIONS.length + 1}
            </p>
            <h2 className='text-heading3 font-paperlogy text-customs-gray-10 mb-5'>{question.ask}</h2>
            <div className='flex flex-col gap-[10px]'>
              {question.options.map((option) => (
                <button
                  key={option.value}
                  className={optionStyle}
                  onClick={() => answer(question.key, option.value)}
                >
                  <div className='text-body1Normal text-customs-gray-10'>{option.label}</div>
                  <div className='text-caption1 text-customs-gray-50 mt-1'>{option.sub}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {isAvoidStep && (
          <section className='px-6 py-7 bg-customs-gray-100 rounded-[20px]'>
            <p className='text-caption2 font-paperlogy text-customs-orange-50 mb-2'>
              질문 {step + 1} / {QUESTIONS.length + 1}
            </p>
            <h2 className='text-heading3 font-paperlogy text-customs-gray-10 mb-2'>
              마지막으로, 못 먹는 것이 있다면 체크해 주세요.
            </h2>
            <p className='text-label2 text-customs-gray-50 mb-5'>체크한 재료가 들어간 메뉴는 제안하지 않겠습니다.</p>
            <div className='flex flex-wrap gap-2 mb-6'>
              {AVOID_OPTIONS.map((option) => (
                <Chip
                  key={option.tag}
                  selected={avoid.includes(option.tag)}
                  onClick={() =>
                    setAvoid((prev) =>
                      prev.includes(option.tag)
                        ? prev.filter((t) => t !== option.tag)
                        : [...prev, option.tag]
                    )
                  }
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            <Button type='primary' onClick={() => setStep((prev) => prev + 1)}>
              {avoid.length === 0 ? '다 잘 먹습니다' : '제출하기'}
            </Button>
          </section>
        )}

        {isResult && (
          <section className='px-6 py-7 bg-customs-gray-100 rounded-[20px] pop-in'>
            <DocTitle>점심 유형 분석 보고</DocTitle>
            <p className='text-label2 text-customs-gray-50 mt-6'>귀하의 점심 유형은</p>
            <h2 className='text-[24px] leading-[130%] font-bold font-paperlogy text-customs-orange-50 mt-1'>
              {type.name}
            </h2>
            <p className='text-body2 text-customs-gray-25 mt-3 mb-6'>{type.desc}</p>
            <Button type='primary' onClick={() => finish(true)}>
              이 취향으로 제안받기
            </Button>
          </section>
        )}

        {!isResult && (
          <div className='mt-auto pt-4'>
            <Button type='primary' onClick={() => finish(false)}>
              건너뛰기
            </Button>
            <p className='text-caption1 text-customs-gray-50 text-center mt-2'>
              나중에 설정에서 언제든 다시 할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </Container>
  )
}

export default Page
