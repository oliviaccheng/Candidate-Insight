export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const res = await fetch(
    `http://127.0.0.1:5000/search?q=${encodeURIComponent(q)}`,
    { cache: "no-store" }
  );

  const text = await res.text();

  return new Response(text, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}