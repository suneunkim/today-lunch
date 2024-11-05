import { icons } from '@/app/assets/icons'
import EmojiIcon from './EmojiIcon'

type ButtonType = keyof typeof styles

interface Props {
  type: ButtonType
  all?: boolean
  selected?: boolean
  name: keyof typeof icons
  onClick?: () => void
}

const baseStyles =
  'w-full h-[56px] text-customs-gray-10 text-label3 border flex justify-center items-center gap-[6px] rounded-md'

const styles = {
  outlined: 'border-customs-gray-90',
  selected: 'border-customs-orange-50 bg-customs-orange-95-bg border-2',
}

const OutlinedButton = ({ all, type, selected, name, onClick }: Props) => {
  const classNames = `
  ${baseStyles}
  ${styles[type]}
  ${selected && styles.selected}
  `
  return (
    <button onClick={onClick} className={classNames}>
      {!all && <EmojiIcon name={name} />}
      {all ? '전체' : name}
    </button>
  )
}

export default OutlinedButton
