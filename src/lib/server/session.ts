import crypto from "node:crypto";

import type { RequestEvent } from "@sveltejs/kit";

import { redis } from "$lib/server/db.ts";
import { env } from "$lib/server/env.ts";

const COOKIE_NAME = "session";
const SESSION_TTL = 60 * 60 * 24 * 7;

export async function destroySession(event: RequestEvent): Promise<void> {
    const cookieValue = event.cookies.get(COOKIE_NAME);
    const sessionId = decrypt(cookieValue ?? "", env.COOKIE_SECRET);
    if (sessionId) {
        await redis.del(sessionId);
    }
    event.cookies.delete(COOKIE_NAME, { path: "/" });
}

export async function getSession(
    event: RequestEvent,
): Promise<{ sessionId: string | undefined; userId: number | undefined }> {
    const cookieValue = event.cookies.get(COOKIE_NAME);
    const sessionId = decrypt(cookieValue ?? "", env.COOKIE_SECRET);
    if (!sessionId) {
        return { sessionId: undefined, userId: undefined };
    }

    const userId = Number.parseInt((await redis.get(sessionId)) ?? "");
    if (!userId) {
        return { sessionId, userId: undefined };
    }

    return { sessionId, userId };
}

export async function renewSession(
    event: RequestEvent,
): Promise<{ sessionId: string | undefined; userId: number | undefined }> {
    const { sessionId, userId } = await getSession(event);
    if (sessionId && userId) {
        await redis.setEx(sessionId, SESSION_TTL, userId.toString());
        const cookieValue = encrypt(sessionId, env.COOKIE_SECRET);
        event.cookies.set(COOKIE_NAME, cookieValue, {
            maxAge: SESSION_TTL,
            path: "/",
            sameSite: "strict",
            secure: true,
        });
    }
    return { sessionId, userId };
}

export async function setSession(
    event: RequestEvent,
    userId: number,
): Promise<void> {
    const sessionId = crypto.randomUUID();
    const cookieValue = encrypt(sessionId, env.COOKIE_SECRET);
    await redis.setEx(sessionId, SESSION_TTL, userId.toString());
    event.cookies.set(COOKIE_NAME, cookieValue, {
        maxAge: SESSION_TTL,
        path: "/",
        sameSite: "strict",
        secure: true,
    });
}

function decrypt(value: string, secret: string): string | undefined {
    const [saltHex, ivHex, encryptedText] = value.split(":");
    if (!(saltHex && ivHex && encryptedText)) {
        return undefined;
    }

    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(secret, salt, 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return `${decipher.update(encryptedText, "hex", "utf8")}${decipher.final("utf8")}`;
}

function encrypt(value: string, secret: string): string {
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(secret, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    return `${Buffer.from(salt).toString("hex")}:${Buffer.from(iv).toString("hex")}:${cipher.update(value, "utf8", "hex")}${cipher.final("hex")}`;
}
