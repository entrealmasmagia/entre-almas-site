
import { env } from "cloudflare:workers";

const encoder = new TextEncoder();

export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin;

    if (request.headers.get("origin") !== origin) {
      return Response.json({ error: "Origem inválida." }, { status: 403 });
    }

    const limiter = (env as any).LOGIN_RATE_LIMIT;

    if (!limiter) {
      return Response.json(
        { error: "Proteção do login indisponível." },
        { status: 503 }
      );
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success } = await limiter.limit({ key: `admin-login:${ip}` });

    if (!success) {
      return Response.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const secret = env.ADMIN_SESSION_SECRET as string;
    const password = env.ADMIN_PASSWORD as string;

    if (!secret || !password || secret === password) {
      return Response.json(
        { error: "Login não configurado." },
        { status: 503 }
      );
    }

    const body = await request.json() as { password?: string };
    const supplied = body.password || "";

    if (supplied.length > 256) {
      return Response.json({ error: "Senha inválida." }, { status: 401 });
    }

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const digest = async (value: string) =>
      new Uint8Array(
        await crypto.subtle.sign("HMAC", key, encoder.encode(value))
      );

    const actual = await digest(supplied);
    const expected = await digest(password);

    let difference = 0;
    for (let i = 0; i < actual.length; i++) {
      difference |= actual[i] ^ expected[i];
    }

    if (difference !== 0) {
      return Response.json({ error: "Senha inválida." }, { status: 401 });
    }

    const expires = String(Date.now() + 8 * 60 * 60 * 1000);
    const signature = Array.from(await digest(expires))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Set-Cookie":
          `ea_admin=${expires}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`
      }
    });
  } catch {
    return Response.json({ error: "Não foi possível entrar." }, { status: 400 });
  }
}
