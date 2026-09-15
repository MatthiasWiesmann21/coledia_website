<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Overview

This repository is the Coledia marketing website only. It is a localized,
static-friendly Next.js site with marketing pages (home, about, features,
pricing, contact) and legal pages (imprint, privacy). There is no
authentication, no controlcenter, no database, no Prisma, no Stripe, and no
Dokploy integration in this repository.

## Verification

- `npm run lint` runs repository-wide ESLint checks.
- `npx tsc --noEmit --incremental false` checks types without writing a TypeScript build cache.
- `npm run build` verifies the production build and localized routes.
- `npm test` runs localization checks (matching translation keys across locales).

## Environment

- Copy `.env.example` to a local `.env` and set `NEXT_PUBLIC_APP_URL` to the
  public site URL (used for metadata, sitemap, etc.). Do not commit real dotenv
  files.
- No database or auth configuration is required for this site.
