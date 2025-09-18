import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main>
      <DefaultSeo
        title="BronBeats | The beats you see on IG"
        description="Rank your favorite Lebron James Remixes"
        openGraph={{
          type: 'website',
          locale: 'en',
          siteName: 'BronBeats',
          url: 'https://www.bronbeats.com/'
        }}
      />
      <Component {...pageProps} />
    </main>
  );
}
