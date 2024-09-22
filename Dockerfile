FROM oven/bun:1.1.29 AS build
WORKDIR /usr/src/app
COPY bun.lockb package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1.1.29
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/build build
COPY --from=build /usr/src/app/drizzle drizzle
RUN cd build && bun install
CMD ["bun", "run", "build/index.js"]
