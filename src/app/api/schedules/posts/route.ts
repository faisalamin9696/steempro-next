import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { executeQuery } from "@/libs/mysql/db";

export async function GET() {
  try {
    const session: any = await auth();

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = `SELECT * FROM ${process.env.MYSQL_SCHEDULES_TABLE} WHERE username = ? ORDER BY time DESC`;
    const result = await executeQuery(process.env.MYSQL_DB_DATABASE, query, [
      session.user.name,
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
