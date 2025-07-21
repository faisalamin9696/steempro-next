import { NextRequest, NextResponse } from "next/server";
import { encryptPrivateKey } from "@/utils/encryption";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const crateData = body?.data;

    const encData = encryptPrivateKey(
      String(crateData?.value),
      process.env.MESSAGE_SECRET!
    );

    if (encData) return NextResponse.json({ encData });
    else return NextResponse.error();
  } catch (error) {
    return NextResponse.error();
  }
}
