import { NextRequest, NextResponse } from "next/server";
import { getAccountExt } from "@/libs/steem/sds";
import { verifyMessage } from "@/libs/steem/condenser";
import { Signature } from "@hiveio/dhive";
import { executeQuery } from "@/libs/mysql/db";

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
    const query =
      `INSERT INTO ${process.env.MYSQL_SCHEDULES_TABLE}` +
      "(username,title,body,tags,parent_permlink,options,time)" +
      "VALUES(?,?,?,?,?,?,?)";

    const result = await executeQuery(process.env.MYSQL_DB_DATABASE, query, [
      body.username,
      body.title,
      body.body,
      body.tags,
      body.parent_permlink,
      body.options,
      body.time,
    ]);
    if (!!result?.["affectedRows"]) return NextResponse.json({ ...result });
    else return NextResponse.error();
  } catch (error) {
    return NextResponse.error();
  }
}
