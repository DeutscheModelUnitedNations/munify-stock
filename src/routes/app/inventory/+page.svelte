<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	import type { InventorySessionListView } from '$lib/types/views';

	let sessions = $state<InventorySessionListView[]>([]);
	let creating = $state(false);

	if (browser) {
		const q = client.liveQuery.inventorySessions({
			id: true,
			name: true,
			startDate: true,
			endDate: true,
			status: true,
			checks: { id: true, status: true }
		});
		q.subscribe((v) => {
			if (v) sessions = v;
		});
	}

	async function createSession() {
		creating = true;
		const name = `Inventory ${new Date().toLocaleDateString()}`;
		try {
			const result = await client.mutate.createInventorySession({
				__args: { name },
				id: true
			});
			if (result?.id) goto(`/app/inventory/${result.id}`);
		} finally {
			creating = false;
		}
	}

	function statusBadge(status: string) {
		switch (status) {
			case 'PLANNED':
				return 'badge-ghost';
			case 'IN_PROGRESS':
				return 'badge-warning';
			case 'COMPLETED':
				return 'badge-success';
			case 'CANCELLED':
				return 'badge-error';
			default:
				return 'badge-ghost';
		}
	}

	function sessionProgress(session: InventorySessionListView) {
		const checks = session.checks ?? [];
		if (checks.length === 0) return { done: 0, total: 0 };
		const done = checks.filter((c) => c.status === 'COMPLETED').length;
		return { done, total: checks.length };
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">
			<i class="fa-duotone fa-clipboard-list mr-2"></i>{m.inventorySessions()}
		</h1>
		<button class="btn btn-sm btn-primary" onclick={createSession} disabled={creating}>
			{#if creating}
				<span class="loading loading-sm loading-spinner"></span>
			{:else}
				<i class="fa-solid fa-plus"></i>
			{/if}
			{m.newSession()}
		</button>
	</div>

	<div class="flex flex-col gap-3">
		{#each sessions as session}
			{@const prog = sessionProgress(session)}
			<a
				href="/app/inventory/{session.id}"
				class="card bg-base-100 shadow-sm transition hover:shadow-md"
			>
				<div class="card-body py-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<i class="fa-duotone fa-clipboard-check text-xl text-primary"></i>
							<div>
								<p class="font-medium">{session.name}</p>
								<p class="text-xs opacity-50">
									{new Date(session.startDate).toLocaleDateString()}
									{#if session.endDate}
										— {new Date(session.endDate).toLocaleDateString()}
									{/if}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							{#if prog.total > 0}
								<span class="text-xs opacity-50"
									>{m.containersDone({ done: prog.done, total: prog.total })}</span
								>
							{/if}
							<span class="badge badge-sm {statusBadge(session.status)}">{session.status}</span>
						</div>
					</div>
					{#if prog.total > 0}
						<progress class="progress mt-2 progress-success" value={prog.done} max={prog.total}
						></progress>
					{/if}
				</div>
			</a>
		{:else}
			<p class="text-center opacity-50">{m.noSessionsYet()}</p>
		{/each}
	</div>
</div>
