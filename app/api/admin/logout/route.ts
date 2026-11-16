
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Origem inválida." }, { status: 403 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": "ea_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
    }
  });
}
