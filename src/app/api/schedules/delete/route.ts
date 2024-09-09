import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "@/libs/steem/condenser";
import { Signature } from "@hiveio/dhive";
import { getAuthorExt } from "@/libs/steem/sds";
import { executeQuery } from "@/libs/mysql/db";

// Define the POST handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bufferObj = body.hash;
    const account = await getAuthorExt(body.username);
    const pubKey = account?.posting_key_auths?.[0]?.[0];

    const isValid = verifyMessage(
      pubKey,
      Buffer.from(bufferObj?.data),
      Signature.fromString(body.signature)
    );

    if (!isValid) {
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
