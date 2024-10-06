import path from "node:path";

import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { building } from "$app/environment";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { hc } from "hono/client";
import { StatusCodes } from "http-status-codes";
import "reflect-metadata";
import { container } from "tsyringe-neo";

import { HealthController } from "./controllers/health.controller.ts";
import { SessionController } from "./controllers/session.controller.ts";
import { TodoController } from "./controllers/todo.controller.ts";
import { UserController } from "./controllers/user.controller.ts";
import { ConfigService } from "./services/config.service.ts";
import {
    DatabaseService,
    DatabaseServiceFactory,
} from "./services/database.service.ts";
import { LogService } from "./services/log.service.ts";

const databaseService = await container
    .resolve(DatabaseServiceFactory)
    .create();
container.register(DatabaseService, {
    useValue: databaseService,
});
if (!building) {
    await migrate(databaseService.pg, {
        migrationsFolder: path.join(
            import.meta.dirname,
            "..",
            "..",
            "..",
            "drizzle",
        ),
    });
}

export const app = new OpenAPIHono().basePath("/api");
app.openAPIRegistry.registerComponent("securitySchemes", "cookie", {
    in: "cookie",
    name: "session",
    type: "apiKey",
});

export const routes = app
    .route("/health", container.resolve(HealthController).routes())
    .route("/session", container.resolve(SessionController).routes())
    .route("/todo", container.resolve(TodoController).routes())
    .route("/user", container.resolve(UserController).routes());
export const rpc = hc<typeof routes>(
    container.resolve(ConfigService).config.ORIGIN,
);

app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        title: "Bun + SvelteKit To-Do API",
        version: "1.0.0",
    },
});
app.get("/docs", swaggerUI({ url: "/api/doc" }));

const logService = container.resolve(LogService);
app.onError((err, c) => {
    logService.logger.error(c.req.path, err);
    return c.json(undefined, StatusCodes.INTERNAL_SERVER_ERROR);
});

function shutdown() {
    void (async () => {
        try {
            await container.dispose();
            process.exit(0);
        } catch (err) {
            logService.logger.error("shutdown", err);
            process.exit(1);
        }
    })();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
