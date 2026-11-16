
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "../../../lib/admin-auth";
import { env } from "cloudflare:workers";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const request = new Request("https://admin.local", {
    headers: h,
  });

  const authorized = await verifyAdminSession(
    request,
    String(env.ADMIN_SESSION_SECRET || "")
  );

  if (!authorized) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
