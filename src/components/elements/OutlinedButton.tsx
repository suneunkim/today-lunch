import EmojiIcon from './EmojiIcon'
import { IconName } from '@/types/types'

type ButtonType = keyof typeof styles
interface PropsBase {
  type: ButtonType
  selected?: boolean
  onClick?: () => void
}

interface CategoryProps extends PropsBase {
  all: true
  name?: never
}
interface AllProps extends PropsBase {
  all?: false
  name: IconName
}

type Props = CategoryProps | AllProps

const baseStyles =
  'w-full h-[56px] text-customs-gray-10 text-label3 border flex justify-center items-center gap-[6px] rounded-md bg-customs-gray-100'

const styles = {
  outlined: 'border-customs-gray-90',
  selected: 'border-customs-orange-50 bg-customs-orange-95-bg border-2',
}

const OutlinedButton = ({ all = false, type, selected, name, onClick }: Props) => {
  const classNames = `
  ${baseStyles}
  ${styles[type]}
  ${selected && styles.selected}
  `
  return (
    <button onClick={onClick} className={classNames}>
      {!all && name && <EmojiIcon name={name} />}
      {all ? '전체' : name}
    </button>
  )
}

export default OutlinedButton
