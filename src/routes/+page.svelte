<script lang="ts">
    import Button from "$lib/ui/Button.svelte";
</script>

<svelte:head>
    <title>Bun + SvelteKit Todos</title>
</svelte:head>
<main class="flex flex-col items-center gap-4 p-4">
    <div class="flex gap-4">
        <a href="/signin">
            <Button class="btn-primary">Sign In</Button>
        </a>
        <a href="/signup">
            <Button class="btn-primary">Sign Up</Button>
        </a>
    </div>
</main>
