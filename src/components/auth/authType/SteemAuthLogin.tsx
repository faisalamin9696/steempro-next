import { QRCode } from "@/components/QrCode";
import React from "react";
// import { v4 as uuidv4 } from 'uuid';

function SteemAuthLogin() {



  return (
    <div>
      <QRCode
        size="lg"
        value="https://www.steempro.com/"
        options={{
          image: "/logo192.png",
          imageOptions: { imageSize: 0.5, margin: 2 },
          dotsOptions: { color: "#53389e" },
          cornersSquareOptions: { color: "#53389e" },
          cornersDotOptions: { color: "#53389e" },
        }}
      />
    </div>
  );
}

export default SteemAuthLogin;
