# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Database (Postgres)

This project uses Prisma. Set `DATABASE_URL` to a Postgres connection string (see `.env.example`).

### Local dev

If you have Docker installed, you can start Postgres locally:

```bash
docker compose up -d
npx prisma migrate deploy
npx prisma generate
```

### Render deploy

- Provision a Postgres database on Render.
- Set `DATABASE_URL` on the Render Web Service (prefer the **Internal Database URL**).
- Run migrations at startup:

```bash
npx prisma migrate deploy
```

## Development Server

Start the development server:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
