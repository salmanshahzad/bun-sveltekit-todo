import path from "node:path";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL ?? "",
    },
    out: "drizzle",
    schema: path.join("src", "lib", "server", "services", "schema.ts"),
});
