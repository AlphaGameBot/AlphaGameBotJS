# AlphaGameBot Development Guide

## Important Notes
- When working, please make git commits automatically, using the Conventional Commits format.
  - Examples:
    - `feat: add new command to greet users`
    - `fix: resolve issue with event handling`
    - `docs: update development guide with new instructions`
    - `feat(web): implement new blog post rendering logic`
    
## Project Architecture

**Type**: Discord.js v14 bot using TypeScript with strict ESM modules (`"type": "module"` in package.json)

### Core Components
- **Entry point**: `src/main.ts` - Bot initialization, event registration, and lifecycle management
- **Command deployment**: `src/deploy-commands.ts` - Separate script to register slash commands with Discord API
- **Dynamic loading**: `src/utility/crawler.ts` - Crawls and imports commands/events at runtime
- **Interfaces**: `src/interfaces/{Command,Event}.ts` - Type contracts for extensibility

### Module Resolution: Critical
- Uses `NodeNext` module resolution with `.js` extensions in imports (even for `.ts` files)
- All imports must include `.js` extension: `import x from "./file.js"` not `"./file"`
- `tsc-alias` handles path mapping post-compilation

## Development Workflows

### Building & Running
```bash
npm run build        # TypeScript compile + tsc-alias
npm run build:start  # Build and start bot
npm run build:deploy # Build and deploy commands to Discord
npm start           # Run from dist/ (requires prior build)
npm run deploy      # Deploy commands from dist/
```

### Testing
- **Framework**: Jest with `ts-jest` preset for ESM
- **Location**: Tests colocated with source (e.g., `src/commands/test/hworld/hworld.test.ts`)
- **Run**: `npm test` (compiles TypeScript first, then runs Jest from `dist/`)
- **Pattern**: See `hworld.test.ts` for command testing - mock `ChatInputCommandInteraction` with jest functions

### Linting
```bash
npm run lint        # Check with ESLint
npm run lint:fix    # Auto-fix issues
```

## Adding New Features

### Commands
1. Create folder in `src/commands/<category>/<commandname>/`
2. Add `<commandname>.ts` implementing `Command` interface:
   ```typescript
   export default {
     data: new SlashCommandBuilder()
       .setName("commandname")
       .setDescription("..."),
     async execute(interaction: ChatInputCommandInteraction) {
       // implementation
     }
   } as Command;
   ```
3. `crawler.ts` auto-discovers commands by walking `commands/` folders
4. Run `npm run build:deploy` to register with Discord

### Events
1. Create `src/events/<EventName>.ts` implementing `EventHandler<T>`:
   ```typescript
   export default {
     name: Events.SomeEvent,
     once: false, // or true for one-time listeners
     execute: async (...args) => { /* handle event */ }
   } as EventHandler<Events.SomeEvent>;
   ```
2. `crawler.ts` auto-discovers top-level event files in `src/events/`

### Metrics
- Use `metricsManager.submitMetric<Metrics.X>(Metrics.X, data)` 
- Define metric types in `Metrics` enum and data shape in `MetricDataMap` interface
- Metrics auto-expire after 1 hour (cleaned every 10 minutes)

## Project Conventions

### Logging
- Default logger: `import logger from "./utility/logger.js"`
- Scoped logger: `const logger = getLogger("scope/name")`
- Log levels auto-adjust: debug in dev, info in production
- Format: `[timestamp] [scope/level]: message` (timestamp only in dev)

### File Headers
All source files include GPL-3.0-or-later license header (see existing files)

### Environment Variables
- `TOKEN`: Discord bot token (required)
- `NODE_ENV`: Controls logging verbosity (`production` or dev)
- Load with `await loadDotenv()` from `src/utility/debug/dotenv.ts`

### Dist Detection
`main.ts` checks for `./dist` folder and changes cwd if present - allows running from either compiled or source context

## Common Patterns

### Dual Source/Dist Support (crawler.ts)
Commands/events can load from `src/` (dev) or `dist/` (production):
```typescript
const distPath = path.join(projectRoot, "dist", "commands");
const foldersPath = existsSync(distPath) ? distPath : ".";
```

### Command Registration
Commands stored in `Collection<string, Command>` keyed by command name. The crawler validates `data` and `execute` properties exist.

### Event Wrappers
Events wrapped with timing metrics and verbose logging in `main.ts` before registration.

## Dependencies
- **discord.js**: v14.23.1 - Primary framework
- **winston**: v3.18.3 - Structured logging
- **TypeScript**: v5.9.3 - Strict mode enabled
- **Jest**: v30.2.0 - Testing with ESM support
