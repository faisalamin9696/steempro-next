import { NextRequest, NextResponse } from "next/server";
import db from "@/libs/mysql/db";
import { supabase } from "@/libs/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await supabase.auth.getUser(body?.jwt);

    if (!user.data.user?.is_anonymous) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, statusText: "Unauthorized Access" }
      );
    }
    const query = `INSERT IGNORE INTO ${process.env.MYSQL_VIEWS_TABLE} (authPerm, uid) VALUES (?, ?)`;

    const result = await db.executeQuery(process.env.MYSQL_DB_DATABASE_2, query, [
      body.authPerm,
      user.data.user.id,
    ]);
    if (!!result?.["affectedRows"]) return NextResponse.json({ ...result });
    else return NextResponse.error();
  } catch (error) {
    return NextResponse.error();
  }
}
