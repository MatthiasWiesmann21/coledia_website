"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteContainer, retryContainer } from "@/lib/actions/containers";
import type { ContainerActionResult } from "@/lib/controlcenter/policy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContainerActions({ id, subdomain, canRetry }: { id: string; subdomain: string; canRetry: boolean }) {
  const t = useTranslations("controlcenter");
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [state, action, pending] = useActionState<ContainerActionResult | null, FormData>(async (_, form) => {
    try {
      const deleting = form.get("operation") === "delete";
      const result = deleting ? await deleteContainer({ id, confirmation: String(form.get("confirmation") ?? "") }) : await retryContainer({ id });
      if (result.ok && deleting) router.push("/controlcenter/containers");
      router.refresh();
      return result;
    } catch { return { ok: false, error: "unexpected" }; }
  }, null);
  return <section className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
    {canRetry && <form action={action} aria-busy={pending}><input type="hidden" name="operation" value="retry" /><h2 className="text-xl font-bold">{t("retry")}</h2><p className="my-3 text-sm text-muted-foreground">{t("retryDescription")}</p><Button type="submit" variant="outline" disabled={pending}>{t(pending ? "pending" : "retry")}</Button></form>}
    <form action={action} aria-busy={pending} className="space-y-4">
      <input type="hidden" name="operation" value="delete" />
      <h2 className="text-xl font-bold">{t("deleteContainer")}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{t("retentionNote")}</p>
      <fieldset disabled={pending} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="delete-confirmation">{t("confirmation", { subdomain })}</Label><Input id="delete-confirmation" name="confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required autoComplete="off" autoCapitalize="none" spellCheck={false} /></div>
        <Button type="submit" variant="outline" className="border-destructive/40 text-destructive" disabled={confirmation !== subdomain || pending}>{t(pending ? "pending" : "deleteContainer")}</Button>
      </fieldset>
    </form>
    {state && <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-teal-brand" : "text-sm text-destructive"}>{state.ok ? t("saved") : t(`errors.${state.error}`)}</p>}
  </section>;
}
