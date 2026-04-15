<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import * as m from '$lib/paraglide/messages';

	import type { NamedDescView } from '$lib/types/views';

	let itemTypes = $state<NamedDescView[]>([]);
	let containerTypes = $state<NamedDescView[]>([]);
	let newItemType = $state('');
	let newContainerType = $state('');
	let submittingItem = $state(false);
	let submittingContainer = $state(false);

	if (browser) {
		const itQuery = client.liveQuery.itemTypes({ id: true, name: true, description: true });
		itQuery.subscribe((v) => {
			if (v) itemTypes = v;
		});

		const ctQuery = client.liveQuery.containerTypes({
			id: true,
			name: true,
			description: true
		});
		ctQuery.subscribe((v) => {
			if (v) containerTypes = v;
		});
	}

	async function addItemType() {
		if (!newItemType.trim()) return;
		submittingItem = true;
		try {
			await client.mutate.createItemType({
				__args: { name: newItemType.trim() },
				id: true
			});
			newItemType = '';
		} finally {
			submittingItem = false;
		}
	}

	async function addContainerType() {
		if (!newContainerType.trim()) return;
		submittingContainer = true;
		try {
			await client.mutate.createContainerType({
				__args: { name: newContainerType.trim() },
				id: true
			});
			newContainerType = '';
		} finally {
			submittingContainer = false;
		}
	}

	async function deleteItemType(id: string) {
		await fetch('/api/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: `mutation { deleteItemType(id: "${id}") }` })
		});
	}

	async function deleteContainerType(id: string) {
		await fetch('/api/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: `mutation { deleteContainerType(id: "${id}") }` })
		});
	}
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-bold">
		<i class="fa-duotone fa-tags mr-2"></i>{m.manageTypes()}
	</h1>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Item Types -->
		<FormFieldset title={m.itemTypes()}>
			<div class="flex flex-col gap-2">
				{#each itemTypes as type}
					<div class="flex items-center justify-between rounded-lg bg-base-100 p-2">
						<div class="flex items-center gap-2">
							<i class="fa-duotone fa-tag text-primary"></i>
							<span class="text-sm font-medium">{type.name}</span>
						</div>
						<button
							class="btn text-error btn-ghost btn-xs"
							onclick={() => deleteItemType(type.id)}
							aria-label={m.delete()}
						>
							<i class="fa-solid fa-trash"></i>
						</button>
					</div>
				{:else}
					<p class="text-center text-sm opacity-50">{m.noItemTypesYet()}</p>
				{/each}
			</div>

			<div class="mt-3 flex gap-2">
				<input
					type="text"
					class="input input-sm flex-1"
					placeholder={m.newItemTypePlaceholder()}
					bind:value={newItemType}
					onkeydown={(e) => e.key === 'Enter' && addItemType()}
				/>
				<button
					class="btn btn-sm btn-primary"
					onclick={addItemType}
					disabled={submittingItem || !newItemType.trim()}
				>
					{#if submittingItem}
						<span class="loading loading-sm loading-spinner"></span>
					{:else}
						<i class="fa-solid fa-plus"></i>
					{/if}
					{m.add()}
				</button>
			</div>
		</FormFieldset>

		<!-- Container Types -->
		<FormFieldset title={m.containerTypes()}>
			<div class="flex flex-col gap-2">
				{#each containerTypes as type}
					<div class="flex items-center justify-between rounded-lg bg-base-100 p-2">
						<div class="flex items-center gap-2">
							<i class="fa-duotone fa-box text-primary"></i>
							<span class="text-sm font-medium">{type.name}</span>
						</div>
						<button
							class="btn text-error btn-ghost btn-xs"
							onclick={() => deleteContainerType(type.id)}
							aria-label={m.delete()}
						>
							<i class="fa-solid fa-trash"></i>
						</button>
					</div>
				{:else}
					<p class="text-center text-sm opacity-50">{m.noContainerTypesYet()}</p>
				{/each}
			</div>

			<div class="mt-3 flex gap-2">
				<input
					type="text"
					class="input input-sm flex-1"
					placeholder={m.newContainerTypePlaceholder()}
					bind:value={newContainerType}
					onkeydown={(e) => e.key === 'Enter' && addContainerType()}
				/>
				<button
					class="btn btn-sm btn-primary"
					onclick={addContainerType}
					disabled={submittingContainer || !newContainerType.trim()}
				>
					{#if submittingContainer}
						<span class="loading loading-sm loading-spinner"></span>
					{:else}
						<i class="fa-solid fa-plus"></i>
					{/if}
					{m.add()}
				</button>
			</div>
		</FormFieldset>
	</div>
</div>
