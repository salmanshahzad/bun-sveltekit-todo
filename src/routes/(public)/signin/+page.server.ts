import { fail, redirect } from "@sveltejs/kit";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
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
            })
            .safeParse(Object.fromEntries(formData.entries()));

        if (!payload.success) {
            return fail(422, { errors: transformZodError(payload.error) });
        }

        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.username, payload.data.username));
            const isPasswordValid = user
                ? await argon2.verify(user.password, payload.data.password)
                : false;
            if (!(user && isPasswordValid)) {
                return fail(401, {
                    errors: {
                        username: "Username and/or password is incorrect",
                    } as Record<string, string>,
                });
            }
            await setSession(event, user.id);
        } catch {
            return fail(500);
        }

        const path = event.url.searchParams.get("redirect") ?? "/todos";
        redirect(303, path);
    },
};
