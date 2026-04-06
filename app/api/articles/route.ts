import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const dbPath = path.join(
      process.cwd(),
      "web_scrape",
      "legiscan_cache",
      "legiscan.db"
    );

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    const articles = await db.all(
      `
      SELECT id, people_id, title, url, date, excerpt, source, fetched_at
      FROM candidate_articles
      WHERE title LIKE ? OR excerpt LIKE ? OR source LIKE ?
      ORDER BY date DESC
      LIMIT 50
      `,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    await db.close();

    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Article search error:", err);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}