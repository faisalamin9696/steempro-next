import { NextResponse } from "next/server";
import db from "@/libs/mysql/db";
import { verifyMessage } from "@/libs/steem/condenser";
import { getAuthorExt } from "@/libs/steem/sds";
import { Signature } from "@hiveio/dhive";

export async function POST(req: Request) {
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

    // Construct the SQL query
    const query = `
      UPDATE ${process.env.MYSQL_SCHEDULES_TABLE}
      SET time = ?, status = 0
      WHERE username = ? AND id = ? AND status <> 1
    `;

    // Execute the query
    const result = await db.executeQuery(
      query,
      [body.time, body.username, body.id],
      process.env.MYSQL_DB_DATABASE
    );
    // Check if any rows were affected
    if (result?.affectedRows) {
      return NextResponse.json({ ...result });
    } else {
      return NextResponse.json(
        { error: "No rows affected or post not found" },
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
