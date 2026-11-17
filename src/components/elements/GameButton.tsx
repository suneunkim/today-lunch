interface Props {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

// 미니게임 공통의 눌리는 주황 버튼
const GameButton = ({ onClick, disabled = false, children }: Props) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-full font-paperlogy font-bold text-[18px] ${
        disabled
          ? 'bg-customs-gray-90 text-customs-gray-75'
          : 'bg-customs-orange-50 text-customs-gray-100 shadow-[0_6px_0_#c2531b] active:translate-y-[4px] active:shadow-[0_2px_0_#c2531b]'
      }`}
    >
      {children}
    </button>
  )
}

export default GameButton
