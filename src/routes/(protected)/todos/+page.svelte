<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";
    import { afterUpdate } from "svelte";

    import type { Todo } from "$lib/server/services/schema.ts";
    import TextInput from "$lib/ui/TextInput.svelte";
    import type { ActionData, PageData } from "./$types.ts";
    import TodoItem from "./TodoItem.svelte";

    export let data: PageData;
    export let form: ActionData;

    let input: TextInput;
    let todosBeingAdded: Todo[] = [];

    afterUpdate(() => {
        input.focus();
    });
</script>

<svelte:head>
    <title>Todos</title>
</svelte:head>
<main class="flex flex-col items-center gap-4 p-4">
    <div class="flex w-full flex-col gap-4 sm:w-1/2">
        {#if $page.status === 500}
            <div class="alert alert-error">An unexpected error occurred</div>
        {/if}
        <form
            action="?/add"
            method="POST"
            use:enhance={({ formData, formElement }) => {
                const todo = {
                    id: Math.random(),
                    userId: 0,
                    name: formData.get("name")?.toString() ?? "",
                    completed: false,
                };
                todosBeingAdded = [...todosBeingAdded, todo];
                formElement.reset();
                return async ({ update }) => {
                    await update();
                    todosBeingAdded = todosBeingAdded.filter((t) => t !== todo);
                };
            }}
        >
            <TextInput
                bind:this={input}
                class="w-full"
                error={form?.action === "add" ? form?.errors.name : undefined}
                name="name"
                placeholder="New Todo"
            />
        </form>
        <ul>
            {#each data.todos as todo (todo.id)}
                {@const error =
                    form?.action === "edit" && form?.id === todo.id.toString()
                        ? form?.errors.name
                        : undefined}
                <TodoItem {error} {todo} />
            {/each}
            {#each todosBeingAdded as todo (todo.id)}
                <TodoItem isLoading={true} {todo} />
            {/each}
        </ul>
    </div>
</main>
