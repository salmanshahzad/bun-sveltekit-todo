import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "redis";

import { env } from "$lib/server/env.ts";
import * as schema from "$lib/server/schema.ts";

export const connection = postgres(env.DATABASE_URL);
export const db = drizzle(connection, { schema });
export const redis = await createClient({ url: env.REDIS_URL }).connect();
