import Container from '@/components/Container'

const page = () => {
  const styles = {
    title: 'text-customs-orange-50 text-headline2',
    subtitle: 'text-body1Reading text-customs-gray-10 mt-3 mb-2',
    p: 'text-customs-gray-50 text-caption1',
  }
  return (
    <Container title='오픈소스 라이센스'>
      <div className='bg-customs-gray-95 p-5 flex flex-col gap-5 pb-[100px]'>
        <div className='bg-customs-gray-100 p-[28px] rounded-[20px] flex flex-col gap-10 break-words'>
          <div>
            <h4 className={styles.title}>ICON</h4>
            <h5 className={styles.subtitle}>토스페이스</h5>
            <p className={styles.p}>https://toss.im/tossface</p>
          </div>
          <div>
            <h4 className={styles.title}>PATTREN</h4>
            <h5 className={styles.subtitle}>20 seamless patterns & textures by Simon Fairhurst</h5>
            <p className={styles.p}>
              https://www.figma.com/community/file/1184852075345917340/20-seamless-patterns-textures-in-figma
            </p>
          </div>
          <div>
            <h4 className={styles.title}>NOTICE</h4>
            <h5 className={styles.subtitle}>
              이 웹 애플리케이션에는 다음 오픈소스 소프트웨어가 사용되었습니다.
            </h5>
            <p className={styles.p}>Firebase - © Google LLC</p>
            <p className={styles.p}>Google APIs - © Google LLC</p>
            <p className={styles.p}>TypeScript - © Microsoft Corporation</p>
            <p className={styles.p}>Licensed under the Apache License, Version 2.0.</p>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default page
