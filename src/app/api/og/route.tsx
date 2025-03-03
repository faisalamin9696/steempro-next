/* eslink-disable @next/next/no-img-element */
/* eslink-disable jsx-ally/alt-text */
// @ts-nocheck */

import { ImageResponse } from "next/og";
export const runtime = "edge";

export async function GET() {
  try {
    const imageData = await fetch(new URL("../../../assets/og.jpg", import.meta.url)).then(
      (res) => res.arrayBuffer()
    );

    return new ImageResponse(<img src={imageData}  />);
  } catch (error) {}
}
