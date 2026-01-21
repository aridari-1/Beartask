import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="application-name" content="BearTask" />
        <meta name="theme-color" content="#312E81" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
