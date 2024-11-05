import { icons } from '@/app/assets/icons'

const EmojiIcon = ({ name }: { name: keyof typeof icons }) => {
  return icons[name] || null
}

export default EmojiIcon
