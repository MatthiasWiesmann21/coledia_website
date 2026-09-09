import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth, isAuthConfigured } from "@/lib/auth";
import { ensureOwnerAccount } from "@/lib/controlcenter/owner";

export async function getSession() {
  if (!isAuthConfigured()) return null;
  return getAuth().api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
}

export async function requireOwner(locale: string) {
  const session = await getSession();
  if (!session) redirect(`/${encodeURIComponent(locale)}/sign-in`);
  const owner = await ensureOwnerAccount(session.user.id);
  return { session, owner };
}
