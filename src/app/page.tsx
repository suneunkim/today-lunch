export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 text-lg '>
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start  '>
        <div className=''>프리텐다드 레귤러</div>
        <div className='font-paperlogy'>페이퍼로지 레귤러</div>
        <div className='font-paperlogy font-semibold'>페이퍼로지 세미볼드</div>
        <div className='font-paperlogy font-bold'>페이퍼로지 볼드</div>
      </main>
    </div>
  )
}
