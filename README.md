# Bun + SvelteKit To-do

This is a to-do list web application using Bun and SvelteKit.

It serves as a boilerplate for the following:

-   Backend server using Hono and dependency injection
-   PostgreSQL database connection with Drizzle ORM
-   User authentication through cookie-based sessions backed by Redis
-   Styling using Tailwind CSS and Daisy UI
-   Linting using ESLint
-   Code formatting using Prettier

## Environment Variables

See `src/lib/server/services/config.service.ts` for required environment variables

## Run in Development

```sh
bun install
bun dev
```

## Build and Run

```sh
bun install
bun run build
bun start
```

## Run with Docker

```sh
docker compose up
```
