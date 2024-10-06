import { OpenAPIHono } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";

import { transformZodError } from "../utils/error.ts";

interface Context {
    userId: number;
}

export abstract class Controller {
    protected readonly router = new OpenAPIHono<{ Variables: Context }>({
        defaultHook: (result, c) => {
            if (!result.success) {
                return c.json(
                    { errors: transformZodError(result.error) },
                    StatusCodes.UNPROCESSABLE_ENTITY,
                );
            }
            return;
        },
    });

    abstract routes(): OpenAPIHono<{ Variables: Context }>;
}
