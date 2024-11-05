import { basicIcons } from '@/app/assets/basicIcons'

const BasicIcon = ({ name }: { name: keyof typeof basicIcons }) => {
  return basicIcons[name] || null
}

export default BasicIcon
