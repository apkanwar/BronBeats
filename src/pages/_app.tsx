import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { AuthProvider } from '@/context/AuthContext';
import { RemixDataProvider } from '@/context/RemixDataContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <RemixDataProvider>
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
      </RemixDataProvider>
    </AuthProvider>
  );
}
