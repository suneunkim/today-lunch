type ButtonType = keyof typeof styles

interface Props {
  type: ButtonType
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
  [key: string]: any
}

const baseStyles = 'py-5 w-full text-body1Reading rounded-[20px]'

const styles = {
  primary: `${baseStyles} bg-customs-gray-10 text-customs-gray-100  hover:bg-[#323036]`,
  'primary-disabled': `${baseStyles} bg-customs-gray-25 text-customs-gray-75`,
  secondary: `${baseStyles} bg-customs-gray-100 border border-customs-gray-95 hover:bg-customs-gray-95 hover:text-customs-gray-25`,
  ghost: 'w-full py-[10px] text-customs-gray-10 text-label1 hover:text-customs-orange-95-bg',
}

const Button = ({ type, children, disabled = false, onClick, className, ...props }: Props) => {
  const classNames = `
  ${styles[type]}
  ${disabled && styles['primary-disabled']}
  ${className}
  `
  return (
    <button onClick={onClick} className={classNames}>
      {children}
    </button>
  )
}

export default Button
