import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const appSchemaPath = process.env.COLEDIA_APP_SCHEMA ?? path.resolve(root, "../coledia_app_1.0/packages/db/prisma/schema.prisma");
const scalarTypes = new Set(["String", "Boolean", "Int", "BigInt", "Float", "Decimal", "DateTime", "Json", "Bytes"]);

function models(source: string) {
  return new Map(Array.from(source.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/g), (match) => {
    const fields = match[2].split("\n").map((line) => line.split("//")[0].trim().replace(/\s+/g, " "));
    return [match[1], fields.filter((line) => scalarTypes.has(line.split(" ")[1]?.replace(/[?\[\]]/g, ""))).sort()];
  }));
}

test("website client scalar columns match the authoritative app schema", { skip: !existsSync(appSchemaPath) && "Set COLEDIA_APP_SCHEMA or check out the sibling app repository" }, () => {
  const website = models(readFileSync(path.join(root, "prisma/schema.prisma"), "utf8"));
  const app = models(readFileSync(appSchemaPath, "utf8"));
  for (const name of ["User", "Session", "Account", "Verification", "Tenant", "Membership", "OwnerAccount", "Container"]) {
    assert.ok(website.has(name), `Missing website model ${name}`);
  }
  for (const [name, fields] of website) {
    assert.deepEqual(fields, app.get(name), `Scalar-column drift in ${name}`);
  }
});

test("website does not offer shared database push or migration commands", () => {
  const { scripts } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  for (const command of Object.values(scripts)) {
    assert.doesNotMatch(String(command), /prisma\s+(?:db\s+push|migrate)/);
  }
});
