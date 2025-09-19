import { Html, Head, Main, NextScript } from 'next/document';
import type { ReactElement } from 'react';

export default function Document(): ReactElement {
  return (
    <Html lang="en">
      <Head>
        <link rel="Shortcut Icon" href="logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
