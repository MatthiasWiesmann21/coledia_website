"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createContainer, updateContainer } from "@/lib/actions/containers";
import type { ContainerActionResult } from "@/lib/controlcenter/policy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContainerForm({ container, allowCustomDomain = false, disabled = false }: {
  container?: { id: string; name: string; subdomain: string; customDomain: string | null };
  allowCustomDomain?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("controlcenter");
  const router = useRouter();
  const [state, action, pending] = useActionState<ContainerActionResult | null, FormData>(async (_, form) => {
    try {
      const input = { name: String(form.get("name") ?? ""), subdomain: String(form.get("subdomain") ?? "") };
      const result = container
        ? await updateContainer({ ...input, id: container.id, ...(allowCustomDomain ? { customDomain: String(form.get("customDomain") ?? "") } : {}) })
        : await createContainer(input);
      if (result.ok) {
        if (!container && result.id) router.push(`/controlcenter/containers/${encodeURIComponent(result.id)}`);
        router.refresh();
      }
      return result;
    } catch { return { ok: false, error: "unexpected" }; }
  }, null);
  const prefix = container ? "edit" : "create";
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold">{t(container ? "editContainer" : "createContainer")}</h2>
      <form action={action} aria-busy={pending} className="mt-5 space-y-4">
        <fieldset disabled={disabled || pending} className="space-y-4">
          <div className="space-y-2"><Label htmlFor={`${prefix}-name`}>{t("name")}</Label><Input id={`${prefix}-name`} name="name" defaultValue={container?.name} required minLength={2} maxLength={80} autoComplete="organization" /></div>
          <div className="space-y-2"><Label htmlFor={`${prefix}-subdomain`}>{t("subdomain")}</Label><Input id={`${prefix}-subdomain`} name="subdomain" defaultValue={container?.subdomain} required minLength={3} maxLength={63} pattern="[a-z0-9][a-z0-9-]*[a-z0-9]" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-describedby={`${prefix}-subdomain-hint`} /><p id={`${prefix}-subdomain-hint`} className="text-xs text-muted-foreground">{t("subdomainHint")}</p></div>
          {container && allowCustomDomain && <div className="space-y-2"><Label htmlFor="custom-domain">{t("customDomain")}</Label><Input id="custom-domain" name="customDomain" defaultValue={container.customDomain ?? ""} maxLength={191} autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-describedby="custom-domain-hint" /><p id="custom-domain-hint" className="text-xs text-muted-foreground">{t("customDomainHint")}</p></div>}
          <Button type="submit">{t(pending ? "pending" : container ? "save" : "createContainer")}</Button>
        </fieldset>
        {disabled && <p role="status" className="text-sm text-muted-foreground">{t("errors.limit_reached")}</p>}
        {state && <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-teal-brand" : "text-sm text-destructive"}>{state.ok ? t("saved") : t(`errors.${state.error}`)}</p>}
      </form>
    </section>
  );
}
