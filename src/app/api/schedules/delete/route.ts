import { NextRequest, NextResponse } from "next/server";
import db from "@/app/config/db";
import { getServerSession } from "next-auth/next";
import { GET as authOptions } from "../../auth/[...nextauth]/route";

// Define the POST handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session: any = await getServerSession({ req, ...authOptions });

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
