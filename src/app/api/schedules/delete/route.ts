import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "@/libs/steem/condenser";
import { Signature } from "@steempro/dsteem";
import { getAccountExt } from "@/libs/steem/sds";
import { executeQuery } from "@/libs/mysql/db";

// Define the POST handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bufferObj = body.hash;
    const account = await getAccountExt(body.username);
    const postingPubKey = account?.posting_key_auths?.[0]?.[0];
    const activePubKey = account?.active_key_auths?.[0]?.[0];

    // check if signed with posting key
    const isValidPosting = verifyMessage(
      postingPubKey,
      Buffer.from(bufferObj?.data),
      Signature.fromString(body.signature)
    );

    // check if signed with active key
    const isValidActive = verifyMessage(
      activePubKey,
      Buffer.from(bufferObj?.data),
      Signature.fromString(body.signature)
    );

    if (!isValidPosting && !isValidActive) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, statusText: "Unauthorized Access" }
      );
    }

    const query = `DELETE FROM ${process.env.MYSQL_SCHEDULES_TABLE} WHERE username = ? and id = ?`;
    const result = await executeQuery(process.env.MYSQL_DB_DATABASE, query, [
      body.username,
      body.id,
    ]);

    if (result?.affectedRows) {
      return NextResponse.json({ ...result });
    } else {
      return NextResponse.json(
        { error: "Post not found or not deleted" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
