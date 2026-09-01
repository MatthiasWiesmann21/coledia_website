import { z } from "zod";

export function buildContactSchema(messages: {
  name: string;
  email: string;
  message: string;
}) {
  return z.object({
    name: z.string().min(2, messages.name),
    email: z.string().email(messages.email),
    organization: z.string().optional(),
    message: z.string().min(10, messages.message),
    coffee: z.boolean().optional(),
  });
}

export type ContactInput = z.infer<ReturnType<typeof buildContactSchema>>;
