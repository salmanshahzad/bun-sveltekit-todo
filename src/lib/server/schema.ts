import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").unique().notNull(),
    password: text("password").notNull(),
});

export type User = typeof users.$inferSelect;

export const todos = pgTable("todos", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    name: text("name").notNull(),
    completed: boolean("completed").notNull().default(false),
});

export type Todo = typeof todos.$inferSelect;
