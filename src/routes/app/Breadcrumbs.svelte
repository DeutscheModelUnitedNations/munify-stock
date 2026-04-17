<script lang="ts">
	import { Breadcrumbs } from 'sveltekit-breadcrumbs';
	import type { PathSegment } from 'sveltekit-breadcrumbs';
	import { locales } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/state';
	import { SvelteURL } from 'svelte/reactivity';
	import type { LayoutServerLoadEvent } from './$types';

	type Parameters = keyof LayoutServerLoadEvent['params'];

	// The library matches URL segments against glob-discovered paths.
	// Since glob paths are relative to this file (e.g. ./items/+page.svelte → "items"),
	// but the actual URL starts with /app, we strip the /app prefix so they align.
	let strippedUrl = $derived.by(() => {
		const url = new SvelteURL(page.url.href);
		url.pathname = url.pathname.replace(/^\/app/, '') || '/';
		return url;
	});

	interface BreadcrumbConfig {
		label: string;
		icon: string;
	}

	const breadcrumbs: Record<string, BreadcrumbConfig> = {
		dashboard: { label: m.dashboard(), icon: 'gauge-high' },
		items: { label: m.items(), icon: 'cubes' },
		containers: { label: m.containers(), icon: 'box' },
		flags: { label: m.flags(), icon: 'flag' },
		inventory: { label: m.inventory(), icon: 'clipboard-list' },
		scan: { label: m.scanCode(), icon: 'barcode-read' },
		admin: { label: m.admin(), icon: 'shield-halved' },
		types: { label: m.types(), icon: 'tags' },
		locations: { label: m.locations(), icon: 'location-dot' },
		users: { label: m.users(), icon: 'users' },
		new: { label: m['new'](), icon: 'plus' },
		sessionId: { label: m.inventory(), icon: 'clipboard-check' },
		containerId: { label: m.containers(), icon: 'box' }
	};

	type PathSegmentType = PathSegment<Parameters, boolean>;

	function getBreadcrumb(segment: PathSegmentType): BreadcrumbConfig {
		const config = breadcrumbs[segment.key];
		if (config) return config;

		return {
			label: segment.key,
			icon: 'question'
		};
	}
</script>

<!-- ATTENTION: importObject is dir route specific. You cannot move this file without adjusting this
import path via the parameter! -->
<Breadcrumbs
	importObject={import.meta.glob('./**/+page*.svelte')}
	availableLanguageTags={locales as any as string[]}
	delimiterSnippet="disabled"
	currentUrl={strippedUrl}
	homePath="/app"
>
	{#snippet pathSnippet(pathSegment: PathSegmentType)}
		{@const breadcrumb = getBreadcrumb(pathSegment)}
		{@const href = '/app' + new URL(pathSegment.href).pathname}
		<a class="btn !no-underline btn-ghost btn-sm" {href}>
			<i class="fa-duotone fa-{breadcrumb.icon}"></i>
			<span class="ml-1">
				{#if pathSegment.isParameter && pathSegment.value}
					{pathSegment.value.length > 8 ? pathSegment.value.slice(0, 8) + '...' : pathSegment.value}
				{:else}
					{breadcrumb.label}
				{/if}
			</span>
		</a>
	{/snippet}
</Breadcrumbs>
