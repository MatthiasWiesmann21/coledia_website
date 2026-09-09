"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SettingsForm({ mode, name }: { mode: "profile" | "changePassword"; name?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"error" | "saved" | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const element = event.currentTarget;
    const form = new FormData(element);
    setPending(true);
    setStatus(null);
    try {
      const result = mode === "profile"
        ? await authClient.updateUser({ name: String(form.get("name") ?? "") })
        : await authClient.changePassword({ currentPassword: String(form.get("currentPassword") ?? ""), newPassword: String(form.get("newPassword") ?? ""), revokeOtherSessions: true });
      if (result.error) { setStatus("error"); return; }
      setStatus("saved");
      if (mode === "changePassword") element.reset();
      router.refresh();
    } catch { setStatus("error"); }
    finally { setPending(false); }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-xl font-bold">{t(mode)}</h2>
      <form onSubmit={submit} aria-busy={pending} className="mt-5 space-y-4">
        <fieldset disabled={pending} className="space-y-4">
          {mode === "profile" ? <div className="space-y-2"><Label htmlFor="profile-name">{t("name")}</Label><Input id="profile-name" name="name" defaultValue={name} autoComplete="name" required minLength={2} maxLength={100} /></div> : <>
            <div className="space-y-2"><Label htmlFor="current-password">{t("currentPassword")}</Label><Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} /></div>
            <div className="space-y-2"><Label htmlFor="new-password">{t("newPassword")}</Label><Input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} aria-describedby="new-password-hint" /><p id="new-password-hint" className="text-xs text-muted-foreground">{t("passwordHint")}</p></div>
            <p className="text-sm text-muted-foreground">{t("revokeSessions")}</p>
          </>}
          <Button type="submit">{t(pending ? "pending" : "save")}</Button>
        </fieldset>
        {status && <p role={status === "error" ? "alert" : "status"} className={status === "error" ? "text-sm text-destructive" : "text-sm text-teal-brand"}>{t(status)}</p>}
      </form>
    </section>
  );
}

export function SettingsForms({ name, email }: { name: string; email: string }) {
  const t = useTranslations("auth");
  return <div className="space-y-6"><p className="break-all text-sm text-muted-foreground">{t("email")}: {email}</p><div className="grid items-start gap-6 lg:grid-cols-2"><SettingsForm mode="profile" name={name} /><SettingsForm mode="changePassword" /></div></div>;
}
