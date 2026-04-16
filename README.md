# MUNify STOCK

> **S**ystem for **T**racking and **O**rganization of **C**ontainers and **K**artons

MUNify STOCK is inventory management software for Model United Nations conferences, part of the [MUNify](https://github.com/DeutscheModelUnitedNations) ecosystem by [Deutsche Model United Nations (DMUN) e.V.](https://dmun.de)

## Features

- **Inventory Management** — Track items, containers, and locations with full CRUD
- **QR Code / Barcode Scanning** — Scan and generate QR codes for items and containers
- **Flag Management** — Dedicated country flag inventory with checklist workflow
- **General Inventory Sessions** — Container-based inventory with conflict detection
- **Audit Trail** — Full change history per entity, browsable in the UI
- **Global Search** — Fuzzy search across items, containers, and flags (Cmd+K)
- **i18n** — German and English via Paraglide
- **DMUN Corporate Identity** — Shared theme with light/dark mode

## Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5 (runes), Tailwind CSS 4, DaisyUI 5
- **Backend**: GraphQL via [rumble](https://github.com/m1212e/rumble) (Pothos + GraphQL Yoga)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: OIDC via `@logto/sveltekit` (Logto) + M2M bearer token support
- **GraphQL Client**: rumble's built-in client generator (URQL-based)

## Develop Locally

### Prerequisites

- [Bun](https://bun.sh) (package manager & runtime)
- [Docker](https://www.docker.com/) (for PostgreSQL)
- [mkcert](https://github.com/FiloSottile/mkcert) (for local HTTPS)

### Setup

```bash
# 1. Install dependencies
bun install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Logto credentials and database URL

# 3. Generate local HTTPS certificates (required)
mkcert -install
mkdir -p .certs
mkcert -key-file .certs/key.pem -cert-file .certs/cert.pem localhost 127.0.0.1 ::1

# 4. Start PostgreSQL, then dev server
bun run dev

# 5. Push database schema
bun run db:push

# 6. Generate the GraphQL client (dev server must be running)
bun run generate:client
```

The app will be available at `https://localhost:5173`. You'll need a Logto instance configured (see `.env.example`).

> **Why HTTPS in dev?** The app uses Server-Sent Events (SSE) for live GraphQL subscriptions, with each subscription holding an open HTTP connection. Browsers limit concurrent connections to ~6 per origin on HTTP/1.1, which the app easily exceeds. HTTPS enables HTTP/2, which multiplexes all requests over a single connection and eliminates this limit.

### Scripts

| Command                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `bun run dev`             | Start Docker + dev server                                   |
| `bun run dev:server`      | Dev server only (no Docker)                                 |
| `bun run build`           | Production build                                            |
| `bun run check`           | Svelte + TypeScript type checking                           |
| `bun run lint`            | Prettier + ESLint check                                     |
| `bun run format`          | Auto-format all files                                       |
| `bun run generate:client` | Generate typed GraphQL client (requires running dev server) |
| `bun run db:push`         | Push Drizzle schema to database                             |
| `bun run db:migrate`      | Run Drizzle migrations                                      |
| `bun run db:studio`       | Open Drizzle Studio (DB GUI)                                |

### Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable                      | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `DATABASE_URL`                | PostgreSQL connection string                     |
| `PUBLIC_LOGTO_ENDPOINT`       | Logto instance URL                               |
| `PUBLIC_LOGTO_APP_ID`         | Logto application ID                             |
| `LOGTO_APP_SECRET`            | Logto application secret                         |
| `LOGTO_COOKIE_ENCRYPTION_KEY` | Random string for session cookie encryption      |
| `LOGTO_ROLE_CLAIM`            | JWT claim name for roles                         |
| `LOGTO_API_RESOURCE`          | API resource identifier for M2M token validation |
| `ACCESS_DOMAIN_WHITELIST`     | Comma-separated email domains for app access     |

## FAQ

**Can I use this for my conference outside of DMUN?**

Yes. We encourage and allow usage for other conferences. Please see our license for more detailed information. Note that the project is still under development. If you are interested in using it, please contact us via the discussion section of this repository.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on commits, branches, and pull requests.

## License

This aspect is work in progress since the project is currently in its development phase. See [LICENSE](LICENSE).

## Support / Donations

You can support our work by donating to [DMUN e.V.](https://dmun.de). Contact [vorstand@dmun.de](mailto:vorstand@dmun.de) for details.
