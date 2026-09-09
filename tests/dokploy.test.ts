import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createDokployClient,
  getDokployConfig,
  isDokployConfigured,
  type DokployConfig,
} from "../lib/dokploy/client";
import {
  buildContainerEnvVars,
  createRealProvisioner,
  createRealDeprovisioner,
  provisionContainer,
  type ProvisionInput,
  type ProvisionResult,
} from "../lib/dokploy/provision";

const baseConfig: DokployConfig = {
  apiUrl: "https://dokploy.example.com",
  apiKey: "test-key",
  environmentId: "env-123",
  gitUrl: "https://github.com/coledia/app.git",
  gitBranch: "main",
  gitBuildPath: "apps/web",
  dockerfile: "Dockerfile",
  dockerContextPath: ".",
  containerPort: 3000,
  baseDomain: "coledia.com",
};

function mockFetch(responses: Record<string, { ok: boolean; json?: unknown; status?: number }>) {
  const calls: Array<{ endpoint: string; body?: unknown }> = [];
  const original = global.fetch;
  global.fetch = (async (url: URL | RequestInfo, init?: RequestInit) => {
    const urlStr = typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
    const endpoint = urlStr.replace("https://dokploy.example.com/api/", "").split("?")[0];
    calls.push({ endpoint, body: init?.body ? JSON.parse(init.body as string) : undefined });
    const response = responses[endpoint] ?? { ok: true, json: {} };
    return {
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 400),
      json: async () => response.json ?? {},
      text: async () => JSON.stringify(response.json ?? {}),
    } as Response;
  }) as typeof fetch;
  return { calls, restore: () => { global.fetch = original; } };
}

test("isDokployConfigured returns false without all required env vars", () => {
  assert.equal(isDokployConfigured({}), false);
  assert.equal(isDokployConfigured({ DOKPLOY_API_URL: "x", DOKPLOY_API_KEY: "y" }), false);
  assert.equal(isDokployConfigured({ DOKPLOY_API_URL: "x", DOKPLOY_API_KEY: "y", DOKPLOY_ENVIRONMENT_ID: "z" }), true);
  assert.equal(isDokployConfigured({ DOKPLOY_API_URL: "  ", DOKPLOY_API_KEY: "y", DOKPLOY_ENVIRONMENT_ID: "z" }), false);
});

test("getDokployConfig returns null when unconfigured and config when set", () => {
  assert.equal(getDokployConfig({}), null);
  const config = getDokployConfig({
    DOKPLOY_API_URL: "https://dokploy.example.com/",
    DOKPLOY_API_KEY: "key",
    DOKPLOY_ENVIRONMENT_ID: "env",
    DOKPLOY_GIT_URL: "https://github.com/coledia/app.git",
    DOKPLOY_GIT_BRANCH: "develop",
  });
  assert.ok(config);
  assert.equal(config!.apiUrl, "https://dokploy.example.com");
  assert.equal(config!.gitBranch, "develop");
});

test("buildContainerEnvVars injects TENANT_ID and shared secrets", () => {
  const vars = buildContainerEnvVars(
    { tenantId: "tenant-123" },
    { DATABASE_URL: "mysql://localhost", BETTER_AUTH_SECRET: "secret" },
  );
  assert.equal(vars.TENANT_ID, "tenant-123");
  assert.equal(vars.NODE_ENV, "production");
  assert.equal(vars.DATABASE_URL, "mysql://localhost");
  assert.equal(vars.BETTER_AUTH_SECRET, "secret");
});

test("provisionContainer returns mock when enabled and error otherwise", () => {
  const mock = provisionContainer();
  assert.ok(mock.status === "mock" || mock.status === "error");
});

test("real provisioner creates application, configures git, env, domain, and deploys", async () => {
  const { calls, restore } = mockFetch({
    "application.create": { ok: true, json: { applicationId: "app-001" } },
    "application.saveGitProvider": { ok: true, json: {} },
    "application.saveBuildType": { ok: true, json: {} },
    "application.saveEnvironment": { ok: true, json: {} },
    "domain.create": { ok: true, json: {} },
    "application.deploy": { ok: true, json: {} },
  });
  try {
    const client = createDokployClient(baseConfig);
    const provision = createRealProvisioner(client, { baseDomain: "coledia.com" });
    const input: ProvisionInput = {
      name: "My Club",
      subdomain: "myclub",
      customDomain: null,
      tenantId: "tenant-001",
      envVars: { TENANT_ID: "tenant-001", NODE_ENV: "production" },
    };
    const result = await provision(input);
    assert.equal(result.status, "provisioning");
    assert.equal((result as Extract<ProvisionResult, { status: "provisioning" }>).dokployApplicationId, "app-001");

    const endpoints = calls.map((c) => c.endpoint);
    assert.deepEqual(endpoints, [
      "application.create",
      "application.saveGitProvider",
      "application.saveBuildType",
      "application.saveEnvironment",
      "domain.create",
      "application.deploy",
    ]);

    const createCall = calls[0];
    assert.equal((createCall.body as Record<string, unknown>)?.sourceType, "git");
    assert.equal((createCall.body as Record<string, unknown>)?.environmentId, "env-123");

    const envCall = calls[3];
    assert.ok(String((envCall.body as Record<string, unknown>)?.env).includes("TENANT_ID=tenant-001"));

    const domainCall = calls[4];
    assert.equal((domainCall.body as Record<string, unknown>)?.host, "myclub.coledia.com");
  } finally {
    restore();
  }
});

test("real provisioner creates custom domain when provided", async () => {
  const { calls, restore } = mockFetch({
    "application.create": { ok: true, json: { applicationId: "app-002" } },
    "application.saveGitProvider": { ok: true, json: {} },
    "application.saveBuildType": { ok: true, json: {} },
    "application.saveEnvironment": { ok: true, json: {} },
    "domain.create": { ok: true, json: {} },
    "application.deploy": { ok: true, json: {} },
  });
  try {
    const client = createDokployClient(baseConfig);
    const provision = createRealProvisioner(client, { baseDomain: "coledia.com" });
    const result = await provision({
      name: "Org",
      subdomain: "org",
      customDomain: "club.example.com",
      tenantId: "tenant-002",
      envVars: { TENANT_ID: "tenant-002" },
    });
    assert.equal(result.status, "provisioning");
    const domainCalls = calls.filter((c) => c.endpoint === "domain.create");
    assert.equal(domainCalls.length, 2);
    assert.equal((domainCalls[0].body as Record<string, unknown>)?.host, "org.coledia.com");
    assert.equal((domainCalls[1].body as Record<string, unknown>)?.host, "club.example.com");
  } finally {
    restore();
  }
});

test("real provisioner returns error when application.create fails", async () => {
  const { restore } = mockFetch({
    "application.create": { ok: false, status: 400, json: { message: "Bad request" } },
  });
  try {
    const client = createDokployClient(baseConfig);
    const provision = createRealProvisioner(client, { baseDomain: "coledia.com" });
    const result = await provision({
      name: "Fail",
      subdomain: "fail",
      customDomain: null,
      tenantId: "tenant-003",
      envVars: {},
    });
    assert.equal(result.status, "error");
    assert.ok((result as Extract<ProvisionResult, { status: "error" }>).provisionError.length > 0);
  } finally {
    restore();
  }
});

test("real deprovisioner calls stop for stop action and delete for delete action", async () => {
  const { calls, restore } = mockFetch({
    "application.stop": { ok: true, json: {} },
    "application.delete": { ok: true, json: {} },
  });
  try {
    const client = createDokployClient(baseConfig);
    const deprovision = createRealDeprovisioner(client);
    await deprovision("app-001", "stop");
    await deprovision("app-001", "delete");
    assert.equal(calls[0].endpoint, "application.stop");
    assert.equal(calls[1].endpoint, "application.delete");
  } finally {
    restore();
  }
});

test("real deprovisioner throws on failure", async () => {
  const { restore } = mockFetch({
    "application.stop": { ok: false, status: 500, json: { message: "Server error" } },
  });
  try {
    const client = createDokployClient(baseConfig);
    const deprovision = createRealDeprovisioner(client);
    await assert.rejects(deprovision("app-001", "stop"));
  } finally {
    restore();
  }
});
