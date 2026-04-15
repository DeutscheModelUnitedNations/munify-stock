<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		icon: string;
		expanded: boolean;
		children: Snippet;
	}

	let { title, icon, expanded, children }: Props = $props();
</script>

<li>
	<details open>
		<summary class="flex items-center gap-1">
			<i class="fa-duotone {icon} ml-2 w-5 text-center"></i>
			<span class="overflow-hidden duration-300 {expanded ? 'w-full' : 'w-0'}">{title}</span>
		</summary>
		<ul>
			{@render children()}
		</ul>
	</details>
</li>
