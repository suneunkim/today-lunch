interface Props {
  isSelected: boolean
}

const CheckBox = ({ isSelected }: Props) => {
  return (
    <div>
      {isSelected ? (
        <svg
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect width='20' height='20' rx='4' fill='#19181B' />
          <path
            d='M5 9.57143L8.63636 13L15 7'
            stroke='white'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ) : (
        <svg
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect x='0.5' y='0.5' width='19' height='19' rx='3.5' fill='white' />
          <rect x='0.5' y='0.5' width='19' height='19' rx='3.5' stroke='#E5E4E7' />
        </svg>
      )}
    </div>
  )
}

export default CheckBox
