<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Verification

- `npm run lint` runs repository-wide ESLint checks.
- `npx tsc --noEmit --incremental false` checks types without writing a TypeScript build cache.
- `npm run build` generates the Prisma client and verifies the production build and localized routes.
- `npm test` runs controlcenter policy/service tests, localization checks, and schema compatibility checks. The schema comparison needs the sibling `coledia_app_1.0` checkout or `COLEDIA_APP_SCHEMA` pointing to its authoritative schema; it is explicitly skipped without either.

## Controlcenter setup (Phase 1)

- The website is the owner-facing control plane; tenant deployments still run the original app with their own fixed `TENANT_ID`. Never set `TENANT_ID` on this website.
- Copy `.env.example` to a local `.env` and supply a development MySQL connection, a strong `BETTER_AUTH_SECRET` matching the app, and this website's `BETTER_AUTH_URL`. Use distinct ports/URLs if running both apps locally. Do not commit real dotenv files.
- Shared identity means the same credentials, not SSO: the website uses host-only cookies with its own prefix. Each tenant deployment uses its own `BETTER_AUTH_URL` and sign-in session.
- The app repository owns ALL shared-database migrations, including `OwnerAccount` and `Container`. Review/back up the target database, then apply the app's migration workflow only after explicit approval. The website's `prisma/schema.prisma` is a partial client schema: NEVER run `prisma db push` or `prisma migrate` against it. No database changes are applied by generate, validate, tests, or build.
- Run `npm run db:generate`, then `npm run dev`. `npm run db:validate` needs a syntactically valid `DATABASE_URL` but does not connect. Signup creates the free owner account; an existing app user gets an owner account on entering the controlcenter. No seed credentials or automatic demo data are installed.
- Set `CONTROL_CENTER_MOCK_PROVISIONING=true` for explicit local simulation. It is ignored in production. Simulated containers have status `mock`, never `active`, and no live-app link. Without simulation, creation retains a retryable `error` record. Both states count toward the tier limit. Tenants remain suspended until real provisioning is implemented.
- Production requires email verification. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and optional paired `SMTP_USER`/`SMTP_PASSWORD` for verification and password reset. Port 465 enables implicit TLS; production otherwise requires STARTTLS. Development can require verification with `AUTH_REQUIRE_EMAIL_VERIFICATION=true`. Mail links/tokens are never printed to logs.
- Limits are owner-tier based: free=1, club=3, organization=unlimited, with custom domains only on organization. Tenant feature plans remain separate. Phase 1 billing is read-only: there is no Stripe checkout, webhook, or self-service tier change yet.
- Deletion requires typing the current subdomain and soft-deletes only unprovisioned/mock records, setting the tenant to cancelled. Slugs/domains and tenant data are retained; do not automatically free them. Real application IDs/active deployments cannot be changed or deleted in Phase 1. Permanent purge after six months is a future task, not an existing scheduled job.
- Phase 2 requires verified Dokploy API contracts, a pinned deployment image/build configuration, health reconciliation, idempotent retries, DNS ownership validation, realtime settings, and persistent upload storage retained independently of application deletion. Never turn a deployment request into `active` before health confirmation.
- Phase 3 uses owner-specific Stripe subscriptions and test keys/prices. Do not repurpose the app's tenant-level Stripe fields or course-sale billing. Future webhooks must verify signatures and handle duplicate/out-of-order events.
- The installed Next.js docs were copied by the user to `.devin/next-docs` because tooling denied ignored `node_modules` reads. That directory is a local reference copy, not application code or part of the controlcenter changes to commit.
