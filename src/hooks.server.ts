import path from "node:path";

import { dev } from "$app/environment";
import { type Handle, redirect } from "@sveltejs/kit";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { connection, db, redis } from "$lib/server/db.ts";
import { logger } from "$lib/server/logger.ts";
import { renewSession } from "$lib/server/session.ts";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

const migrationsFolder = dev
    ? path.join(import.meta.dirname, "..", "drizzle")
    : path.join(import.meta.dirname, "..", "..", "..", "drizzle");
await migrate(db, { migrationsFolder });

export const handle: Handle = async (input) => {
    try {
        const { userId } = await renewSession(input.event);
        input.event.locals.userId = userId;
    } catch (err) {
        logger.error("renew session", err);
    }

    const isVisitingPublicRoute = PUBLIC_ROUTES.includes(
        input.event.url.pathname,
    );
    if (input.event.locals.userId && isVisitingPublicRoute) {
        redirect(303, "/todos");
    } else if (!(input.event.locals.userId || isVisitingPublicRoute)) {
        const params = new URLSearchParams();
        params.set("redirect", input.event.url.pathname);
        redirect(303, `/signin?${params.toString()}`);
    }

    return input.resolve(input.event, {
        transformPageChunk: ({ html }) => {
            const theme = input.event.cookies.get("theme");
            if (theme === "light") {
                return html.replace(`data-theme="dark"`, `data-theme="light"`);
            }
            return html;
        },
    });
};

function shutdown(): void {
    (async () => {
        logger.info("shutting down server");
        await connection.end();
        await redis.disconnect();
        logger.info("shutdown complete");
        process.exit(0);
    })().catch((err: unknown) => {
        logger.error("shutdown", err);
        process.exit(1);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
