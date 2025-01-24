import Script from 'next/script';

export default function AdComponent() {
  return (
    <>
      <Script
        id="adsbygoogle"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7791415629101587"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7791415629101587"
        data-ad-slot="4045913601"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id="ad-init">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </>
  );
}
