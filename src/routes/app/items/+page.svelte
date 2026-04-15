<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';

	let search = $state('');
	let itemsList = $state<any[]>([]);

	if (browser) {
		const items = client.liveQuery.items({
			id: true,
			name: true,
			quantity: true,
			warningFlag: true,
			warningFlagNote: true,
			qrCode: true,
			type: { name: true },
			container: { id: true, number: true }
		});
		items.subscribe((v) => {
			if (v) itemsList = v;
		});
	}

	const filtered = $derived(
		itemsList.filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()))
	);
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">
			<i class="fa-duotone fa-boxes-stacked mr-2"></i>{m.items()}
		</h1>
		<a href="/app/items/new" class="btn btn-sm btn-primary">
			<i class="fa-solid fa-plus"></i>
			{m.newItem()}
		</a>
	</div>

	<div class="flex gap-2">
		<label class="input-bordered input flex flex-1 items-center gap-2">
			<i class="fa-solid fa-magnifying-glass opacity-50"></i>
			<input type="text" class="grow" placeholder={m.searchItems()} bind:value={search} />
		</label>
	</div>

	<div class="overflow-x-auto">
		<table class="table">
			<thead>
				<tr>
					<th>{m.itemName()}</th>
					<th>{m.itemType()}</th>
					<th>{m.itemQuantity()}</th>
					<th>{m.itemContainer()}</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as item}
					<tr class="hover:bg-base-200">
						<td>
							<a href="/app/items/{item.id}" class="link font-medium link-hover">
								{item.name}
							</a>
						</td>
						<td>
							{#if item.type}
								<span class="badge badge-ghost badge-sm">{item.type.name}</span>
							{:else}
								<span class="opacity-40">--</span>
							{/if}
						</td>
						<td>{item.quantity ?? '--'}</td>
						<td>
							{#if item.container}
								<a href="/app/containers/{item.container.id}" class="link link-hover">
									{item.container.number ?? 'Container'}
								</a>
							{:else}
								<span class="opacity-40">--</span>
							{/if}
						</td>
						<td>
							{#if item.warningFlag}
								<span class="badge gap-1 badge-sm badge-warning">
									<i class="fa-solid fa-triangle-exclamation"></i>
									{m.itemWarning()}
								</span>
							{:else}
								<span class="badge gap-1 badge-sm badge-success">
									<i class="fa-solid fa-check"></i>
									{m.ok()}
								</span>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" class="text-center opacity-50">
							{#if search}
								{m.noItemsMatching({ query: search })}
							{:else}
								{m.noItemsYet()}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
