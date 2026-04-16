<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import Fuse from 'fuse.js';
	import * as m from '$lib/paraglide/messages';
	import {
		openItemDrawer,
		openContainerDrawer
	} from '$lib/components/EntityDrawer/entityDrawerState.svelte';

	let open = $state(false);
	let query = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);
	let selectedIndex = $state(0);

	import type { SearchItemView, SearchContainerView, SearchFlagView } from '$lib/types/views';

	// Data sources
	let items = $state<SearchItemView[]>([]);
	let containers = $state<SearchContainerView[]>([]);
	let flags = $state<SearchFlagView[]>([]);

	if (browser) {
		const iq = client.liveQuery.items({
			id: true,
			customId: true,
			name: true,
			qrCode: true,
			type: { name: true },
			aliases: true
		});
		iq.subscribe((v) => {
			if (v) items = v;
		});

		const cq = client.liveQuery.containers({
			id: true,
			customId: true,
			label: true,
			description: true
		});
		cq.subscribe((v) => {
			if (v) containers = v;
		});

		const fq = client.liveQuery.flags({
			id: true,
			countryCode: true,
			countryName: true
		});
		fq.subscribe((v) => {
			if (v) flags = v;
		});
	}

	interface SearchResult {
		type: 'item' | 'container' | 'flag';
		id: string;
		title: string;
		subtitle: string;
		icon: string;
		href: string;
	}

	function buildSearchEntries(): SearchResult[] {
		const entries: SearchResult[] = [];
		for (const item of items) {
			entries.push({
				type: 'item',
				id: item.id,
				title: item.name,
				subtitle: [item.customId, item.type?.name, item.qrCode, ...(item.aliases ?? [])]
					.filter(Boolean)
					.join(' · '),
				icon: 'fa-cube',
				href: `/app/items/${item.id}`
			});
		}
		for (const c of containers) {
			entries.push({
				type: 'container',
				id: c.id,
				title: c.label ?? 'Unnamed',
				subtitle: [c.customId, c.description].filter(Boolean).join(' · '),
				icon: 'fa-box',
				href: `/app/containers/${c.id}`
			});
		}
		for (const f of flags) {
			entries.push({
				type: 'flag',
				id: f.id,
				title: f.countryName,
				subtitle: f.countryCode.toUpperCase(),
				icon: 'fa-flag',
				href: `/app/flags`
			});
		}
		return entries;
	}

	const fuse = $derived(
		new Fuse(buildSearchEntries(), {
			keys: ['title', 'subtitle'],
			threshold: 0.4
		})
	);

	const results = $derived.by(() => {
		if (!query.trim()) return buildSearchEntries().slice(0, 8);
		return fuse.search(query, { limit: 10 }).map((r) => r.item);
	});

	$effect(() => {
		// Reset selection when results change
		if (results) selectedIndex = 0;
	});

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			open = !open;
			if (open) {
				query = '';
				setTimeout(() => inputEl?.focus(), 50);
			}
		}
		if (e.key === 'Escape' && open) {
			open = false;
		}
	}

	function handleModalKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter' && results[selectedIndex]) {
			e.preventDefault();
			navigate(results[selectedIndex]);
		}
	}

	function navigate(result: SearchResult) {
		open = false;
		query = '';
		if (result.type === 'item') {
			openItemDrawer(result.id);
		} else if (result.type === 'container') {
			openContainerDrawer(result.id);
		} else {
			goto(result.href);
		}
	}

	export function openSearch() {
		open = true;
		query = '';
		setTimeout(() => inputEl?.focus(), 50);
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if open}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-50 bg-black/50"
		aria-label="Close search"
		onclick={() => (open = false)}
	></button>

	<!-- Modal -->
	<div
		class="fixed top-[15%] right-4 left-4 z-50 mx-auto max-w-lg rounded-box bg-base-100 shadow-2xl"
		role="dialog"
		tabindex="0"
		onkeydown={handleModalKeydown}
	>
		<div class="flex items-center gap-3 border-b border-base-300 px-4 py-3">
			<i class="fa-duotone fa-magnifying-glass opacity-50"></i>
			<input
				bind:this={inputEl}
				bind:value={query}
				type="text"
				class="flex-1 bg-transparent text-lg outline-none"
				placeholder={m.searchPlaceholder()}
			/>
			<kbd class="kbd kbd-sm">Esc</kbd>
		</div>

		<div class="max-h-80 overflow-y-auto p-2">
			{#each results as result, i}
				<button
					class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition {i ===
					selectedIndex
						? 'bg-primary/10'
						: 'hover:bg-base-200'}"
					onclick={() => navigate(result)}
					onmouseenter={() => (selectedIndex = i)}
				>
					<i class="fa-duotone {result.icon} w-5 text-center text-primary"></i>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium">{result.title}</p>
						{#if result.subtitle}
							<p class="truncate text-xs opacity-50">{result.subtitle}</p>
						{/if}
					</div>
					<span class="badge badge-ghost badge-xs">{result.type}</span>
				</button>
			{:else}
				<p class="p-4 text-center text-sm opacity-50">{m.noResults()}</p>
			{/each}
		</div>

		<div class="flex items-center gap-4 border-t border-base-300 px-4 py-2 text-xs opacity-50">
			<span><kbd class="kbd kbd-xs">↑↓</kbd> {m.navigate()}</span>
			<span><kbd class="kbd kbd-xs">↵</kbd> {m.open()}</span>
			<span><kbd class="kbd kbd-xs">Esc</kbd> {m.close()}</span>
		</div>
	</div>
{/if}
