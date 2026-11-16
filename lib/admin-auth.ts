
export function getAdminToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)ea_admin=([^;]+)/);
  return match ? match[1] : null;
}

export async function verifyAdminSession(
  request: Request,
  secret: string
): Promise<boolean> {
  const token = getAdminToken(request);
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [expires, signature] = parts;
  if (!/^\d{10,13}$/.test(expires)) return false;
  if (Number(expires) <= Date.now()) return false;
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const bytes = new Uint8Array(
    signature.match(/.{2}/g)!.map(v => parseInt(v, 16))
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    bytes,
    new TextEncoder().encode(expires)
  );
}
