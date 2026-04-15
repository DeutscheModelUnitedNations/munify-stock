<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import * as m from '$lib/paraglide/messages';

	let locations = $state<any[]>([]);
	let newName = $state('');
	let newDescription = $state('');
	let submitting = $state(false);
	let editingId = $state<string | null>(null);
	let editName = $state('');
	let editDescription = $state('');

	if (browser) {
		const q = client.liveQuery.locations({
			id: true,
			name: true,
			description: true,
			containers: { id: true }
		});
		q.subscribe((v) => {
			if (v) locations = v;
		});
	}

	async function addLocation() {
		if (!newName.trim()) return;
		submitting = true;
		try {
			await client.mutate.createLocation({
				__args: { name: newName.trim(), description: newDescription.trim() || undefined },
				id: true
			});
			newName = '';
			newDescription = '';
		} finally {
			submitting = false;
		}
	}

	function startEdit(loc: any) {
		editingId = loc.id;
		editName = loc.name;
		editDescription = loc.description ?? '';
	}

	async function saveEdit() {
		if (!editingId || !editName.trim()) return;
		await client.mutate.updateLocation({
			__args: {
				id: editingId,
				name: editName.trim(),
				description: editDescription.trim() || undefined
			},
			id: true
		});
		editingId = null;
	}

	async function deleteLocation(id: string) {
		await fetch('/api/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: `mutation { deleteLocation(id: "${id}") }` })
		});
	}
</script>

<div class="mx-auto flex max-w-2xl flex-col gap-6">
	<h1 class="text-2xl font-bold">
		<i class="fa-duotone fa-location-dot mr-2"></i>{m.manageLocations()}
	</h1>

	<!-- Add Location -->
	<FormFieldset title={m.addLocation()}>
		<div class="flex flex-col gap-2">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.locationName()} *</legend>
				<input
					type="text"
					class="input w-full"
					placeholder={m.locationNamePlaceholder()}
					bind:value={newName}
					onkeydown={(e) => e.key === 'Enter' && addLocation()}
				/>
			</fieldset>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.locationDescription()}</legend>
				<input
					type="text"
					class="input w-full"
					placeholder={m.locationDescriptionPlaceholder()}
					bind:value={newDescription}
				/>
			</fieldset>
			<button
				class="btn self-end btn-sm btn-primary"
				onclick={addLocation}
				disabled={submitting || !newName.trim()}
			>
				{#if submitting}
					<span class="loading loading-sm loading-spinner"></span>
				{:else}
					<i class="fa-solid fa-plus"></i>
				{/if}
				{m.addLocation()}
			</button>
		</div>
	</FormFieldset>

	<!-- Location List -->
	<div class="flex flex-col gap-2">
		{#each locations as loc}
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body flex-row items-center gap-3 py-3">
					{#if editingId === loc.id}
						<div class="flex flex-1 flex-col gap-2">
							<input
								type="text"
								class="input input-sm"
								bind:value={editName}
								onkeydown={(e) => e.key === 'Enter' && saveEdit()}
							/>
							<input
								type="text"
								class="input input-sm"
								placeholder={m.description()}
								bind:value={editDescription}
							/>
						</div>
						<button class="btn btn-ghost btn-xs" onclick={() => (editingId = null)}>
							<i class="fa-solid fa-xmark"></i>
						</button>
						<button class="btn btn-xs btn-success" onclick={saveEdit}>
							<i class="fa-solid fa-check"></i>
						</button>
					{:else}
						<i class="fa-duotone fa-location-dot text-lg text-primary"></i>
						<div class="flex-1">
							<p class="font-medium">{loc.name}</p>
							{#if loc.description}
								<p class="text-xs opacity-50">{loc.description}</p>
							{/if}
						</div>
						<span class="badge badge-sm badge-info">
							{m.containersAtLocation({ count: loc.containers?.length ?? 0 })}
						</span>
						<button class="btn btn-ghost btn-xs" onclick={() => startEdit(loc)}>
							<i class="fa-solid fa-pen"></i>
						</button>
						<button class="btn text-error btn-ghost btn-xs" onclick={() => deleteLocation(loc.id)}>
							<i class="fa-solid fa-trash"></i>
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<p class="text-center opacity-50">{m.noLocationsYet()}</p>
		{/each}
	</div>
</div>
