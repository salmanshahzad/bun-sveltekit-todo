import path from "node:path";

import { dev } from "$app/environment";
import winston from "winston";

const logDir = path.join(import.meta.dirname, "..", "..", "..", "log");

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    level: "info",
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        }),
        new winston.transports.File({
            filename: path.join(logDir, "info.log"),
        }),
    ],
});

if (dev) {
    logger.add(new winston.transports.Console());
}
