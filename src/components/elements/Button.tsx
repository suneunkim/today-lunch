type ButtonType = keyof typeof styles

interface Props {
  type: ButtonType
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
  [key: string]: unknown
}

const baseStyles = 'py-5 w-full text-body1Reading rounded-[20px]'

const styles = {
  primary: `${baseStyles} bg-customs-gray-10 text-customs-gray-100 hover:bg-[#323036]`,
  'primary-disabled': `${baseStyles} bg-customs-gray-90 text-customs-gray-75 hover:bg-customs-gray-90`,
  secondary: `${baseStyles} bg-customs-gray-100 border border-customs-gray-95 hover:bg-customs-gray-95 hover:text-customs-gray-25`,
  // 흰 배경의 작은 보조 버튼 (공유, 그만 추천받기 등)
  sub: 'w-full py-3 px-2 rounded-[14px] bg-customs-gray-100 border border-customs-gray-90 text-label1 text-customs-gray-10',
  ghost: 'w-full py-[10px] text-customs-gray-10 text-label1 hover:text-customs-gray-25',
}

const Button = ({ type, children, disabled = false, onClick, className, ...props }: Props) => {
  const classNames = `
  ${styles[type]}
  ${disabled && styles['primary-disabled']}
  ${className}
  `
  return (
    <button onClick={onClick} className={classNames} {...props}>
      {children}
    </button>
  )
}

export default Button
