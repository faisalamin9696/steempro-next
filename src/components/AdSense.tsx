import React from "react";

interface Props {
  pId: string;
}

export default function AdSense(props: Props) {
  const { pId } = props;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
      crossOrigin="anonymous"
    ></script>
  );
}
