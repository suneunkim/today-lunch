import { menu } from '@/app/data/data'
import OutlinedButton from './elements/OutlinedButton'

interface Props {
  selectedMenu: any
  handleClick: (menu: string) => void
}

const MenuSelection = ({ selectedMenu, handleClick }: Props) => {
  return (
    <section className='flex flex-col gap-1'>
      <OutlinedButton
        onClick={() => handleClick('전체')}
        selected={selectedMenu === '전체'}
        all={true}
        type={selectedMenu === '전체' ? 'selected' : 'outlined'}
      />
      {menu.map((row, rowIndex) => (
        <div key={rowIndex} className='flex gap-1'>
          {row.map((category, index) => (
            <OutlinedButton
              onClick={() => handleClick(category)}
              selected={selectedMenu === category}
              key={index}
              type={selectedMenu === category ? 'selected' : 'outlined'}
              name={category}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

export default MenuSelection
