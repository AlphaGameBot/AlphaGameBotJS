# AlphaGameBot Development Guide

## Monorepo Structure
This is an **npm workspaces monorepo** with two independent packages sharing common dependencies:

```
Monorepo/
├── package.json          # Root workspace config
├── tsconfig.json         # Shared TypeScript base config
├── eslint.config.ts      # Shared ESLint config
├── jest.config.mjs       # Shared Jest config
├── prisma/               # Shared database schema
│   └── schema.prisma     # Used by both bot and web
├── bot/                  # Discord bot package
│   ├── package.json      # Bot-specific dependencies
│   ├── tsconfig.json     # Extends root config
│   └── src/              # Bot source code
└── web/                  # Next.js web interface
    ├── package.json      # Web-specific dependencies
    ├── tsconfig.json     # Extends root config
    └── app/              # Next.js App Router
```

### Key Characteristics
- **Shared Prisma Schema**: Both packages use the same PostgreSQL database models
- **Independent Builds**: Each package compiles separately (`bot/dist/`, `web/.next/`)
- **Shared Dev Tools**: ESLint, TypeScript, Jest configs inherited from root
- **Separate Dockerfiles**: `bot/Dockerfile` and `web/Dockerfile` for independent deployment

### Root-level Commands
Run from monorepo root (`/home/damien/alphagamebot/Monorepo/`):
- `npm run bootstrap` - Fresh install + build all workspaces
- `npm run build` - Build bot and web packages
- `npm test` - Run tests in all workspaces  
- `npm run lint` - Lint all workspaces

### Package-specific Commands
Navigate to package directory first (`cd bot/` or `cd web/`), then use package scripts.

## Working in the Monorepo

### File Path Context
- Always be aware whether you're in the **root** (`/Monorepo/`) or a **package** (`/Monorepo/bot/`, `/Monorepo/web/`)
- When running commands, ensure you're in the correct directory
- Root commands affect all workspaces; package commands are scoped

### Shared vs Package-specific
**Shared across packages:**
- `prisma/schema.prisma` - Database models (generate client in each package)
- `tsconfig.json` - Base TypeScript config
- `eslint.config.ts` - Linting rules
- `jest.config.mjs` - Test configuration

**Package-specific:**
- `bot/src/` - Bot implementation code
- `web/app/` - Next.js pages and components
- `bot/dist/` - Compiled bot output
- `web/.next/` - Next.js build output
- Each package has its own `node_modules/` (managed by npm workspaces)

### Making Changes Across Packages
- If modifying `prisma/schema.prisma`, run migrations from **root** or **bot/** directory
- Both packages will need `npx prisma generate` to update their Prisma clients
- Config changes in root (ESLint, TypeScript) affect both packages
- Each package can override configs locally if needed

## Critical: Module Resolution (ESM)
- **MUST** use `.js` extensions in imports, even for `.ts` files: `import x from "./file.js"`
- Uses `"type": "module"` with `NodeNext` module resolution
- Imports without `.js` will fail at runtime

## Bot Architecture (`bot/`)

### Core System
- **Entry**: `src/main.ts` - Initializes client, registers events, handles lifecycle
- **Client**: `src/client.ts` - Exports singleton `client` with intents, `gracefulExit()` for shutdown
- **Dynamic loading**: `src/utility/crawler.ts` - Auto-discovers commands/events from filesystem
  - Commands: walks `src/commands/<category>/<name>/<name>.ts`
  - Events: imports top-level files in `src/events/`
  - Supports both `src/` (dev) and `dist/` (production) contexts

### Database (Prisma + PostgreSQL)
- **Schema**: `prisma/schema.prisma` - Models: `User`, `Guild`, `UserStats`, `ErrorReport`
- **Client**: `src/utility/database.ts` - Exports singleton Prisma client
- **Helpers**: `src/utility/dbHelpers.ts` - `ensureUser(tx, user)`, `ensureGuild(tx, guild)` for upserts
- **Transaction pattern**: Always wrap DB operations in `prisma.$transaction(async (tx) => { ... })`
  - Pass `tx` to helper functions instead of using global `prisma` directly
- **Lazy population**: `src/subsystems/lazyPopulation.ts` - Backfills user stats on first activity
- **Schema changes**: Run `npx prisma migrate dev --name <name> --create-only` to generate migration file
  - Review migration SQL before applying to production

### Commands & Events
**Commands**: `src/commands/<category>/<name>/<name>.ts`
```typescript
export default {
  data: new SlashCommandBuilder().setName("name").setDescription("..."),
  async execute(interaction: ChatInputCommandInteraction) { /* ... */ }
} as Command;
```
- Auto-discovered by crawler - no registration needed
- Deploy to Discord: `npm run build:deploy` (compiles + runs `deploy-commands.js`)

**Events**: `src/events/<EventName>.ts`
```typescript
export default {
  name: Events.SomeEvent,
  once: false,
  execute: async (...args) => { /* ... */ }
} as EventHandler<Events.SomeEvent>;
```

### Logging Infrastructure
- **Factory**: `getLogger("scope/name")` from `src/utility/logging/logger.ts`
- **Naming**: Use `scope/name` format: `commands/ping`, `events/MessageCreate`, `subsystems/lazyPopulation`
- **Transports**: Console (color in dev, plain in prod) + Loki (if `LOKI_URL` set)
- **Levels**: `error`, `warn`, `info`, `verbose`, `debug`, `silly` (auto-adjusts by `NODE_ENV`)
- **Discord.js logs**: Forwarded to Loki logger at `discordjs` scope

### Metrics System
- **Submit**: `metricsManager.submitMetric<Metrics.X>(Metrics.X, data)`
- **Define**: Add to `Metrics` enum + `MetricDataMap` interface in `src/interfaces/metrics/`
- **Export**: Prometheus scrape endpoint on port 9100 via `src/services/metrics/exports/prometheus.ts`
- **Lifecycle**: Auto-cleanup after 1 hour (every 10 minutes)

### Error Reporting
- **GitHub Issues**: `src/subsystems/error-reporting/issue.ts` creates issues via Octokit
- **Template**: `bot/assets/error-report-template.md.njk` (Nunjucks)
- **Requires**: `GITHUB_PAT` env var for AlphaGameBot/Issues repo access
- **Flow**: User errors → DB (`ErrorReport`) → GitHub issue with report ID `[AGB-####]`

## Development Workflows

### Bot-specific Commands
```bash
cd bot
npm run build:clean  # Remove dist/ and recompile
npm run build:start  # Compile + start bot
npm run build:deploy # Compile + deploy commands to Discord
npm test            # Run Jest tests (ESM mode, compiles first)
```

### Testing
- **Framework**: Jest with `ts-jest` preset for ESM
- **Location**: Colocated with source (`*.test.ts` files excluded from dist)
- **Pattern**: Mock `ChatInputCommandInteraction` with Jest - see `src/commands/basic/hworld/hworld.test.ts`
- **Run**: `npm test` from `bot/` (sets `NODE_ENV=test`, uses `../jest.config.mjs`)

### Environment Variables
- `TOKEN` - Discord bot token (required)
- `DATABASE_URL` - PostgreSQL connection string (required)
- `GITHUB_PAT` - GitHub token for error reporting (optional)
- `ERROR_WEBHOOK_URL` - Discord webhook for error logs (optional)
- `LOKI_URL` - Loki endpoint for log aggregation (optional)
- `NODE_ENV` - `production` or `development` (affects logging verbosity)

## Project Conventions

### Git Commits
- **Format**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Atomicity**: Each commit should be self-contained and reviewable
- **Diffs**: Keep changes focused to avoid large monolithic commits

### File Headers
All `.ts` files include GPL-3.0-or-later license header (see existing files)

### Code Style
- **Logging**: Always use `getLogger("scope/name")` - never `console.log()`
- **DB access**: Use `ensureUser(tx, user)` / `ensureGuild(tx, guild)` for upserts
- **Metrics**: Submit key events via `metricsManager` for observability
- **Testing**: Write `.test.ts` files alongside implementation - mock external APIs/interactions

## Common Patterns

### Dual Context Support
Code runs from either `src/` (dev) or `dist/` (production):
- `main.ts` detects `dist/` folder and changes cwd if present
- `crawler.ts` checks for `dist/commands` before falling back to `src/commands`

### Event Lifecycle in main.ts
- Registers raw event listener for metrics: `client.on("raw", ...)` 
- Ensures all users in events are added to DB via `ensureUser()`
- Wraps discovered events with timing metrics and error handling

### Subsystems
- **Rotating Status**: `src/subsystems/rotatingStatus.ts` - Cycles bot status messages
- **Lazy Population**: `src/subsystems/lazyPopulation.ts` - Backfills user stats from Discord API
- Both are async operations that run in background after bot ready

## Web Package (`web/`)

### Architecture
- **Framework**: Next.js 16 with App Router + React 19 + Tailwind CSS 4
- **Structure**: App Router with `app/` directory
  - `app/page.tsx` - Homepage
  - `app/about/` - About page
  - `app/contact/` - Contact page with form submission
  - `app/api/` - API routes (stats, system-status, addTheBot)
  - `app/components/` - Reusable React components
  - `app/lib/database.ts` - Prisma client singleton for web

### Database Access
- **Shared Schema**: Uses root `prisma/schema.prisma` (same as bot)
- **Client**: `app/lib/database.ts` exports Prisma client singleton
- **Pattern**: Import from `app/lib/database.ts` in API routes/server components
- Both bot and web packages share the same database models

### Development
```bash
cd web
npm run dev    # Start dev server on port 4000
npm run build  # Build for production
npm start      # Run production build
npm run lint   # Lint with ESLint
```

### Configuration
- **Turbopack root**: Configured in `next.config.ts` to point to monorepo root
- **Ports**: Dev server runs on 4000, production on 3000
- **Docker**: Separate `web/Dockerfile` with multi-stage build
- **TypeScript**: Extends root `tsconfig.json` with web-specific overrides

### Deployment
- Production build copied to Docker image with Prisma client
- Environment variables: `DATABASE_URL`, `BUILD_NUMBER`, `VERSION`
- Exposed on port 3000 in container
