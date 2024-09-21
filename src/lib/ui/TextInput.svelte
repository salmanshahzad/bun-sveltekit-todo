<script lang="ts">
    let className = "";
    export { className as class };
    export let error: string | undefined = undefined;
    export let label: string | undefined = undefined;
    export let value = "";

    export function focus(): void {
        input.focus();
    }

    let input: HTMLInputElement;
</script>

<label class="form-control w-full">
    {#if label}
        <div class="label">
            <span class="label-text">{label}</span>
        </div>
    {/if}
    <input
        bind:this={input}
        bind:value
        class="input input-bordered {className}"
        class:input-error={!!error}
        {...$$restProps}
    />
    {#if error}
        <div class="label">
            <span class="label-text-alt text-red-400">{error}</span>
        </div>
    {/if}
</label>
