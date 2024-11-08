const Footer = () => {
  return (
    <footer className='bg-customs-gray-10 w-full h-[181px] text-customs-gray-100 p-[36px] flex flex-col justify-between'>
      <div className='flex flex-col gap-[7px]'>
        <h3 className='font-paperlogy text-headline3'>팀명 또는 서비스명</h3>
        <p className='text-caption1'>© 2024 Brand All rights reserved.</p>
      </div>
      <ul className='flex gap-4 text-caption1'>
        <li>프로젝트 팀 소개</li>
        <li>소스 라이센스</li>
        <li>의견 보내기</li>
      </ul>
    </footer>
  )
}

export default Footer
