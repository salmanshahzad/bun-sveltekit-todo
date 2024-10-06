import { error, fail } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

import { rpc } from "$lib/server/index.ts";
import type { Actions, PageServerLoad } from "./$types.ts";

export const load: PageServerLoad = async (event) => {
    const res = await rpc.api.todo.$get(undefined, { fetch: event.fetch });
    if (!res.ok) {
        error(res.status);
    }
    return await res.json();
};

export const actions: Actions = {
    add: async (event) => {
        const json = Object.fromEntries(await event.request.formData());
        // @ts-expect-error unvalidated json
        const res = await rpc.api.todo.$post({ json }, { fetch: event.fetch });
        if (res.status === StatusCodes.UNPROCESSABLE_ENTITY) {
            const data = await res.json();
            return fail(res.status, {
                action: "add",
                ...data,
            });
        }
        if (!res.ok) {
            return fail(res.status);
        }
        return null;
    },
    complete: async (event) => {
        const json = Object.fromEntries(await event.request.formData());
        const res = await rpc.api.todo[":id"].$patch(
            {
                json: { completed: json["completed"] === "true" },
                param: { id: json["id"]?.toString() ?? "" },
            },
            { fetch: event.fetch },
        );
        if (res.status === StatusCodes.UNPROCESSABLE_ENTITY) {
            const data = await res.json();
            return fail(res.status, {
                action: "complete",
                ...data,
            });
        }
        if (!res.ok) {
            return fail(res.status);
        }
        return null;
    },
    delete: async (event) => {
        const json = Object.fromEntries(await event.request.formData());
        const res = await rpc.api.todo[":id"].$delete(
            // @ts-expect-error unvalidated json
            { json, param: { id: json["id"] } },
            { fetch: event.fetch },
        );
        if (!res.ok) {
            return fail(res.status);
        }
        return null;
    },
    edit: async (event) => {
        const json = Object.fromEntries(await event.request.formData());
        const res = await rpc.api.todo[":id"].$patch(
            // @ts-expect-error unvalidated json
            { json, param: { id: json["id"] } },
            { fetch: event.fetch },
        );
        if (res.status === StatusCodes.UNPROCESSABLE_ENTITY) {
            const data = await res.json();
            return fail(res.status, {
                action: "edit",
                id: json["id"],
                ...data,
            });
        }
        if (!res.ok) {
            return fail(res.status);
        }
        return null;
    },
};
