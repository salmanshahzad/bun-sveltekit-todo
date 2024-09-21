import { eq } from "drizzle-orm";

import { db } from "$lib/server/db.ts";
import { logger } from "$lib/server/logger.ts";
import { users } from "$lib/server/schema.ts";
import type { LayoutServerLoad } from "./$types.ts";
import { fail } from "@sveltejs/kit";

export const load: LayoutServerLoad = async (event) => {
    if (!event.locals.userId) {
        return { user: undefined };
    }

    try {
        const [user] = await db
            .select({ id: users.id, username: users.username })
            .from(users)
            .where(eq(users.id, event.locals.userId));
        if (!user) {
            return fail(500);
        }
        return { user };
    } catch (err) {
        logger.error("get user", err);
        return fail(500);
    }
};
