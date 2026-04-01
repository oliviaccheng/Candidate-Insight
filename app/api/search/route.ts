import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q) return new Response(JSON.stringify([]), { status: 200 });

  try {
    const db = await open({
      filename: "legiscan_cache/legiscan.db",
      driver: sqlite3.Database,
    });

    const candidates = await db.all(
      `SELECT name, party, state_id, district
       FROM candidates
       WHERE name LIKE ? 
       LIMIT 50`,
      [`%${q}%`]
    );

    await db.close();

    return new Response(JSON.stringify(candidates), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify([]), { status: 500 });
  }
}