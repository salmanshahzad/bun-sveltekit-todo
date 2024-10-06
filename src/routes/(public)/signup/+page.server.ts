import { fail, redirect } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

import { rpc } from "$lib/server/index.ts";
import type { Actions } from "./$types.ts";

export const actions: Actions = {
    default: async (event) => {
        const json = Object.fromEntries(await event.request.formData());
        // @ts-expect-error unvalidated json
        const res = await rpc.api.user.$post({ json }, { fetch: event.fetch });
        if (res.status === StatusCodes.INTERNAL_SERVER_ERROR) {
            return fail(res.status);
        }
        if (res.status === StatusCodes.UNPROCESSABLE_ENTITY) {
            return fail(res.status, await res.json());
        }
        redirect(StatusCodes.SEE_OTHER, "/todos");
    },
};
