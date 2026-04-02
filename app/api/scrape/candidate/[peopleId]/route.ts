export async function GET(
  _req: Request,
  { params }: { params: Promise<{ peopleId: string }> }
) {
  const { peopleId } = await params;

  const res = await fetch(
    `http://127.0.0.1:5001/api/candidates/${peopleId}`,
    { cache: "no-store" }
  );

  const text = await res.text();

  return new Response(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}