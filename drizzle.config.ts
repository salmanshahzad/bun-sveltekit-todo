import path from "node:path";

import { defineConfig } from "drizzle-kit";

import { env } from "./src/lib/server/env.ts";

export default defineConfig({
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    out: "drizzle",
    schema: path.join("src", "lib", "server", "schema.ts"),
});
