<script lang="ts">
    import { Icon } from "svelte-icons-pack";
    import { RiWeatherMoonFill, RiWeatherSunFill } from "svelte-icons-pack/ri";

    import { theme } from "$lib/stores.ts";
</script>

<label class="swap swap-rotate">
    <input
        type="checkbox"
        on:change={$theme === "dark" ? theme.setLight : theme.setDark}
    />
    <Icon className="swap-off" src={RiWeatherMoonFill} />
    <Icon className="swap-on" src={RiWeatherSunFill} />
</label>
