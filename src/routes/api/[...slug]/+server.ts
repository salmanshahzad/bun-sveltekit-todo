import type { RequestHandler } from "@sveltejs/kit";

import { app } from "$lib/server/index.ts";

export const fallback: RequestHandler = ({ request }) => app.fetch(request);
