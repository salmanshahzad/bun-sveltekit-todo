import path from "node:path";

import { injectable } from "tsyringe-neo";
import winston from "winston";

@injectable()
export class LogService {
    readonly #logger;

    constructor() {
        const logDir = path.join(
            import.meta.dirname,
            "..",
            "..",
            "..",
            "..",
            "log",
        );
        this.#logger = winston.createLogger({
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
                new winston.transports.Console(),
            ],
        });
    }

    get logger() {
        return this.#logger;
    }
}
