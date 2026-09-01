# coledia.com Website

Marketing website for Coledia – a product of **Wiesmann Solutions Engineering** (wiesmann-se.ch).

## Stack

- **Next.js 16** (App Router, static generation)
- **Tailwind CSS v4** – brand design tokens in `app/globals.css`
- **next-intl** – localized routes for `en` (default), `de`, `fr`, `es`
- **shadcn/ui-style components** (`components/ui`), **motion** (Framer Motion), **next-themes** (dark default)
- **react-hook-form + zod** contact form, server action in `lib/actions/contact.ts`

## Run

```bash
npm run dev     # http://localhost:3000 → redirects to /en
npm run build   # production build (SSG for all locales)
```

## Structure

```
app/[locale]/         – pages: home, about, features, pricing, contact, legal/*
app/globals.css       – Tailwind v4 @theme tokens (brand colors, light/dark)
components/layout/    – header, footer, logo, theme & locale switcher
components/home/      – hero, pitch, feature grid, CTA banner
components/dashboard-preview/ – animated app preview (charts, stats, course cards)
messages/             – en.json, de.json, fr.json, es.json (all UI copy lives here)
lib/                  – utils, contact schema, contact server action
```

## Before public launch (placeholders)

- **Legal:** fill real address in `messages/*.json` → `legal.imprint` / `legal.privacy`
- **Logo:** replace SVG in `components/layout/logo.tsx` with final brand assets
- **Contact:** wire `lib/actions/contact.ts` to a mail provider
- **Favicon/OG:** replace `app/favicon.ico`; OG image is generated per locale in `app/[locale]/opengraph-image.tsx`
