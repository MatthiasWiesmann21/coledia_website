"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function SessionNav({ onNavigate }: { onNavigate?: () => void }) {
  const { data, isPending } = authClient.useSession();
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function signOut() {
    setPending(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) { setError(true); return; }
      onNavigate?.();
      router.replace("/sign-in");
      router.refresh();
    } catch { setError(true); }
    finally { setPending(false); }
  }

  if (isPending) return <span role="status" className="px-3 text-sm text-muted-foreground">{t("pending")}</span>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={data ? "/controlcenter" : "/sign-in"} onClick={onNavigate}>{t(data ? "controlcenter" : "signIn")}</Link>
      </Button>
      {data && <Button variant="outline" size="sm" disabled={pending} onClick={signOut}>{t(pending ? "pending" : "signOut")}</Button>}
      {error && <p role="alert" className="max-w-48 text-sm text-destructive">{t("error")}</p>}
    </div>
  );
}
