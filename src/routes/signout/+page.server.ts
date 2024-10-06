import { error, fail, redirect } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

import { rpc } from "$lib/server/index.ts";
import type { Actions, PageServerLoad } from "./$types.ts";

export const load: PageServerLoad = async (event) => {
    const res = await rpc.api.session.$delete(undefined, {
        fetch: event.fetch,
    });
    if (res.status === StatusCodes.INTERNAL_SERVER_ERROR) {
        error(res.status);
    }
    redirect(StatusCodes.SEE_OTHER, "/");
};

export const actions: Actions = {
    default: async (event) => {
        const res = await rpc.api.session.$delete(undefined, {
            fetch: event.fetch,
        });
        if (res.status === StatusCodes.INTERNAL_SERVER_ERROR) {
            return fail(res.status);
        }
        redirect(StatusCodes.SEE_OTHER, "/");
    },
};
