import CheckBox from '@/components/elements/CheckBox'
import { MenuType } from '@/types/types'

interface Props {
  menu: MenuType
  i: number
  isSelected: boolean
  onSelect: (name: string) => void
  favorite?: string
}

const SHOWN_TAGS = ['매운', '가벼운', '든든', '혼밥', '가성비']

const SuggestionItem = ({ menu, i, isSelected, onSelect, favorite }: Props) => {
  const tags = menu.tags.filter((tag) => SHOWN_TAGS.includes(tag))
  return (
    <div>
      <div
        onClick={() => onSelect(menu.name)}
        className='flex items-center mt-6 gap-2 cursor-pointer'
      >
        <CheckBox isSelected={isSelected} />
        <h3 className='text-heading3 font-paperlogy'>{`${i + 1}안. ${menu.name}`}</h3>
      </div>
      <p className='text-label2 text-customs-gray-25 mt-2'>{menu.description}</p>
      {(tags.length > 0 || favorite) && (
        <p className='text-caption1 text-customs-gray-50 mt-1'>
          {tags.map((tag) => `#${tag}`).join(' ')}
          {favorite && <span className='text-customs-orange-50'> 📌 단골집: {favorite}</span>}
        </p>
      )}
    </div>
  )
}

export default SuggestionItem
