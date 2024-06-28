import { NextResponse } from "next/server";
import db from "@/app/config/db";
import { getServerSession } from "next-auth";
import { GET as authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();

    // Get the server session
    const session: any = await getServerSession({ req, ...authOptions });

    // Check if the session is valid
    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Construct the SQL query
    const query = `
      UPDATE posts
      SET time = ?, status = 0
      WHERE username = ? AND id = ? AND status <> 1
    `;

    // Execute the query
    const result = await db.executeQuery(query, [
      body.time,
      session.user.name,
      body.id,
    ]);

    console.log("Query result:", result);

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
    console.error("Failed to execute query", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await db.closeConnection();
  }
}
