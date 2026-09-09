import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

function messageKeys(value: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    return typeof child === "string" ? [name] : messageKeys(child as Record<string, unknown>, name);
  }).sort();
}

test("all four locales have matching translation keys", () => {
  const messages = ["en", "de", "fr", "es"].map((locale) => JSON.parse(readFileSync(path.join(process.cwd(), "messages", `${locale}.json`), "utf8")));
  for (const namespace of ["controlcenter", "auth"]) {
    assert.ok(messages[0][namespace], `Missing namespace: ${namespace}`);
  }
  for (const translated of messages.slice(1)) {
    assert.deepEqual(messageKeys(translated), messageKeys(messages[0]));
  }
});
