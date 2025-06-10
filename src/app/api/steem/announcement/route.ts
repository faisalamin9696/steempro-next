import { NextRequest, NextResponse } from "next/server";
import { validateHost } from "@/utils/helper";
import { executeQuery } from "@/libs/mysql/db";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host");

    if (!validateHost(host)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, statusText: "Unauthorized Access" }
      );
    }

    const query = `SELECT * FROM ${process.env.MYSQL_ANNOUNCEMENTS_TABLE} ORDER BY id`;
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
