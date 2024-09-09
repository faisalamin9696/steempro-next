import { NextRequest, NextResponse } from "next/server";
import { validateHost } from "@/libs/utils/helper";
import { executeQuery } from "@/libs/mysql/db";

export async function POST(req: NextRequest) {
  const host = req.headers.get("host");

  if (!validateHost(host)) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, statusText: "Unauthorized Access" }
    );
  }

  try {
    const query =
      `SELECT p.*, (SELECT COUNT(*) FROM ${process.env.MYSQL_VIEWS_TABLE} WHERE authPerm = p.authPerm) AS views ` +
      `FROM ${process.env.MYSQL_PROMOTIONS_TABLE} p ` +
      "ORDER BY p.id";
    const result = await executeQuery(
      process.env.MYSQL_DB_DATABASE_2,
      query
    );

    return NextResponse.json(result ? result : []);
  } catch (error) {
    console.error("Failed to execute query", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
