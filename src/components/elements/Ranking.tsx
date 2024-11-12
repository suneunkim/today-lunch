interface Props {
  children: React.ReactNode
  isFirst: boolean
}
const Ranking = ({ children, isFirst }: Props) => {
  const baseStyles =
    'min-w-[32px] h-[32px] flex items-center justify-center rounded-[100px] font-paperlogy text-caption2'
  const styles = {
    firstCircle: 'text-customs-gray-95 bg-customs-gray-10 ',
    secondary: 'text-customs-gray-25 bg-customs-gray-95',
  }

  const classNames = `
  ${baseStyles}
  ${isFirst ? styles.firstCircle : styles.secondary}
  `

  return <div className={classNames}>{children}</div>
}

export default Ranking
