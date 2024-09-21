import { error, fail, redirect } from "@sveltejs/kit";

import { logger } from "$lib/server/logger.ts";
import { destroySession } from "$lib/server/session.ts";
import type { Actions, PageServerLoad } from "./$types.ts";

export const load: PageServerLoad = async (event) => {
    try {
        await destroySession(event);
    } catch (err) {
        logger.error("destroy session", err);
        error(500);
    }
    redirect(303, "/");
};

export const actions: Actions = {
    default: async (event) => {
        try {
            await destroySession(event);
        } catch (err) {
            logger.error("destroy session", err);
            return fail(500);
        }
        redirect(303, "/");
    },
};
