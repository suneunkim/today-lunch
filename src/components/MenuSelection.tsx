import { menu } from '@/app/data/data'
import OutlinedButton from './elements/OutlinedButton'

interface Props {
  selectedMenu: string[]
  handleClick: (menu: string) => void
}

const MenuSelection = ({ selectedMenu, handleClick }: Props) => {
  const isAllSelected = selectedMenu.includes('전체')

  return (
    <section className='flex flex-col gap-1'>
      <OutlinedButton
        onClick={() => handleClick('전체')}
        all={true}
        type={isAllSelected ? 'selected' : 'outlined'}
      />
      {menu.map((row, rowIndex) => (
        <div key={rowIndex} className='flex gap-1'>
          {row.map((category, index) => (
            <OutlinedButton
              onClick={() => handleClick(category)}
              key={index}
              type={selectedMenu.includes(category) ? 'selected' : 'outlined'}
              name={category}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

export default MenuSelection
