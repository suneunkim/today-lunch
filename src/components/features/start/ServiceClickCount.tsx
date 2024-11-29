const ServiceClickCount = ({ count }: { count: number }) => {
  return (
    <div className='p-[10px] z-10 bg-customs-gray-10 bg-opacity-30 flex items-center gap-[6px] rounded-[100px]'>
      <span>
        <svg
          width='16'
          height='16'
          viewBox='0 0 16 16'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M14 14v-1.555a3.17 3.17 0 0 0-.879-2.2A2.947 2.947 0 0 0 11 9.334H5c-.796 0-1.559.327-2.121.91a3.17 3.17 0 0 0-.879 2.2V14M8.333 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
            fill='#F2F1F3'
          />
        </svg>
      </span>
      <span className='text-label1 text-customs-gray-95'>{count.toLocaleString('ko-KR')}</span>
    </div>
  )
}

export default ServiceClickCount
