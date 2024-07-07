import Script from "next/script";
import React from "react";

interface Props {
  pId: string;
}

export default function AdSense(props: Props) {
  const { pId } = props;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
