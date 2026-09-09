"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { startTierUpgrade, openBillingPortal } from "@/lib/actions/billing";

export function BillingActions({
  currentTier,
  stripeConfigured,
  hasSubscription,
}: {
  currentTier: string;
  stripeConfigured: boolean;
  hasSubscription: boolean;
}) {
  const t = useTranslations("controlcenter");
  const [pending, startTransition] = useTransition();

  if (!stripeConfigured) {
    return <p role="status" className="rounded-2xl bg-muted p-4 text-sm leading-relaxed">{t("billingUnavailable")}</p>;
  }

  const tiers = ["club", "organization"] as const;
  const availableUpgrades = tiers.filter((tier) => {
    if (currentTier === "organization") return false;
    if (currentTier === "club") return tier === "organization";
    return true;
  });

  function handleUpgrade(tier: string) {
    startTransition(async () => {
      const result = await startTierUpgrade(tier);
      if (result.ok) window.location.href = result.url;
    });
  }

  function handlePortal() {
    startTransition(async () => {
      const result = await openBillingPortal();
      if (result.ok) window.location.href = result.url;
    });
  }

  return (
    <div className="space-y-4">
      {hasSubscription && (
        <Button type="button" variant="outline" onClick={handlePortal} disabled={pending}>
          {t("manageSubscription")}
        </Button>
      )}
      {availableUpgrades.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {availableUpgrades.map((tier) => (
            <Button key={tier} type="button" onClick={() => handleUpgrade(tier)} disabled={pending}>
              {t("upgrade", { tier: t(`tiers.${tier}`) })}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
