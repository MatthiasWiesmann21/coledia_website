import "server-only";

export function isDokployConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(
    env.DOKPLOY_API_URL?.trim() &&
    env.DOKPLOY_API_KEY?.trim() &&
    env.DOKPLOY_ENVIRONMENT_ID?.trim(),
  );
}

export class DokployError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly endpoint: string,
  ) {
    super(message);
    this.name = "DokployError";
  }
}

export interface DokployApplication {
  applicationId: string;
  name: string;
  appName: string;
  status?: string;
  sourceType?: string;
}

export interface DokployConfig {
  apiUrl: string;
  apiKey: string;
  environmentId: string;
  gitUrl?: string;
  gitBranch?: string;
  gitBuildPath?: string;
  dockerfile?: string;
  dockerContextPath?: string;
  containerPort?: number;
  baseDomain?: string;
}

export function getDokployConfig(
  env: Record<string, string | undefined> = process.env,
): DokployConfig | null {
  if (!isDokployConfigured(env)) return null;
  return {
    apiUrl: env.DOKPLOY_API_URL!.replace(/\/+$/, ""),
    apiKey: env.DOKPLOY_API_KEY!,
    environmentId: env.DOKPLOY_ENVIRONMENT_ID!,
    gitUrl: env.DOKPLOY_GIT_URL?.trim() || undefined,
    gitBranch: env.DOKPLOY_GIT_BRANCH?.trim() || "main",
    gitBuildPath: env.DOKPLOY_GIT_BUILD_PATH?.trim() || undefined,
    dockerfile: env.DOKPLOY_DOCKERFILE?.trim() || "Dockerfile",
    dockerContextPath: env.DOKPLOY_DOCKER_CONTEXT_PATH?.trim() || undefined,
    containerPort: env.DOKPLOY_CONTAINER_PORT ? Number(env.DOKPLOY_CONTAINER_PORT) : 3000,
    baseDomain: env.CONTAINER_BASE_DOMAIN?.trim() || undefined,
  };
}

export function createDokployClient(config: DokployConfig) {
  const baseUrl = `${config.apiUrl}/api`;

  async function request<T = unknown>(
    endpoint: string,
    body?: Record<string, unknown>,
    method: "POST" | "GET" = "POST",
  ): Promise<T> {
    const url = method === "GET"
      ? `${baseUrl}/${endpoint}`
      : `${baseUrl}/${endpoint}`;
    const searchParams = new URLSearchParams();
    const hasQuery = body && method === "GET";
    if (hasQuery && body) {
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
    }
    const finalUrl = hasQuery ? `${url}?${searchParams}` : url;
    const response = await fetch(finalUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: method === "POST" && body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      let message = `Dokploy ${endpoint} failed`;
      try {
        const error = await response.json();
        if (typeof error === "object" && error !== null && "message" in error) {
          message = String(error.message);
        }
      } catch {
        // Use default message
      }
      throw new DokployError(message, response.status, endpoint);
    }
    return response.json().catch(() => ({}) as T);
  }

  return {
    async createApplication(opts: {
      name: string;
      appName: string;
      description?: string;
    }): Promise<{ applicationId: string }> {
      const result = await request<{ applicationId?: string } & Record<string, unknown>>(
        "application.create",
        {
          name: opts.name,
          appName: opts.appName,
          description: opts.description ?? null,
          environmentId: config.environmentId,
          sourceType: "git",
        },
      );
      const applicationId = result.applicationId ?? (result as Record<string, unknown>).id;
      if (typeof applicationId !== "string") {
        throw new DokployError("Missing applicationId in create response", 200, "application.create");
      }
      return { applicationId };
    },

    async saveGitProvider(applicationId: string): Promise<void> {
      if (!config.gitUrl) {
        throw new DokployError("DOKPLOY_GIT_URL is not configured", 500, "application.saveGitProvider");
      }
      await request("application.saveGitProvider", {
        applicationId,
        customGitUrl: config.gitUrl,
        customGitBranch: config.gitBranch,
        customGitBuildPath: config.gitBuildPath ?? null,
        watchPaths: null,
        enableSubmodules: false,
        customGitSSHKeyId: null,
      });
    },

    async saveBuildType(applicationId: string): Promise<void> {
      await request("application.saveBuildType", {
        applicationId,
        buildType: "dockerfile",
        dockerfile: config.dockerfile,
        dockerContextPath: config.dockerContextPath ?? null,
        dockerBuildStage: null,
        herokuVersion: null,
        railpackVersion: null,
        publishDirectory: null,
        isStaticSpa: null,
      });
    },

    async saveEnvironment(
      applicationId: string,
      envVars: Record<string, string>,
    ): Promise<void> {
      const env = Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
      await request("application.saveEnvironment", {
        applicationId,
        env,
        buildArgs: null,
        buildSecrets: null,
        createEnvFile: true,
      });
    },

    async createDomain(opts: {
      applicationId: string;
      host: string;
      port?: number;
      https?: boolean;
    }): Promise<void> {
      await request("domain.create", {
        host: opts.host,
        applicationId: opts.applicationId,
        path: "/",
        port: opts.port ?? config.containerPort ?? 3000,
        https: opts.https ?? true,
        certificateType: "letsencrypt",
        domainType: "application",
      });
    },

    async deploy(applicationId: string): Promise<void> {
      await request("application.deploy", { applicationId });
    },

    async getApplication(applicationId: string): Promise<DokployApplication> {
      return request("application.one", { applicationId }, "GET");
    },

    async stop(applicationId: string): Promise<void> {
      await request("application.stop", { applicationId });
    },

    async start(applicationId: string): Promise<void> {
      await request("application.start", { applicationId });
    },

    async delete(applicationId: string): Promise<void> {
      await request("application.delete", { applicationId });
    },
  };
}

export type DokployClient = ReturnType<typeof createDokployClient>;
