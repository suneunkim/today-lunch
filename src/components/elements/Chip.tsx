interface Props {
  selected?: boolean
  onClick?: () => void
  children: React.ReactNode
}

const Chip = ({ selected = false, onClick, children }: Props) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`px-[14px] py-2 rounded-[100px] text-label1 border ${
        selected
          ? 'border-customs-orange-50 bg-customs-orange-95-bg text-customs-orange-50'
          : 'border-customs-gray-90 bg-customs-gray-100 text-customs-gray-25'
      }`}
    >
      {children}
    </button>
  )
}

export default Chip
