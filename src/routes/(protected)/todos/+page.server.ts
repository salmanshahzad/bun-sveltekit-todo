import { error, fail } from "@sveltejs/kit";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "$lib/server/db.ts";
import { logger } from "$lib/server/logger.ts";
import { todos } from "$lib/server/schema.ts";
import { transformZodError } from "$lib/utils/error.ts";
import type { Actions, PageServerLoad } from "./$types.ts";

export const load: PageServerLoad = async (event) => {
    try {
        if (!event.locals.userId) {
            error(401);
        }

        const userTodos = await db
            .select()
            .from(todos)
            .where(eq(todos.userId, event.locals.userId))
            .orderBy(asc(todos.id));
        return { todos: userTodos };
    } catch (err) {
        logger.error("get todos", err);
        error(500);
    }
};

export const actions: Actions = {
    add: async (event) => {
        if (!event.locals.userId) {
            return fail(401);
        }

        const formData = await event.request.formData();
        const payload = z
            .object({
                todo: z
                    .string()
                    .trim()
                    .min(1, { message: "Todo cannot be empty" }),
            })
            .safeParse(Object.fromEntries(formData.entries()));
        if (!payload.success) {
            return fail(422, {
                action: "add",
                errors: transformZodError(payload.error),
            });
        }

        try {
            await db.insert(todos).values({
                name: payload.data.todo,
                userId: event.locals.userId,
            });
            return null;
        } catch (err) {
            logger.error("add todo", err);
            return fail(500);
        }
    },
    complete: async (event) => {
        if (!event.locals.userId) {
            return fail(401);
        }

        const formData = await event.request.formData();
        const payload = z
            .object({
                completed: z.enum(["true", "false"]),
                id: z.coerce.number().int().min(1),
            })
            .safeParse(Object.fromEntries(formData.entries()));
        if (!payload.success) {
            return fail(422, {
                action: "complete",
                id: formData.get("id")?.toString(),
                errors: transformZodError(payload.error),
            });
        }

        try {
            await db
                .update(todos)
                .set({
                    completed: payload.data.completed === "true",
                })
                .where(eq(todos.id, payload.data.id));
            return null;
        } catch (err) {
            logger.error("complete todo", err);
            return fail(500);
        }
    },
    delete: async (event) => {
        if (!event.locals.userId) {
            return fail(401);
        }

        const formData = await event.request.formData();
        const payload = z
            .object({
                id: z.coerce.number().int().min(1),
            })
            .safeParse(Object.fromEntries(formData.entries()));
        if (!payload.success) {
            return fail(422, {
                action: "delete",
                id: formData.get("id")?.toString(),
                errors: transformZodError(payload.error),
            });
        }

        try {
            await db.delete(todos).where(eq(todos.id, payload.data.id));
            return null;
        } catch (err) {
            logger.error("delete todo", err);
            return fail(500);
        }
    },
    edit: async (event) => {
        if (!event.locals.userId) {
            return fail(401);
        }

        const formData = await event.request.formData();
        const payload = z
            .object({
                id: z.coerce.number().int().min(1),
                todo: z
                    .string()
                    .trim()
                    .min(1, { message: "Todo cannot be empty" }),
            })
            .safeParse(Object.fromEntries(formData.entries()));
        if (!payload.success) {
            return fail(422, {
                action: "edit",
                id: formData.get("id")?.toString(),
                errors: transformZodError(payload.error),
            });
        }

        try {
            await db
                .update(todos)
                .set({
                    name: payload.data.todo,
                })
                .where(eq(todos.id, payload.data.id));
            return null;
        } catch (err) {
            logger.error("update todo", err);
            return fail(500);
        }
    },
};
