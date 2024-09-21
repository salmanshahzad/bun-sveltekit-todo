<script lang="ts">
    import { enhance } from "$app/forms";
    import { Icon } from "svelte-icons-pack";
    import {
        RiDesignPencilFill,
        RiDeviceSaveFill,
        RiSystemDeleteBinFill,
    } from "svelte-icons-pack/ri";

    import type { Todo } from "$lib/server/schema.ts";
    import { theme } from "$lib/stores.ts";
    import Button from "$lib/ui/Button.svelte";
    import TextInput from "$lib/ui/TextInput.svelte";

    export let error: string | undefined = undefined;
    export let isLoading = false;
    export let todo: Todo;

    let completeForm: HTMLFormElement;
    let isDeleting = false;
    let isEditing = false;

    $: isEditing = !!error;
</script>

{#if !isDeleting}
    <li class="my-4 flex items-start gap-4">
        {#if isLoading}
            <span class="loading loading-spinner loading-sm" />
        {:else}
            <form
                action="?/complete"
                class="flex items-center"
                method="POST"
                bind:this={completeForm}
                use:enhance
            >
                <input type="hidden" name="id" value={todo.id} />
                <input type="hidden" name="completed" value={todo.completed} />
                <input
                    autoComplete="off"
                    bind:checked={todo.completed}
                    class="checkbox-primary checkbox no-animation"
                    type="checkbox"
                    on:change={() => completeForm.requestSubmit()}
                />
            </form>
        {/if}
        {#if isEditing}
            <form
                action="?/edit"
                class="w-full"
                method="POST"
                use:enhance={() => {
                    isEditing = false;
                    return async ({ update }) => {
                        await update();
                    };
                }}
            >
                <fieldset class="flex gap-4">
                    <input type="hidden" name="id" value={todo.id} />
                    <TextInput
                        class="input-sm flex-grow"
                        {error}
                        name="todo"
                        bind:value={todo.name}
                    />
                    <Button class="btn-square btn-secondary btn-sm text-xl">
                        <Icon
                            color={$theme === "dark" ? "black" : "white"}
                            src={RiDeviceSaveFill}
                        />
                    </Button>
                </fieldset>
            </form>
        {:else}
            <span
                class="flex flex-grow items-center"
                class:line-through={todo.completed}>{todo.name}</span
            >
            {#if !isLoading}
                <Button
                    class="btn-square btn-secondary btn-sm text-xl"
                    on:click={() => (isEditing = true)}
                >
                    <Icon
                        color={$theme === "dark" ? "black" : "white"}
                        src={RiDesignPencilFill}
                    />
                </Button>
            {/if}
        {/if}
        {#if !isLoading}
            <form
                action="?/delete"
                method="POST"
                use:enhance={() => {
                    isDeleting = true;
                    return async ({ update }) => {
                        await update();
                        isDeleting = false;
                    };
                }}
            >
                <input type="hidden" name="id" value={todo.id} />
                <Button class="btn-square btn-error btn-sm text-xl">
                    <Icon
                        color={$theme === "dark" ? "black" : "white"}
                        src={RiSystemDeleteBinFill}
                    />
                </Button>
            </form>
        {/if}
    </li>
{/if}
