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
  'flex-1 basis-0 min-w-0 h-[56px] text-customs-gray-10 text-label3 border flex justify-center items-center gap-[6px] rounded-md bg-customs-gray-100'

const styles = {
  outlined: 'border-customs-gray-90',
  // 테두리 두께를 바꾸면 옆 칸이 밀리므로, 안쪽 그림자로 두껍게 보이게만 합니다.
  selected: 'border-customs-orange-50 bg-customs-orange-95-bg shadow-[inset_0_0_0_1px_#fe5f01]',
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
