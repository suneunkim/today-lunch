// "오늘점심 제안서" 같은 문서 제목 줄
const DocTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className='w-full flex items-center justify-center border-t-2 border-b h-[53px] text-heading2 text-customs-gray-10 border-customs-gray-10'>
      {children}
    </h2>
  )
}

export default DocTitle
