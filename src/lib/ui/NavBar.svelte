<script lang="ts">
    import { enhance } from "$app/forms";
    import { Icon } from "svelte-icons-pack";
    import { RiUserFacesUserLine } from "svelte-icons-pack/ri";

    import type { User } from "$lib/server/schema.ts";
    import { theme } from "$lib/stores.ts";
    import ThemeSwitch from "./ThemeSwitch.svelte";

    export let user: Omit<User, "password"> | undefined = undefined;

    let isSigningOut = false;
    let signOutForm: HTMLFormElement;
</script>

<header class="flex w-full items-center justify-between px-8 py-4">
    <a href={user ? "/todos" : "/"}>
        <h1 class="text-3xl font-bold">Bun + SvelteKit To-dos</h1>
    </a>
    <div class="flex items-center gap-4">
        <ThemeSwitch />
        {#if user}
            <div class="dropdown dropdown-end">
                <div
                    class="flex items-center gap-2"
                    role="button"
                    tabindex="-1"
                >
                    <Icon src={RiUserFacesUserLine} />
                    <span>{user.username}</span>
                </div>
                <ul
                    class="menu dropdown-content mt-2 w-40 rounded-box p-2 drop-shadow-lg"
                    class:bg-gray-700={$theme === "dark"}
                    class:bg-gray-200={$theme === "light"}
                    tabindex="-1"
                >
                    <li>
                        <button
                            disabled={isSigningOut}
                            on:click={() => signOutForm.requestSubmit()}
                            >Sign Out</button
                        >
                    </li>
                </ul>
            </div>
        {/if}
    </div>
</header>
<form
    action="/signout"
    bind:this={signOutForm}
    method="POST"
    use:enhance={() => {
        isSigningOut = true;
        return async ({ update }) => {
            await update();
            isSigningOut = false;
        };
    }}
></form>
