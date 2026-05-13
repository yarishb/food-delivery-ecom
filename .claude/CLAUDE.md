# CLAUDE.md — Food Delivery AI Assistant (Diploma Project)

## Project Overview

AI-powered assistant for food delivery service managers. The system combines a Medusa.js v2 e-commerce backend with a RAG (Retrieval-Augmented Generation) pipeline that lets managers ask natural-language questions and execute real actions (toggle dishes, create discounts, check orders) through function calling.

**Status:** Medusa v2 foundation built. AI/RAG service layer is in development.

---

## Repository Structure

```
diploma/
├── docker-compose.yml         # PostgreSQL 15 for local dev
├── .env                       # Docker env vars (POSTGRES_USER/PASSWORD/DB)
└── medusa-app/                # Turborepo monorepo (npm workspaces)
    ├── turbo.json
    ├── package.json           # packageManager: npm@11.12.1
    └── apps/
        ├── backend/           # Medusa.js v2 — products, orders, discounts
        │   └── src/
        │       ├── api/
        │       │   ├── admin/ # Custom admin REST routes
        │       │   └── store/ # Custom storefront REST routes
        │       ├── admin/     # Medusa Admin UI widgets/pages
        │       ├── jobs/      # Cron jobs (proactive alerts go here)
        │       ├── modules/   # Custom Medusa modules
        │       ├── subscribers/  # Event-driven hooks (webhooks → ChromaDB sync)
        │       ├── workflows/ # Medusa workflows (reusable business logic)
        │       └── migration-scripts/  # Data seeding
        ├── storefront/        # Next.js 14 App Router — customer-facing UI
        │   └── src/
        │       ├── app/[countryCode]/  # Country-scoped routing
        │       ├── lib/               # Data fetching, hooks, utils
        │       └── modules/           # Feature modules (cart, account, etc.)
        └── ai-service/        # PLANNED: NestJS RAG + WebSocket chat service
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Store backend | Medusa.js v2 (`@medusajs/medusa`) |
| Storefront | Next.js 14 App Router, Tailwind CSS, shadcn/ui |
| AI service (planned) | NestJS, LangChain.js, Groq API |
| LLM | Groq API — `llama-3.1-8b-instant` or `gemma2-9b-it` |
| Embeddings | `nomic-embed-text` via Ollama |
| Vector DB | ChromaDB (Docker) |
| Database | PostgreSQL 15 — local docker, Supabase cloud (planned) |
| Monorepo | Turborepo + npm workspaces |
| Build | Node.js ≥ 20 |

---

## Commands

All commands run from `medusa-app/`:

```bash
npm run dev              # all apps concurrently (Turbo)
npm run backend:dev      # Medusa backend only
npm run storefront:dev   # Next.js storefront only
npm run build            # build all apps
npm run lint             # lint all apps
npm run backend:seed     # seed initial store data (run once after migrate)
```

Local infrastructure (from repo root `diploma/`):

```bash
docker compose up -d     # start PostgreSQL
docker compose down      # stop PostgreSQL
```

---

## Medusa v2 Conventions

**Route files** — named HTTP method exports, file = route path:
```
src/api/admin/rag/route.ts  →  GET/POST /admin/rag
```

**Workflow pattern** — composable steps, used for any multi-step business logic:
```ts
import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
```

**Jobs (cron)** — files in `src/jobs/`, export default async function with `config.schedule`.

**Subscribers** — files in `src/subscribers/`, handle events like `product.updated` (used to sync ChromaDB).

**Module registration** — use `ContainerRegistrationKeys` / `ModuleRegistrationName` from `@medusajs/framework/utils`.

**HTTP types** — always import `MedusaRequest`, `MedusaResponse` from `@medusajs/framework/http`.

**Workspace names:** `@green-balance/backend`, `@green-balance/storefront`

---

## Domain Mapping (Medusa → Food Delivery)

| Medusa concept | Food delivery meaning |
|---|---|
| `Product` | Dish |
| `ProductCategory` | Menu section |
| `Discount` | Promotion / coupon |
| `Order` | Delivery order |
| `Variant` | Dish size / portion option |

---

## Planned AI/RAG Architecture

```
Manager → Chat UI (Next.js WebSocket)
         ↓
  NestJS AI Service (apps/ai-service)
         ↓
  Smart Query Router
  ├── Question  → LangChain RAG → ChromaDB → Groq LLM → answer + sources
  ├── Command   → Function Calling → Medusa Admin API → action result
  └── Analytics → SQL → PostgreSQL → formatted data
```

**ChromaDB collections (planned):** `menu`, `faq`, `analytics`, `policies`

**Function tools (planned):** `toggle_dish`, `create_discount`, `update_price`, `get_order_details`

**RAG log schema (planned):** `rag_logs(query, retrieved_chunks, scores, latency_ms, model, created_at)`

---

## Environment Variables

```
# diploma/.env  (docker-compose)
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# medusa-app/apps/backend/.env
DATABASE_URL=
MEDUSA_ADMIN_ONBOARDING_TYPE=default

# medusa-app/apps/storefront/.env.local
NEXT_PUBLIC_MEDUSA_BACKEND_URL=
NEXT_PUBLIC_PUBLISHABLE_KEY=

# apps/ai-service/.env  (planned)
GROQ_API_KEY=
CHROMA_URL=
OLLAMA_BASE_URL=
MEDUSA_BACKEND_URL=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

---

## Code Conventions

- TypeScript everywhere, strict mode
- File names: `kebab-case`
- Components: `PascalCase`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`)
- REST endpoints: `/api/v1/...` (AI service), Medusa built-in routing (store/backend)
- No custom modules unless Medusa's built-in service doesn't cover the use case

---

## Key Rules for Claude Code

- **Package manager is npm**, not pnpm — use `npm run` and `npm install`
- **Medusa v2**, not v1 — APIs are completely different; always check `@medusajs/framework` imports
- **RAG logic** will live in `apps/ai-service/` — do not duplicate in backend
- **Subscribers** are the correct place for webhook → ChromaDB sync logic, not jobs
- **Jobs** are for time-triggered work (proactive alerts, inventory checks)
- Before adding any new Medusa functionality, check if a built-in workflow exists in `@medusajs/medusa/core-flows`
- Storefront uses Next.js App Router — no `pages/` directory, no `getServerSideProps`
- Country-code routing: all main pages live under `app/[countryCode]/(main)/`

---

## Core Principles

- Correctness over minimal diffs
- Prefer existing patterns over new abstractions
- Keep changes small, focused, and safe
- Do not modify unrelated code
- Verify before introducing new dependencies or patterns
- Match existing project style — reuse utilities, avoid premature abstractions




## Efficiency rules:

- Read as few files as possible
- Prefer symbol/import search over file scanning
- Never scan entire directories unless necessary
- Open full files only when required
- Start from filenames → symbols → targeted search → file read
- Explain before broad file reads

## Search strategy:

- Use precise queries (functions, classes, exports, variables)
- Narrow results instead of expanding scope
- Avoid exploratory browsing of codebase

## Diff & change rules:

- Provide minimal, targeted patches
- Do not reformat or reorder unrelated code
- Preserve APIs, naming, and structure
- Group related changes into one patch
- Prefer diffs over full file rewrites

## Safety & correctness:

- Do not assume unseen APIs, runtime behavior, or structure
- Verify before introducing new dependencies or patterns
- If uncertain, ask before proceeding
- Avoid risky shortcuts for smaller diffs

## Performance awareness:

- Avoid unnecessary O(n²) patterns in hot paths
- Prefer early returns and lazy evaluation where appropriate
- Do not introduce synchronous bottlenecks in async code

## Code style:

- Match existing project style (JavaScript or TypeScript)
- Reuse existing utilities and patterns
- Avoid new abstractions unless requested or clearly justified
- Keep solutions simple and idiomatic to the codebase
