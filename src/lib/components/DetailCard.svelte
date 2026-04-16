<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		icon?: string;
		class?: string;
		children: Snippet;
	}

	let { title, icon, class: className = '', children }: Props = $props();
</script>

<div class="card overflow-hidden border border-base-300 bg-base-100 {className}">
	<div class="card-body">
		<h2 class="card-title text-sm opacity-70">
			{#if icon}
				<i class={icon}></i>
			{/if}
			{title}
		</h2>
		{@render children()}
	</div>
</div>
