"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AuthMode = "signIn" | "signUp" | "forgotPassword" | "resetPassword";

export function AuthForm({ mode, token }: { mode: AuthMode; token?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const isReset = mode === "resetPassword";
  const isForgot = mode === "forgotPassword";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const callbackURL = `/${locale}/controlcenter`;
    setPending(true);
    setError(false);
    setSuccess(false);
    try {
      if (mode === "signUp") {
        const result = await authClient.signUp.email({ name: String(form.get("name") ?? ""), email, password, callbackURL });
        if (result.error) { setError(true); return; }
        if (result.data?.token) {
          router.replace("/controlcenter");
          router.refresh();
        } else setSuccess(true);
      } else if (mode === "signIn") {
        const result = await authClient.signIn.email({ email, password, callbackURL });
        if (result.error) { setError(true); return; }
        router.replace("/controlcenter");
        router.refresh();
      } else if (isForgot) {
        const result = await authClient.requestPasswordReset({ email, redirectTo: `/${locale}/reset-password` });
        if (result.error) { setError(true); return; }
        setSuccess(true);
      } else {
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) { setError(true); return; }
        setSuccess(true);
      }
    } catch { setError(true); }
    finally { setPending(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t(mode)}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(`${mode}Description`)}</p>
      </div>
      {isReset && !token ? <p role="alert" className="rounded-2xl bg-muted p-4 text-sm">{t("invalidToken")}</p> : (
        <form onSubmit={submit} aria-busy={pending} className="space-y-4">
          <fieldset disabled={pending || success} className="space-y-4">
            {mode === "signUp" && <div className="space-y-2"><Label htmlFor="name">{t("name")}</Label><Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} /></div>}
            {!isReset && <div className="space-y-2"><Label htmlFor="email">{t("email")}</Label><Input id="email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>}
            {!isForgot && <div className="space-y-2"><Label htmlFor="password">{t(isReset ? "newPassword" : "password")}</Label><Input id="password" name="password" type="password" autoComplete={mode === "signIn" ? "current-password" : "new-password"} required minLength={8} maxLength={128} aria-describedby="password-hint" /><p id="password-hint" className="text-xs text-muted-foreground">{t("passwordHint")}</p></div>}
            <Button type="submit" className="w-full">{t(pending ? "pending" : mode)}</Button>
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{t("error")}</p>}
          {success && <p role="status" className="rounded-2xl bg-teal-brand/10 p-4 text-sm">{t(isReset ? "passwordReset" : "checkInbox")}</p>}
        </form>
      )}
      <nav aria-label={t("accountNavigation")} className="flex flex-wrap gap-x-4 gap-y-3 text-sm font-medium text-teal-brand">
        {mode !== "signIn" && <Link href="/sign-in" className="hover:underline">{t("signIn")}</Link>}
        {mode === "signIn" && <Link href="/sign-up" className="hover:underline">{t("signUp")}</Link>}
        {(mode === "signIn" || isReset) && <Link href="/forgot-password" className="hover:underline">{t("forgotPassword")}</Link>}
      </nav>
    </div>
  );
}
