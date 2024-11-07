import Script from 'next/script'

const GoogleAnalytics = ({ gaId }: { gaId: string }) => {
  return (
    <>
      <Script async src='https://www.googletagmanager.com/gtag/js?id=G-ZH51XEQZ0F' />
      <Script
        id='google-analytics'
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');`,
        }}
      />
    </>
  )
}

export default GoogleAnalytics
