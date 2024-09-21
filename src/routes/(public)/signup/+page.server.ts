import { fail, redirect } from "@sveltejs/kit";
import argon2 from "argon2";
import postgres from "postgres";
import { z } from "zod";

import { db } from "$lib/server/db.ts";
import { users } from "$lib/server/schema.ts";
import { setSession } from "$lib/server/session.ts";
import { transformZodError } from "$lib/utils/error.ts";
import type { Actions } from "./$types.ts";

export const actions: Actions = {
    default: async (event) => {
        const formData = await event.request.formData();
        const payload = z
            .object({
                username: z
                    .string()
                    .trim()
                    .min(1, { message: "Username is required" }),
                password: z
                    .string()
                    .min(1, { message: "Password is required" }),
                confirmPassword: z.string(),
            })
            .refine(
                (schema) => {
                    return schema.password === schema.confirmPassword;
                },
                {
                    message: "Passwords do not match",
                    path: ["confirmPassword"],
                },
            )
            .safeParse(Object.fromEntries(formData.entries()));

        if (!payload.success) {
            return fail(422, { errors: transformZodError(payload.error) });
        }

        try {
            const [user] = await db
                .insert(users)
                .values({
                    username: payload.data.username,
                    password: await argon2.hash(payload.data.password),
                })
                .returning();
            if (!user) {
                throw new Error("Did not get user after creating");
            }
            await setSession(event, user.id);
        } catch (err) {
            if (err instanceof postgres.PostgresError && err.code === "23505") {
                return fail(422, {
                    errors: {
                        username: "Username is taken",
                    } as Record<string, string>,
                });
            }
            return fail(500);
        }
        redirect(303, "/todos");
    },
};
