<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	import type { FlagInventorySessionListView } from '$lib/types/views';

	let sessions = $state<FlagInventorySessionListView[]>([]);
	let creating = $state(false);

	if (browser) {
		const sessionsQuery = client.liveQuery.flagInventorySessions({
			id: true,
			name: true,
			date: true,
			status: true
		});
		sessionsQuery.subscribe((v) => {
			if (v) sessions = v;
		});
	}

	async function createSession() {
		creating = true;
		const name = `Flag Inventory ${new Date().toLocaleDateString()}`;
		try {
			const result = await client.mutate.createFlagInventorySession({
				__args: { name },
				id: true
			});
			if (result?.id) {
				goto(`/app/flags/inventory/${result.id}`);
			}
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
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">
			<i class="fa-duotone fa-clipboard-list mr-2"></i>{m.flagInventorySessions()}
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
			<a
				href="/app/flags/inventory/{session.id}"
				class="card bg-base-100 shadow-sm transition hover:shadow-md"
			>
				<div class="card-body flex-row items-center justify-between py-4">
					<div class="flex items-center gap-3">
						<i class="fa-duotone fa-clipboard-check text-xl text-primary"></i>
						<div>
							<p class="font-medium">{session.name}</p>
							<p class="text-xs opacity-50">{new Date(session.date).toLocaleDateString()}</p>
						</div>
					</div>
					<span class="badge badge-soft badge-sm {statusBadge(session.status)}"
						>{session.status}</span
					>
				</div>
			</a>
		{:else}
			<p class="text-center opacity-50">{m.noSessionsYet()}</p>
		{/each}
	</div>
</div>
