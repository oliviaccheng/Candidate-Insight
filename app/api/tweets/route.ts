export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidate = searchParams.get("candidate") || "";

  const res = await fetch(
    `http://127.0.0.1:5000/tweets?candidate=${encodeURIComponent(candidate)}`,
    { cache: "no-store" }
  );

  const data = await res.json();
  return Response.json(data);
}