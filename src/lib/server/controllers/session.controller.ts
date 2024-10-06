import { createRoute } from "@hono/zod-openapi";
import argon2 from "argon2";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "tsyringe-neo";
import { z } from "zod";

import { Controller } from "./index.ts";
import { SessionRepository } from "../repositories/session.repository.ts";
import { UserRepository } from "../repositories/user.repository.ts";

@injectable()
export class SessionController extends Controller {
    constructor(
        @inject(SessionRepository)
        private readonly sessionRepository: SessionRepository,
        @inject(UserRepository) private readonly userRepository: UserRepository,
    ) {
        super();
    }

    override routes() {
        return this.router
            .openapi(
                createRoute({
                    description: "Sign in",
                    method: "post",
                    path: "/",
                    request: {
                        body: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        username: z
                                            .string({
                                                message:
                                                    "username must be a string",
                                            })
                                            .trim()
                                            .min(1, {
                                                message: "username is required",
                                            }),
                                        password: z
                                            .string({
                                                message:
                                                    "password must be a string",
                                            })
                                            .min(1, {
                                                message: "password is required",
                                            }),
                                    }),
                                },
                            },
                        },
                    },
                    responses: {
                        204: {
                            description: "Success",
                            headers: {
                                "Set-Cookie": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                        401: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        errors: z.object({
                                            username: z.string(),
                                            password: z.string(),
                                        }),
                                    }),
                                },
                            },
                            description: "Invalid username or password",
                        },
                        422: {
                            content: {
                                "application/json": {
                                    schema: z.object({
                                        errors: z.object({
                                            username: z.string().optional(),
                                            password: z.string().optional(),
                                        }),
                                    }),
                                },
                            },
                            description: "Validation error",
                        },
                        500: {
                            description: "Server error",
                        },
                    },
                }),
                async (c) => {
                    const payload = c.req.valid("json");
                    const user = await this.userRepository.getUserByUsername(
                        payload.username,
                    );
                    const isPasswordValid = user
                        ? await argon2.verify(user.password, payload.password)
                        : false;
                    if (!user || !isPasswordValid) {
                        return c.json(
                            {
                                errors: {
                                    username:
                                        "username and/or password is incorrect",
                                    password:
                                        "username and/or password is incorrect",
                                },
                            },
                            StatusCodes.UNAUTHORIZED,
                        );
                    }
                    await this.sessionRepository.createSession(c, user.id);
                    return c.json(undefined, StatusCodes.NO_CONTENT);
                },
            )
            .openapi(
                createRoute({
                    description: "Sign out",
                    method: "delete",
                    path: "/",
                    responses: {
                        204: {
                            description: "Success",
                        },
                        500: {
                            description: "Server error",
                        },
                    },
                }),
                async (c) => {
                    await this.sessionRepository.destroySession(c);
                    return c.json(undefined, StatusCodes.NO_CONTENT);
                },
            );
    }
}
