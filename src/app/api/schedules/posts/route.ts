import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { executeQuery } from "@/libs/mysql/db";

export async function GET(request) {
  try {
    const session: any = await auth();

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")|| "0");
    const limit = parseInt(searchParams.get("limit") || "30") || 30;

    // Calculate offset
    const offset = page * limit;

    const query = `SELECT * FROM ${process.env.MYSQL_SCHEDULES_TABLE} WHERE username = ? ORDER BY time DESC LIMIT ? OFFSET ?`;
    const result = await executeQuery(process.env.MYSQL_DB_DATABASE, query, [
      session.user.name,
      limit,
      offset,
    ]);

    return NextResponse.json(result ? result : []);
  } catch (error) {
    console.error("Failed to execute query", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
