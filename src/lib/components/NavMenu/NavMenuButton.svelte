<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	interface Props {
		title: string;
		href: string;
		icon: string;
		active?: boolean;
		expanded: boolean;
		onnavigate?: () => void;
	}

	let { title, href, icon, active, expanded = $bindable(), onnavigate }: Props = $props();

	let showAsActive = $derived.by(() => {
		if (active !== undefined) return active;
		if (!browser) return false;
		if (href === '/app') return page.url.pathname === '/app';
		return page.url.pathname.startsWith(href);
	});
</script>

<li class="w-full overflow-hidden" {title}>
	<a
		{href}
		onclick={onnavigate}
		class="flex w-full items-center justify-center p-2 {showAsActive ? 'menu-active' : ''}"
	>
		<i class="{showAsActive ? 'fas' : 'fa-duotone'} {icon} ml-2 w-5 text-center"></i>
		<p class="overflow-hidden duration-300 {expanded ? 'h-5 w-full pl-1' : 'h-0 w-0'}">
			{title}
		</p>
	</a>
</li>
