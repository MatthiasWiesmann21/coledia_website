import "server-only";

import { isMockProvisioningEnabled } from "../controlcenter/policy";
import {
  createDokployClient,
  getDokployConfig,
  type DokployClient,
} from "./client";

export type ProvisionResult =
  | { status: "mock"; provisionError: null }
  | { status: "error"; provisionError: string }
  | { status: "active"; provisionError: null; dokployApplicationId: string }
  | { status: "provisioning"; provisionError: null; dokployApplicationId: string };

export interface ProvisionInput {
  name: string;
  subdomain: string;
  customDomain?: string | null;
  tenantId: string;
  envVars: Record<string, string>;
}

export type ProvisionFn = (input: ProvisionInput) => Promise<ProvisionResult>;

export type DeprovisionFn = (
  dokployApplicationId: string,
  action: "stop" | "delete",
) => Promise<void>;

export function provisionContainer(): ProvisionResult {
  if (isMockProvisioningEnabled()) {
    return { status: "mock", provisionError: null };
  }
  return { status: "error", provisionError: "provisioning_unavailable" };
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }
  return "provisioning_failed";
}

export function createRealProvisioner(
  client: DokployClient,
  config: { baseDomain?: string },
): ProvisionFn {
  return async (input) => {
    try {
      const appName = input.subdomain.replace(/[^a-zA-Z0-9._-]/g, "-");
      const { applicationId } = await client.createApplication({
        name: input.name,
        appName,
        description: `Coledia container for ${input.subdomain}`,
      });

      await client.saveGitProvider(applicationId);
      await client.saveBuildType(applicationId);
      await client.saveEnvironment(applicationId, input.envVars);

      const baseDomain = config.baseDomain || "coledia.com";
      await client.createDomain({
        applicationId,
        host: `${input.subdomain}.${baseDomain}`,
      });

      if (input.customDomain) {
        await client.createDomain({
          applicationId,
          host: input.customDomain,
        });
      }

      await client.deploy(applicationId);

      return {
        status: "provisioning",
        provisionError: null,
        dokployApplicationId: applicationId,
      };
    } catch (error) {
      return { status: "error", provisionError: sanitizeError(error) };
    }
  };
}

export function createRealDeprovisioner(client: DokployClient): DeprovisionFn {
  return async (dokployApplicationId, action) => {
    if (action === "stop") {
      await client.stop(dokployApplicationId);
    } else {
      await client.delete(dokployApplicationId);
    }
  };
}

export function getProvisioner(): ProvisionFn {
  const config = getDokployConfig();
  if (!config) return async () => provisionContainer();
  const client = createDokployClient(config);
  return createRealProvisioner(client, { baseDomain: config.baseDomain });
}

export function getDeprovisioner(): DeprovisionFn | null {
  const config = getDokployConfig();
  if (!config) return null;
  const client = createDokployClient(config);
  return createRealDeprovisioner(client);
}

export function buildContainerEnvVars(
  input: { tenantId: string; subdomain: string; customDomain?: string | null },
  env: Record<string, string | undefined> = process.env,
): Record<string, string> {
  const baseDomain = env.CONTAINER_BASE_DOMAIN?.trim() || "coledia.com";
  const appUrl = input.customDomain
    ? `https://${input.customDomain}`
    : `https://${input.subdomain}.${baseDomain}`;

  const vars: Record<string, string> = {
    TENANT_ID: input.tenantId,
    NODE_ENV: "production",
    BETTER_AUTH_URL: appUrl,
    NEXT_PUBLIC_APP_URL: appUrl,
    STORAGE_PATH: "./uploads",
  };
  if (env.DATABASE_URL) vars.DATABASE_URL = env.DATABASE_URL;
  if (env.BETTER_AUTH_SECRET) vars.BETTER_AUTH_SECRET = env.BETTER_AUTH_SECRET;
  if (env.SMTP_HOST) vars.SMTP_HOST = env.SMTP_HOST;
  if (env.SMTP_PORT) vars.SMTP_PORT = env.SMTP_PORT;
  if (env.SMTP_USER) vars.SMTP_USER = env.SMTP_USER;
  if (env.SMTP_PASSWORD) vars.SMTP_PASSWORD = env.SMTP_PASSWORD;
  if (env.SMTP_FROM) vars.SMTP_FROM = env.SMTP_FROM;
  if (env.REALTIME_URL) vars.REALTIME_URL = env.REALTIME_URL;
  return vars;
}
