<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';

	let session = $state<any>(null);
	let checks = $state<any[]>([]);
	let allContainers = $state<any[]>([]);
	let addingContainer = $state(false);

	const sessionId = page.params.sessionId!;

	if (browser) {
		const sessionQuery = client.liveQuery.inventorySession({
			__args: { id: sessionId },
			id: true,
			name: true,
			startDate: true,
			endDate: true,
			status: true
		});
		sessionQuery.subscribe((v) => {
			if (v) session = v;
		});

		const checksQuery = client.liveQuery.inventoryChecks({
			__args: { where: { sessionId } },
			id: true,
			status: true,
			startedAt: true,
			completedAt: true,
			container: { id: true, label: true, description: true },
			items: { id: true, found: true }
		});
		checksQuery.subscribe((v) => {
			if (v) checks = v;
		});

		const containersQuery = client.liveQuery.containers({
			id: true,
			label: true,
			description: true,
			items: { id: true }
		});
		containersQuery.subscribe((v) => {
			if (v) allContainers = v;
		});
	}

	const checkedContainerIds = $derived(new Set(checks.map((c) => c.container?.id)));
	const availableContainers = $derived(allContainers.filter((c) => !checkedContainerIds.has(c.id)));
	const completedCount = $derived(checks.filter((c) => c.status === 'COMPLETED').length);

	async function addContainer(containerId: string) {
		addingContainer = true;
		try {
			await client.mutate.createInventoryCheck({
				__args: { sessionId, containerId },
				id: true
			});
		} finally {
			addingContainer = false;
		}
	}

	async function updateSessionStatus(status: string) {
		await client.mutate.updateInventorySessionStatus({
			__args: { id: sessionId, status },
			id: true
		});
	}

	function checkStatusBadge(status: string) {
		switch (status) {
			case 'PENDING':
				return 'badge-ghost';
			case 'IN_PROGRESS':
				return 'badge-warning';
			case 'COMPLETED':
				return 'badge-success';
			default:
				return 'badge-ghost';
		}
	}

	function checkProgress(check: any) {
		const items = check.items ?? [];
		if (items.length === 0) return { found: 0, total: 0 };
		const found = items.filter((i: any) => i.found).length;
		return { found, total: items.length };
	}
</script>

{#if session}
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<a href="/app/inventory" class="btn btn-ghost btn-sm" aria-label="Back">
					<i class="fa-solid fa-arrow-left"></i>
				</a>
				<div>
					<h1 class="text-2xl font-bold">
						<i class="fa-duotone fa-clipboard-check mr-2"></i>{session.name}
					</h1>
					<p class="text-xs opacity-50">
						Started {new Date(session.startDate).toLocaleDateString()}
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				{#if session.status === 'PLANNED'}
					<button class="btn btn-sm btn-warning" onclick={() => updateSessionStatus('IN_PROGRESS')}>
						<i class="fa-solid fa-play"></i>
						{m.start()}
					</button>
				{:else if session.status === 'IN_PROGRESS'}
					<button class="btn btn-sm btn-success" onclick={() => updateSessionStatus('COMPLETED')}>
						<i class="fa-solid fa-check"></i>
						{m.complete()}
					</button>
				{/if}
			</div>
		</div>

		<!-- Overall Progress -->
		{#if checks.length > 0}
			<div class="flex items-center gap-4">
				<progress
					class="progress flex-1 progress-success"
					value={completedCount}
					max={checks.length}
				></progress>
				<span class="text-sm opacity-50"
					>{m.containersDone({ done: completedCount, total: checks.length })}</span
				>
			</div>
		{/if}

		<!-- Container Checks -->
		<div class="flex flex-col gap-3">
			<h2 class="text-lg font-semibold">
				<i class="fa-duotone fa-boxes-stacked mr-1"></i>
				{m.containers()} ({checks.length})
			</h2>

			{#each checks as check}
				{@const prog = checkProgress(check)}
				<a
					href="/app/inventory/{sessionId}/{check.container?.id}"
					class="card bg-base-100 shadow-sm transition hover:shadow-md"
				>
					<div class="card-body py-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<i class="fa-duotone fa-box text-xl text-primary"></i>
								<div>
									<p class="font-medium">
										{check.container?.label ?? 'Unnamed'}
										{#if check.container?.description}
											<span class="text-sm opacity-50">
												— {check.container.description}
											</span>
										{/if}
									</p>
									<p class="text-xs opacity-50">
										{#if prog.total > 0}
											{m.itemsChecked({ found: prog.found, total: prog.total })}
										{:else}
											{m.noItemsCheckedYet()}
										{/if}
									</p>
								</div>
							</div>
							<span class="badge badge-sm {checkStatusBadge(check.status)}">
								{check.status}
							</span>
						</div>
						{#if prog.total > 0}
							<progress class="progress mt-2 progress-info" value={prog.found} max={prog.total}
							></progress>
						{/if}
					</div>
				</a>
			{:else}
				<p class="text-center text-sm opacity-50">
					{m.noContainersInSession()}
				</p>
			{/each}
		</div>

		<!-- Add Container -->
		{#if session.status !== 'COMPLETED' && session.status !== 'CANCELLED'}
			<div class="card bg-base-200 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-sm">
						<i class="fa-duotone fa-plus-circle"></i>
						{m.addContainerToSession()}
					</h2>
					{#if availableContainers.length > 0}
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{#each availableContainers as container}
								<button
									class="btn justify-start btn-outline btn-sm"
									onclick={() => addContainer(container.id)}
									disabled={addingContainer}
								>
									<i class="fa-duotone fa-box"></i>
									{container.label ?? 'Unnamed'}
									<span class="ml-auto badge badge-xs badge-info">
										{m.itemsInContainer({ count: container.items?.length ?? 0 })}
									</span>
								</button>
							{/each}
						</div>
					{:else}
						<p class="text-sm opacity-50">{m.allContainersAdded()}</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex justify-center p-8">
		<span class="loading loading-lg loading-spinner"></span>
	</div>
{/if}
