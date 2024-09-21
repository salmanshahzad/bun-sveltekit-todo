<script lang="ts">
    import { onMount } from "svelte";

    import { theme } from "$lib/stores.ts";
    import NavBar from "$lib/ui/NavBar.svelte";
    import type { LayoutData } from "./$types.ts";
    import "../app.css";

    export let data: LayoutData;

    onMount(() => {
        const t = document.querySelector("html")?.getAttribute("data-theme");
        if (t === "light") {
            theme.setLight();
        } else {
            theme.setDark();
        }
    });
</script>

<NavBar user={data.user} />
<slot />
