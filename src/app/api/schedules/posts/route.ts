import { NextResponse } from "next/server";
import db from "@/app/config/db";
import { getServerSession } from "next-auth";
import { GET as authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session: any = await getServerSession({ ...authOptions });

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = "SELECT * FROM posts WHERE username = ? ORDER BY time DESC";
    const result = await db.executeQuery(query, [session.user.name]);

    console.log("Query result:", result ? result : []);
    return NextResponse.json(result ? result : []);
  } catch (error) {
    console.error("Failed to execute query", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await db.closeConnection();
  }
}