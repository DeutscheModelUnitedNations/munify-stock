<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';
	import { openItemDrawer } from '$lib/components/EntityDrawer/entityDrawerState.svelte';
	import { getActiveFlags } from '$lib/itemFlags';

	import type {
		InventoryCheckDetailView,
		InventoryContainerItemView,
		InventoryCheckItemView,
		LabelView
	} from '$lib/types/views';

	let check = $state<InventoryCheckDetailView | null>(null);
	let containerItems = $state<InventoryContainerItemView[]>([]);
	let checkItems = $state<InventoryCheckItemView[]>([]);
	let allContainers = $state<LabelView[]>([]);
	let allSessionCheckItems = $state<InventoryCheckItemView[]>([]);

	const sessionId = page.params.sessionId!;
	const containerId = page.params.containerId!;

	if (browser) {
		// Find the inventory check for this container in this session
		const checksQuery = client.liveQuery.inventoryChecks({
			__args: { where: { sessionId, containerId } },
			id: true,
			status: true,
			container: { id: true, label: true, description: true }
		});
		checksQuery.subscribe((v) => {
			if (v && v.length > 0) check = v[0];
		});

		// Items that belong to this container
		const itemsQuery = client.liveQuery.items({
			__args: { where: { containerId } },
			id: true,
			name: true,
			quantity: true,
			isDamaged: true,
			needsReview: true,
			isMissing: true,
			type: { name: true }
		});
		itemsQuery.subscribe((v) => {
			if (v) containerItems = v;
		});

		// Check items for this specific inventory check
		const checkItemsQuery = client.liveQuery.inventoryCheckItems({
			id: true,
			checkId: true,
			itemId: true,
			found: true,
			notes: true,
			movedToContainerId: true
		});
		checkItemsQuery.subscribe((v) => {
			if (v) {
				// Filter to items belonging to our check
				allSessionCheckItems = v;
				if (check) {
					checkItems = v.filter((ci) => ci.checkId === check!.id);
				}
			}
		});

		// All containers for "move to" dropdown
		const containersQuery = client.liveQuery.containers({
			id: true,
			label: true
		});
		containersQuery.subscribe((v) => {
			if (v) allContainers = v;
		});
	}

	// Update checkItems when check changes
	$effect(() => {
		if (check && allSessionCheckItems.length > 0) {
			checkItems = allSessionCheckItems.filter((ci) => ci.checkId === check!.id);
		}
	});

	function getCheckItem(itemId: string) {
		return checkItems.find((ci) => ci.itemId === itemId);
	}

	// Detect conflicts: item was checked in a DIFFERENT container within the same session
	function isConflict(itemId: string): boolean {
		return allSessionCheckItems.some(
			(ci) => ci.itemId === itemId && ci.checkId !== check?.id && ci.found
		);
	}

	const foundCount = $derived(checkItems.filter((ci) => ci.found).length);
	const totalItems = $derived(containerItems.length);

	async function toggleItem(itemId: string) {
		const existing = getCheckItem(itemId);
		if (existing) {
			await client.mutate.updateInventoryCheckItem({
				__args: { id: existing.id, found: !existing.found },
				id: true
			});
		} else {
			await client.mutate.checkInventoryItem({
				__args: { checkId: check!.id, itemId, found: true },
				id: true
			});
		}
	}

	async function moveItem(itemId: string, targetContainerId: string) {
		const existing = getCheckItem(itemId);
		if (existing) {
			await client.mutate.updateInventoryCheckItem({
				__args: { id: existing.id, movedToContainerId: targetContainerId },
				id: true
			});
		}
	}

	async function completeCheck() {
		if (!check) return;
		await client.mutate.completeInventoryCheck({
			__args: { id: check.id },
			id: true
		});
	}
</script>

{#if check}
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<a
					href="/app/inventory/{sessionId}"
					class="btn btn-ghost btn-sm"
					aria-label="Back to session"
				>
					<i class="fa-solid fa-arrow-left"></i>
				</a>
				<div>
					<h1 class="text-2xl font-bold">
						<i class="fa-duotone fa-box mr-2 text-primary"></i>
						{check.container?.label ?? 'Container'}
					</h1>
					{#if check.container?.description}
						<p class="text-xs opacity-50">{check.container.description}</p>
					{/if}
				</div>
			</div>
			<div class="flex gap-2">
				{#if check.status !== 'COMPLETED'}
					<button class="btn btn-sm btn-success" onclick={completeCheck}>
						<i class="fa-solid fa-check"></i>
						{m.completeCheck()}
					</button>
				{:else}
					<span class="badge badge-success">Completed</span>
				{/if}
			</div>
		</div>

		<!-- Progress -->
		<div class="flex items-center gap-4">
			<progress class="progress flex-1 progress-success" value={foundCount} max={totalItems}
			></progress>
			<span class="text-sm opacity-50"
				>{m.itemsChecked({ found: foundCount, total: totalItems })}</span
			>
		</div>

		<!-- Item Checklist -->
		<div class="flex flex-col gap-2">
			{#each containerItems as item}
				{@const ci = getCheckItem(item.id)}
				{@const isFound = ci?.found ?? false}
				{@const conflict = isConflict(item.id)}
				<div
					class="card bg-base-100 shadow-sm {isFound
						? 'border-l-4 border-success'
						: ci && !isFound
							? 'border-l-4 border-error'
							: ''}"
				>
					<div class="card-body flex-row flex-wrap items-center gap-3 p-3">
						<button
							class="btn btn-sm {isFound ? 'btn-success' : 'btn-ghost'}"
							onclick={() => toggleItem(item.id)}
							disabled={check.status === 'COMPLETED'}
						>
							{#if isFound}
								<i class="fa-solid fa-check"></i>
							{:else}
								<i class="fa-regular fa-square"></i>
							{/if}
						</button>

						<div class="flex-1">
							<div class="flex items-center gap-2">
								<button
									onclick={() => openItemDrawer(item.id)}
									class="text-sm font-medium hover:underline"
								>
									{item.name}
								</button>
								{#each getActiveFlags(item) as flag}
									<i
										class="{flag.icon} text-xs {flag.badgeClass === 'badge-error'
											? 'text-error'
											: 'text-warning'}"
									></i>
								{/each}
								{#if conflict}
									<span class="badge gap-1 badge-xs badge-warning">
										<i class="fa-solid fa-exclamation"></i>
										{m.duplicate()}
									</span>
								{/if}
							</div>
							<div class="flex gap-2 text-xs opacity-50">
								{#if item.type}
									<span>{item.type.name}</span>
								{/if}
								{#if item.quantity != null}
									<span>x{item.quantity}</span>
								{/if}
								{#if ci?.movedToContainerId}
									{@const target = allContainers.find((c) => c.id === ci.movedToContainerId)}
									<span class="text-info">
										<i class="fa-solid fa-arrow-right"></i>
										{m.movedTo({ target: target?.label ?? m.containers() })}
									</span>
								{/if}
							</div>
						</div>

						{#if ci && check.status !== 'COMPLETED'}
							<select
								class="select w-32 select-xs"
								value={ci.movedToContainerId ?? ''}
								onchange={(e) => {
									const val = (e.target as HTMLSelectElement).value;
									if (val) moveItem(item.id, val);
								}}
							>
								<option value="">{m.moveTo()}</option>
								{#each allContainers.filter((c) => c.id !== containerId) as c}
									<option value={c.id}>{c.label ?? 'Unnamed'}</option>
								{/each}
							</select>
						{/if}
					</div>
				</div>
			{:else}
				<p class="text-center opacity-50">{m.noItemsInContainer()}</p>
			{/each}
		</div>
	</div>
{:else}
	<div class="flex justify-center p-8">
		<span class="loading loading-lg loading-spinner"></span>
	</div>
{/if}
