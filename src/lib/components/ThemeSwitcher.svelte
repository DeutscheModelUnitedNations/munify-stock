<script lang="ts">
	import { getTheme, toggleTheme } from '$lib/utils/theme.svelte';
</script>

<button class="btn btn-ghost btn-sm" onclick={toggleTheme}>
	{#if getTheme() === 'dark'}
		<i class="fa-duotone fa-moon text-lg"></i>
	{:else if getTheme() === 'light'}
		<i class="fa-duotone fa-sun text-lg"></i>
	{:else}
		<i class="fa-duotone fa-desktop text-lg"></i>
	{/if}
</button>
