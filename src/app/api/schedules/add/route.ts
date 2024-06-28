import { NextResponse } from "next/server";
import db from "@/app/config/db";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const session = await getServerSession();
  try {
    const query =
      "INSERT INTO posts" +
      "(username, title, body, tags, parent_permlink, options, time, status) " +
      "VALUES (? ,?, ?, ?, ?, ?, ?, ?)";

    const result = await db.executeQuery(query, [
      session?.user?.name,
      body.title,
      body.body,
      body.tags,
      body.parent_permlink,
      body.options,
      body.time,
      0,
    ]);
    console.log("Query result:", result);
    if (!!result?.["affectedRows"]) return NextResponse.json({ ...result });
    else return NextResponse.error();
  } catch (error) {
    console.log("Failed to execute query", error);
    return NextResponse.error();
  } finally {
    await db.closeConnection();
  }
}
