import Ranking from '@/components/elements/Ranking'

type ItemType = {
  name: string
  count: number
}
interface Props {
  items: ItemType[] | undefined
}

const BestMenuList = ({ items }: Props) => {
  const basic = 'text-label2 text-customs-gray-10'
  const styles = {
    first: 'font-bold',
  }

  return (
    <section className='px-[24px] py-[28px] my-8 bg-customs-gray-100 rounded-[20px]'>
      <div className=' '></div>
      <h4 className='text-headline2 text-customs-gray-10 mb-6'>지금까지 가장 많이 승인받은 메뉴</h4>
      <div className='flex flex-col gap-[10px]'>
        {items?.map((menu, i) => (
          <div key={i} className='flex items-center gap-4'>
            <Ranking isFirst={i === 0}>{i + 1}위</Ranking>
            <div className='flex w-full justify-between'>
              <p className={`${basic} ${i === 0 ? styles.first : ''}`}>{menu.name}</p>
              <div className={`${basic} ${i === 0 && styles.first}`}>{menu.count}번</div>
            </div>
          </div>
        ))}
        {items && items.length < 10 ? <div>현재 데이터를 집계 중입니다.</div> : ''}
      </div>
    </section>
  )
}

export default BestMenuList
