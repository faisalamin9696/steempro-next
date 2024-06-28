import { NextResponse } from "next/server";
import db from "@/app/config/db";
import { getServerSession } from "next-auth";
import { GET as authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session: any = await getServerSession(authOptions);
  try {
    const query = "SELECT * from posts WHERE username = ? ORDER BY time DESC";
    const result = await db.executeQuery(query, [session?.user?.name]);
    console.log("Query result:", result ? result : []);
    return NextResponse.json(result ? result : []);
  } catch (error) {
    console.log("Failed to execute query", error);
    NextResponse.error();
  } finally {
    await db.closeConnection();
  }
}
