import { NextResponse } from "next/server";
import db from "@/app/config/db";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const session = await getServerSession();
  try {
    const query =
      "UPDATE posts " +
      "SET  time = ?, status = 0 " +
      "WHERE username = ? and id = ? and status <> 1";

    const result = await db.executeQuery(query, [
      body.time,
      session?.user?.name,
      body.id,
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
