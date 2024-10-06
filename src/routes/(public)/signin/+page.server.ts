import { fail, redirect } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

import { rpc } from "$lib/server/index.ts";
import type { Actions } from "./$types.ts";

export const actions: Actions = {
    default: async (event) => {
        const json = Object.fromEntries(await event.request.formData());
        const res = await rpc.api.session.$post(
            // @ts-expect-error unvalidated json
            { json },
            { fetch: event.fetch },
        );
        if (res.status === StatusCodes.INTERNAL_SERVER_ERROR) {
            return fail(res.status);
        }
        if (!res.ok) {
            return fail(res.status, await res.json());
        }
        const path = event.url.searchParams.get("redirect") ?? "/todos";
        redirect(StatusCodes.SEE_OTHER, path);
    },
};
