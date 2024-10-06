import { injectable } from "tsyringe-neo";
import { z } from "zod";

@injectable()
export class ConfigService {
    readonly #config;

    constructor() {
        this.#config = z
            .object({
                COOKIE_SECRET: z.string(),
                DATABASE_URL: z.string().url(),
                ORIGIN: z.string().url(),
                PORT: z.coerce.number().int().min(0).max(65535),
                REDIS_URL: z.string().url(),
            })
            .parse(process.env);
    }

    get config() {
        return this.#config;
    }
}
