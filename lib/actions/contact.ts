"use server";

import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  organization: z.string().optional(),
  message: z.string().min(10),
  coffee: z.boolean().optional(),
});

export type ContactActionResult = { ok: boolean };

export async function submitContact(
  input: unknown
): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false };
  }

  // TODO: Wire up e-mail delivery (e.g. Resend/Postmark) before launch.
  // Intentionally simulating a successful send for now.
  console.log("[coledia] contact request received:", parsed.data);

  return { ok: true };
}
