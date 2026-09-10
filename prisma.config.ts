// Prisma CLI configuration (Prisma ORM v7+).
//
// In v7 the `url`/`shadowDatabaseUrl` fields moved out of the schema's
// `datasource` block and into this config file. The Prisma CLI (migrate,
// db push, db seed, etc.) reads the connection URL from here.
//
// The website does not own migrations — this config exists only so
// `prisma generate` and `prisma validate` work. Migrations are applied
// from coledia_app_1.0/packages/db.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
