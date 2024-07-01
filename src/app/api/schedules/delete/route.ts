import { NextRequest, NextResponse } from "next/server";
import db from "@/libs/mysql/db";
import { auth } from "@/auth";

// Define the POST handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session: any = await auth();

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = "DELETE FROM posts WHERE username = ? and id = ?";
    const result = await db.executeQuery(query, [session.user.name, body.id]);

    if (result?.affectedRows) {
      return NextResponse.json({ ...result });
    } else {
      return NextResponse.json(
        { error: "Post not found or not deleted" },
        { status: 404 }
      );
    }
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
