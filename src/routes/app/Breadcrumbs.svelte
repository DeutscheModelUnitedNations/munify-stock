<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';

	interface Breadcrumb {
		label: string;
		icon: string;
		href: string;
	}

	const segmentConfig: Record<string, { label: string; icon: string }> = {
		items: { label: m.items(), icon: 'boxes-stacked' },
		containers: { label: m.containers(), icon: 'box' },
		flags: { label: m.flags(), icon: 'flag' },
		inventory: { label: m.inventory(), icon: 'clipboard-list' },
		scan: { label: m.scanCode(), icon: 'barcode-read' },
		admin: { label: m.admin(), icon: 'shield-halved' },
		types: { label: m.types(), icon: 'tags' },
		locations: { label: m.locations(), icon: 'location-dot' },
		users: { label: m.users(), icon: 'users' },
		new: { label: m['new'](), icon: 'plus' }
	};

	let breadcrumbs = $derived.by((): Breadcrumb[] => {
		if (!browser) return [];
		const pathname = page.url.pathname;
		if (pathname === '/app') return [];

		const segments = pathname
			.replace(/^\/app\/?/, '')
			.split('/')
			.filter(Boolean);
		const result: Breadcrumb[] = [];
		let hrefAccum = '/app';

		for (const segment of segments) {
			hrefAccum += `/${segment}`;
			const config = segmentConfig[segment];
			if (config) {
				result.push({ ...config, href: hrefAccum });
			} else {
				// Dynamic param (ID) — show as shortened ID
				result.push({
					label: segment.length > 8 ? segment.slice(0, 8) + '...' : segment,
					icon: 'hashtag',
					href: hrefAccum
				});
			}
		}

		return result;
	});
</script>

{#if browser}
	<div class="flex items-center gap-1">
		<a class="btn !no-underline btn-ghost btn-sm" href="/app">
			<i class="fa-duotone fa-home w-5 text-center"></i>
		</a>
		{#each breadcrumbs as crumb, i}
			<i class="fa-solid fa-chevron-right text-xs opacity-30"></i>
			<a
				class="btn !no-underline btn-ghost btn-sm"
				href={crumb.href}
				class:btn-active={i === breadcrumbs.length - 1}
			>
				<i class="fa-duotone fa-{crumb.icon}"></i>
				<span class="ml-1">{crumb.label}</span>
			</a>
		{/each}
	</div>
{/if}
