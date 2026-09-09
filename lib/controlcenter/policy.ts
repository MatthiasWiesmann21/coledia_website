import { z } from "zod";

const reservedSubdomains = new Set([
  "www", "app", "api", "admin", "auth", "account", "accounts", "billing",
  "controlcenter", "dashboard", "docs", "blog", "help", "support", "status", "mail",
  "smtp", "imap", "pop", "ftp", "cdn", "static", "assets", "media", "uploads",
  "dev", "development", "staging", "stage", "test", "demo", "localhost",
  "coledia", "dokploy", "internal", "root", "system", "security", "login",
  "signup", "register", "logout", "reset-password", "verify-email",
]);

export function getContainerLimit(tier: string): number | null {
  if (tier === "organization") return null;
  if (tier === "club") return 3;
  return 1;
}

export function canUseCustomDomain(tier: string): boolean {
  return tier === "organization";
}

export function isMockProvisioningEnabled(
  env: { NODE_ENV?: string; CONTROL_CENTER_MOCK_PROVISIONING?: string } = process.env,
): boolean {
  return (env.NODE_ENV === "development" || env.NODE_ENV === "test") &&
    env.CONTROL_CENTER_MOCK_PROVISIONING === "true";
}

export const subdomainSchema = z.string().trim().toLowerCase().min(3).max(63)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/)
  .refine((value) => !value.startsWith("xn--") && !reservedSubdomains.has(value));

export const customDomainSchema = z.string().trim().toLowerCase().max(191)
  .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/)
  .refine((value) => !/(?:^|\.)(?:localhost|local|internal|invalid|test|example)$/.test(value));

export const containerInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  subdomain: subdomainSchema,
});

export const updateContainerInputSchema = containerInputSchema.extend({
  id: z.string().min(1).max(191),
  customDomain: z.union([z.literal(""), customDomainSchema]).optional(),
});

export const containerIdSchema = z.object({ id: z.string().min(1).max(191) });

export const deleteContainerInputSchema = containerIdSchema.extend({
  confirmation: z.string().min(1).max(63),
});

export type CreateContainerInput = z.input<typeof containerInputSchema>;
export type UpdateContainerInput = z.input<typeof updateContainerInputSchema>;
export type DeleteContainerInput = z.input<typeof deleteContainerInputSchema>;
export type RetryContainerInput = z.input<typeof containerIdSchema>;

export type ContainerError =
  | "invalid_input"
  | "unauthenticated"
  | "limit_reached"
  | "not_found"
  | "domain_unavailable"
  | "custom_domain_not_allowed"
  | "confirmation_mismatch"
  | "operation_not_allowed"
  | "provisioning_unavailable"
  | "unexpected";

export type ContainerActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: ContainerError };
