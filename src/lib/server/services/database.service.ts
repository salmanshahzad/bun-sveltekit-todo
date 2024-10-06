import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "redis";
import { inject, injectable, type Disposable } from "tsyringe-neo";

import { ConfigService } from "./config.service.ts";

@injectable()
export class DatabaseServiceFactory {
    constructor(
        @inject(ConfigService) private readonly configService: ConfigService,
    ) {}

    async create() {
        const pgConnection = postgres(this.configService.config.DATABASE_URL);
        const pg = drizzle(pgConnection);
        const redis = await createClient({
            url: this.configService.config.REDIS_URL,
        }).connect();
        return new DatabaseService(pg, pgConnection, redis);
    }
}

@injectable()
export class DatabaseService implements Disposable {
    readonly #pg;
    readonly #pgConnection;
    readonly #redis;

    constructor(
        pg: ReturnType<typeof drizzle>,
        pgConnection: ReturnType<typeof postgres>,
        redis: Awaited<ReturnType<ReturnType<typeof createClient>["connect"]>>,
    ) {
        this.#pg = pg;
        this.#pgConnection = pgConnection;
        this.#redis = redis;
    }

    get pg() {
        return this.#pg;
    }

    get redis() {
        return this.#redis;
    }

    async dispose() {
        await Promise.all([this.#pgConnection.end(), this.#redis.disconnect()]);
    }
}
