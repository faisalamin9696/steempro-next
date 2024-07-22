import { NextResponse } from "next/server";
import db from "@/libs/mysql/db";

export async function GET() {
  try {
    const query = `SELECT * FROM ${process.env.MYSQL_ANNOUNCEMENTS_TABLE} ORDER BY id`;
    const result = await db.executeQuery(process.env.MYSQL_DB_DATABASE_2, query);

    return NextResponse.json(result ? result : []);
  } catch (error) {
    console.error("Failed to execute query", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } 
}
