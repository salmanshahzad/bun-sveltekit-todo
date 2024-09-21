<script lang="ts">
    let className = "";
    export { className as class };
</script>

<button class="btn {className}" {...$$restProps} on:click>
    <slot />
</button>
