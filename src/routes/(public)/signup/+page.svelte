<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";

    import TextInput from "$lib/ui/TextInput.svelte";
    import type { ActionData } from "./$types.ts";

    export let form: ActionData;

    let isSubmitting = false;
</script>

<svelte:head>
    <title>Sign Up</title>
</svelte:head>
<main class="flex justify-center p-4">
    <div class="flex w-full flex-col gap-4 sm:w-1/2 lg:w-1/4">
        <h1 class="text-center text-3xl font-bold">Sign Up</h1>
        {#if $page.status === 500}
            <div class="alert alert-error">An unexpected error occurred</div>
        {/if}
        <form
            method="POST"
            use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                    await update();
                    isSubmitting = false;
                };
            }}
        >
            <fieldset class="flex flex-col gap-4" disabled={isSubmitting}>
                <TextInput
                    error={form?.errors?.["username"]}
                    label="Username"
                    name="username"
                    type="text"
                />
                <TextInput
                    error={form?.errors?.["password"]}
                    label="Password"
                    name="password"
                    type="password"
                />
                <TextInput
                    error={form?.errors?.["confirmPassword"]}
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                />
                <button class="btn btn-primary">Sign Up</button>
            </fieldset>
        </form>
    </div>
</main>
