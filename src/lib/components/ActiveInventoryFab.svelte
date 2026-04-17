<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { client } from '$lib/generated-client/client';
	import * as m from '$lib/paraglide/messages';
	import type SearchModal from '$lib/components/SearchModal.svelte';
	import type { SessionstatusEnum } from '$lib/generated-client/client';

	interface Props {
		searchModal: SearchModal | undefined;
	}

	let { searchModal }: Props = $props();

	interface SessionRow {
		id: string;
		status: SessionstatusEnum;
		startDate: Date;
	}

	let sessionsList = $state<SessionRow[]>([]);

	if (browser) {
		const sessions = client.liveQuery.inventorySessions({
			id: true,
			status: true,
			startDate: true
		});
		sessions.subscribe((v) => {
			if (v) sessionsList = v;
		});
	}

	const activeSession = $derived(
		sessionsList
			.filter((s) => s.status === 'IN_PROGRESS')
			.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
	);

	let open = $state(false);
	let containerEl = $state<HTMLDivElement | undefined>();

	interface Action {
		label: string;
		icon: string;
		btnClass?: string;
		run: () => void;
	}

	const actions = $derived<Action[]>(
		activeSession
			? [
					{
						label: m.newItem(),
						icon: 'fa-cube',
						run: () => goto('/app/items/new')
					},
					{
						label: m.newContainer(),
						icon: 'fa-box-isometric-tape',
						run: () => goto('/app/containers/new')
					},
					{
						label: m.search(),
						icon: 'fa-magnifying-glass',
						run: () => searchModal?.openSearch()
					},
					{
						label: m.scanCodeTitle(),
						icon: 'fa-qrcode',
						run: () => goto('/app/scan')
					},
					{
						label: m.goToActiveInventory(),
						icon: 'fa-clipboard-list',
						btnClass: 'btn-secondary',
						run: () => goto(`/app/inventory/${activeSession.id}`)
					}
				]
			: []
	);

	const STACK_GAP = 70;

	function trigger(action: Action) {
		action.run();
		open = false;
	}

	$effect(() => {
		if (!open) return;
		const handleClick = (e: MouseEvent) => {
			if (containerEl && !containerEl.contains(e.target as Node)) open = false;
		};
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') open = false;
		};
		window.addEventListener('mousedown', handleClick);
		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('mousedown', handleClick);
			window.removeEventListener('keydown', handleKey);
		};
	});
</script>

{#if activeSession}
	<div bind:this={containerEl} class="fixed right-6 bottom-6 z-30">
		{#each actions as action, i (action.label)}
			{@const distance = (i + 1) * STACK_GAP}
			{@const buttonDelay = open ? i * 35 : (actions.length - 1 - i) * 25}
			{@const labelDelay = open ? i * 35 + 220 : 0}
			<div
				class="absolute right-0 flex items-center gap-2"
				style="bottom: {distance}px;"
				aria-hidden={!open}
			>
				<span
					class="petal-label rounded-md bg-base-content/85 px-2 py-1 text-xs font-medium whitespace-nowrap text-base-100 shadow"
					class:open
					style="transition-delay: {labelDelay}ms;"
				>
					{action.label}
				</span>
				<button
					type="button"
					class="petal-btn btn btn-circle shadow-lg btn-lg {action.btnClass ?? ''}"
					class:open
					aria-label={action.label}
					tabindex={open ? 0 : -1}
					onclick={() => trigger(action)}
					style="--fan-y: {distance}px; transition-delay: {buttonDelay}ms;"
				>
					<i class="fa-solid {action.icon}"></i>
				</button>
			</div>
		{/each}

		<button
			type="button"
			class="btn relative btn-circle shadow-lg btn-lg btn-primary"
			aria-label={open ? 'Close menu' : m.onTheMove()}
			aria-expanded={open}
			onclick={() => (open = !open)}
		>
			<i
				class="fa-solid text-xl transition-transform duration-300 {open
					? 'fa-xmark rotate-[135deg]'
					: 'fa-plus'}"
			></i>
		</button>
	</div>
{/if}

<style>
	.petal-btn {
		opacity: 0;
		pointer-events: none;
		transform: translateY(var(--fan-y, 0)) scale(0.4);
		transition:
			transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 200ms ease-out;
	}
	.petal-btn.open {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0) scale(1);
	}
	.petal-label {
		opacity: 0;
		transition: opacity 180ms ease-out;
	}
	.petal-label.open {
		opacity: 1;
	}
</style>
