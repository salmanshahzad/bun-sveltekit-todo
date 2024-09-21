<script lang="ts">
    import { page } from "$app/stores";

    import Button from "$lib/ui/Button.svelte";
</script>

<main class="flex flex-col items-center gap-4">
    {#if $page.status === 404}
        <h1 class="text-xl">That page does not exist</h1>
    {:else}
        <h1 class="text-xl">An unexpected error occured</h1>
    {/if}
    <a href="/todos"
        ><Button class="btn-primary" type="button">Return Home</Button></a
    >
</main>
