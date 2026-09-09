"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { createContainerService } from "@/lib/controlcenter/service";
import { containerStore } from "@/lib/controlcenter/store";
import {
  getProvisioner,
  getDeprovisioner,
  buildContainerEnvVars,
} from "@/lib/dokploy/provision";
import type {
  ContainerActionResult,
  CreateContainerInput,
  UpdateContainerInput,
  DeleteContainerInput,
  RetryContainerInput,
} from "@/lib/controlcenter/policy";

const service = createContainerService({
  store: containerStore,
  provision: getProvisioner(),
  deprovision: getDeprovisioner(),
  buildEnvVars: buildContainerEnvVars,
});

async function mutate(
  operation: (userId: string) => Promise<ContainerActionResult>,
): Promise<ContainerActionResult> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, error: "unauthenticated" };
    const result = await operation(session.user.id);
    if (result.ok || result.error === "provisioning_unavailable") {
      revalidatePath("/[locale]/controlcenter", "layout");
    }
    return result;
  } catch {
    return { ok: false, error: "unexpected" };
  }
}

export async function createContainer(input: CreateContainerInput): Promise<ContainerActionResult> {
  return mutate((userId) => service.create(userId, input));
}

export async function updateContainer(input: UpdateContainerInput): Promise<ContainerActionResult> {
  return mutate((userId) => service.update(userId, input));
}

export async function deleteContainer(input: DeleteContainerInput): Promise<ContainerActionResult> {
  return mutate((userId) => service.delete(userId, input));
}

export async function retryContainer(input: RetryContainerInput): Promise<ContainerActionResult> {
  return mutate((userId) => service.retry(userId, input));
}
