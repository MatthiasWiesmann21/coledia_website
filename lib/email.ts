import "server-only";

import nodemailer from "nodemailer";

export async function sendAuthEmail(input: {
  to: string;
  url: string;
  kind: "verification" | "reset";
}): Promise<void> {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (
    !host || !from || !Number.isInteger(port) || port < 1 || port > 65535 ||
    Boolean(user) !== Boolean(pass)
  ) {
    throw new Error("email_unavailable");
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    requireTLS: process.env.NODE_ENV === "production",
    auth: user && pass ? { user, pass } : undefined,
    logger: false,
    debug: false,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  try {
    await transport.sendMail({
      from,
      to: input.to,
      subject: input.kind === "verification" ? "Coledia — Verify your email" : "Coledia — Reset your password",
      text: input.url,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  } catch {
    throw new Error("email_unavailable");
  } finally {
    transport.close();
  }
}
