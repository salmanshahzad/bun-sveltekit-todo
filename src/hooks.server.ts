import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async (input) => {
    return input.resolve(input.event, {
        transformPageChunk: ({ html }) => {
            const theme = input.event.cookies.get("theme");
            if (theme === "light") {
                return html.replace(`data-theme="dark"`, `data-theme="light"`);
            }
            return html;
        },
    });
};
