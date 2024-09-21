import { writable } from "svelte/store";

function createTheme() {
    const theme = writable<"dark" | "light">("dark");
    return {
        setDark() {
            theme.set("dark");
            document.querySelector("html")?.setAttribute("data-theme", "dark");
            document.cookie = "theme=dark; SameSite=Strict; Secure";
        },
        setLight() {
            theme.set("light");
            document.querySelector("html")?.setAttribute("data-theme", "light");
            document.cookie = "theme=light; SameSite=Strict; Secure";
        },
        setSystem() {
            const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
            if (isDark) {
                this.setDark();
            } else {
                this.setLight();
            }
        },
        subscribe: theme.subscribe,
    };
}

export const theme = createTheme();
