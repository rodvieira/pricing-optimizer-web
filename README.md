# Pricing Optimizer — Web

Next.js frontend for [Pricing Optimizer](../HANDOFF.md): paste a product URL, get three
AI-generated pricing-page variations streamed live, compare them, export as
JSX/HTML/Stripe Pricing Table config.

Backend: [`pricing-optimizer-api`](https://github.com/rodvieira/pricing-optimizer-api)
(Go), consumed via the contract in `openapi.yaml`.

## Stack

Next.js (App Router, TypeScript strict), Tailwind CSS v4, [Astryx](https://astryx.atmeta.com/)
(Meta's React design system), TanStack Query, react-hook-form + Zod, Biome, pnpm.

## Development

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if the backend isn't on :8080
pnpm install
pnpm dev
```

Requires the backend running locally (`pricing-optimizer-api`, `go run ./cmd/api`) for
any real functionality — this app has no server-side logic of its own.

## Architecture

See `CLAUDE.md` for the full architecture writeup (domain/features/components/lib/app
layering, the SSE consumption approach, dark/light theme mechanism).

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` / `pnpm start` — production build/serve
- `pnpm exec biome check --write .` — lint + format
- `pnpm exec tsc --noEmit` — typecheck
