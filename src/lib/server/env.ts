import { z } from "zod";

export const env = z
    .object({
        COOKIE_SECRET: z.string(),
        DATABASE_URL: z.string().url(),
        ORIGIN: z.string().url(),
        PORT: z.coerce.number().int().min(0).max(65535),
        REDIS_URL: z.string().url(),
    })
    .parse(process.env);
