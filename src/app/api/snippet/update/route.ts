import { NextResponse } from "next/server";
import { verifyMessage } from "@/libs/steem/condenser";
import { getAccountExt } from "@/libs/steem/sds";
import { Signature } from "@hiveio/dhive";
import { executeQuery } from "@/libs/mysql/db";
import moment from "moment";

export async function POST(req: Request) {
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

    // Construct the SQL query
    const query = `
      UPDATE ${process.env.MYSQL_SNIPPET_TABLE}
      SET title = ?, body = ?, modified = ?
      WHERE username = ? AND id = ?
    `;

    // Execute the query
    const result = await executeQuery(process.env.MYSQL_DB_DATABASE_2, query, [
      body.title,
      body.body,
      moment().format(),
      body.username,
      body.id,
    ]);
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
