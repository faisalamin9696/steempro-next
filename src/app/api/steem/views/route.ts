import { NextRequest, NextResponse } from "next/server";
import db from "@/libs/mysql/db";
import { validateHost } from "@/libs/utils/helper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const host = req.headers.get("host");

    if (!validateHost(host)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, statusText: "Unauthorized Access" }
      );
    }

    const query = `SELECT COUNT(*) AS views FROM ${process.env.MYSQL_VIEWS_TABLE} WHERE authPerm = ?`;
    const [result] = await db.executeQuery(process.env.MYSQL_DB_DATABASE_2, query, [body.authPerm]);

    return NextResponse.json(result ? result?.views || 0 : 0);
  } catch (error) {
    console.error("Failed to execute query", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
