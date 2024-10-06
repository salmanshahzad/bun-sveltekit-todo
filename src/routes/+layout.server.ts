import { error, redirect } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

import { rpc } from "$lib/server/index.ts";
import type { LayoutServerLoad } from "./$types.ts";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export const load: LayoutServerLoad = async (event) => {
    const isVisitingPublicRoute = PUBLIC_ROUTES.includes(event.url.pathname);
    const res = await rpc.api.user.$get(undefined, { fetch: event.fetch });
    if (res.status === StatusCodes.INTERNAL_SERVER_ERROR) {
        error(res.status);
    }
    if (res.status === StatusCodes.UNAUTHORIZED) {
        if (!isVisitingPublicRoute) {
            const params = new URLSearchParams();
            params.set("redirect", event.url.pathname);
            redirect(StatusCodes.SEE_OTHER, `/signin?${params.toString()}`);
        }
        return undefined;
    }
    if (isVisitingPublicRoute) {
        redirect(StatusCodes.SEE_OTHER, "/todos");
    }
    const user = await res.json();
    return { user };
};
