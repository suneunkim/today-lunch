import Link from 'next/link'

const Footer = () => {
  return (
    <footer className='bg-customs-gray-10 w-full h-[181px] text-customs-gray-100 p-[36px] flex flex-col justify-between'>
      <div className='flex flex-col gap-[7px]'>
        <h3 className='font-paperlogy text-headline3'>오늘 점심은 먹대리가 : 점심메뉴 고르기</h3>
        <p className='text-caption1'>© 2024 Brand All rights reserved.</p>
      </div>
      <ul className='flex gap-4 text-caption1'>
        <Link href='/project'>
          <li>프로젝트 팀 소개</li>
        </Link>
        <Link href='/licenses'>
          <li>소스 라이센스</li>
        </Link>
        <li>
          <a href='https://forms.gle/jsQ1tkDHeBaTcLpZ8' target='_blank' rel='noopener noreferrer'>
            의견 보내기
          </a>
        </li>
      </ul>
    </footer>
  )
}

export default Footer
