import { getTranslations } from "next-intl/server";
import { isAuthConfigured } from "@/lib/auth";
import { AuthForm, type AuthMode } from "@/components/auth/auth-form";

export async function AuthPage({ mode, locale, token }: { mode: AuthMode; locale: string; token?: string }) {
  const t = await getTranslations({ locale, namespace: "auth" });
  if (!isAuthConfigured()) {
    return <div className="space-y-4"><h1 className="text-3xl font-extrabold">{t(mode)}</h1><p role="status" className="rounded-2xl bg-muted p-4 text-sm leading-relaxed">{t("setupUnavailable")}</p></div>;
  }
  return <AuthForm mode={mode} token={token} />;
}
