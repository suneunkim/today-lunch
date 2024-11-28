import CheckBox from '@/components/elements/CheckBox'
import { initialSuggestionsType } from './MenuSuggestionForm'

interface Props {
  menu: initialSuggestionsType
  i: number
  isSelected: boolean
  onSelect: (name: string) => void
}

const SuggestionItem = ({ menu, i, isSelected, onSelect }: Props) => {
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
    </div>
  )
}

export default SuggestionItem
