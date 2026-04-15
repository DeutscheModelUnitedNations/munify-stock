<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<fieldset class="fieldset w-full rounded-box border border-base-300 bg-base-200 p-4">
	<legend class="fieldset-legend">{title}</legend>
	{@render children()}
</fieldset>
