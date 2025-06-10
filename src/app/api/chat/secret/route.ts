import { NextRequest, NextResponse } from "next/server";
import { encryptPrivateKey } from "@/utils/encryption";
import moment from "moment";

export async function POST(req: NextRequest) {
  try {

    const secret = encryptPrivateKey(
      moment().unix()?.toString(),
      process.env.MESSAGE_SECRET!
    );

    if (secret) return NextResponse.json({ secret });
    else return NextResponse.error();
  } catch (error) {
    return NextResponse.error();
  }
}
