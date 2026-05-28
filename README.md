# Bao 🥟

**Local agent kitchen** — a clean, local-first AI agent workspace where models, tools, sessions, and subagents are neatly wrapped into little baos.

Bao runs entirely on your machine. Conversations, agents, tool calls, and usage all live in a local SQLite database under `.bao/`. No cloud, no accounts, no telemetry.

## Features

- **Local-first persistence** — everything stored in `.bao/bao.db` (SQLite via Prisma).
- **Model providers** — Mock, OpenAI, Anthropic, DeepSeek, OpenRouter, and Ollama. Keys are read fresh on every call (no restart) and never leak to the frontend.
- **Plugins & tools** — filesystem (sandboxed to the project), memory, and an opt-in shell plugin (disabled by default, dangerous commands blocked).
- **Sessions & subagents** — chat or agent sessions, each with a cute code (e.g. `warm-bao-42`). Agents can spawn child subagents that get their own messages, events, usage, and tool calls.
- **Real-time UI** — a warm, rounded React interface driven by WebSocket events: live event timeline, token usage crumbs, child agent cards, and tool-call inspector.

## Architecture

A TypeScript monorepo with npm workspaces:

```
packages/shared      Shared Zod schemas + DTO types
apps/gateway         Fastify backend (HTTP + WebSocket) on 127.0.0.1:3820
apps/web             Vite + React + Tailwind frontend on 127.0.0.1:3821
prisma/schema.prisma SQLite schema (Session, Message, Event, Usage, ToolCall, Memory)
```

Local state lives in `.bao/`:

- `.bao/bao.db` — SQLite database
- `.bao/config.json` — non-secret config (default provider/model, tool toggles, budget cap)
- `.bao/secrets.json` — API keys (never returned by the API)

## Getting started

Requires Node.js 18+.

```bash
npm install        # install workspace dependencies
npm run db:generate # generate the Prisma client
npm run db:push     # create the local SQLite schema
npm run dev         # start gateway (3820) + web UI (3821)
```

Then open http://127.0.0.1:3821. On first visit you'll see the setup page — you can complete onboarding with the **Mock** provider and no API keys to try Bao immediately.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run gateway and web together |
| `npm run dev:gateway` | Run only the gateway |
| `npm run dev:web` | Run only the web UI |
| `npm run build` | Type-check and build all workspaces |
| `npm run typecheck` | Type-check all workspaces |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push the schema to the local SQLite database |

## Configuring providers

Open **Settings → Providers** in the UI to add API keys or base URLs:

- **OpenAI / Anthropic / DeepSeek / OpenRouter** — paste an API key.
- **Ollama** — set the base URL (defaults to `http://127.0.0.1:11434`); no key needed.
- **Mock** — always available, zero cost, useful for trying the app offline.

Keys are stored in `.bao/secrets.json` and are never sent back to the browser.
