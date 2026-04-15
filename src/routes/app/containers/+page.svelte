<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';

	let search = $state('');
	let containersList = $state<any[]>([]);

	if (browser) {
		const containers = client.liveQuery.containers({
			id: true,
			number: true,
			description: true,
			qrCode: true,
			locationDetail: true,
			type: { name: true },
			location: { name: true },
			items: { id: true }
		});
		containers.subscribe((v) => {
			if (v) containersList = v;
		});
	}

	const filtered = $derived(
		containersList.filter(
			(c) =>
				!search ||
				(c.number ?? '').toLowerCase().includes(search.toLowerCase()) ||
				(c.description ?? '').toLowerCase().includes(search.toLowerCase())
		)
	);
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">
			<i class="fa-duotone fa-box mr-2"></i>{m.containers()}
		</h1>
		<a href="/app/containers/new" class="btn btn-sm btn-primary">
			<i class="fa-solid fa-plus"></i>
			{m.newContainer()}
		</a>
	</div>

	<div class="flex gap-2">
		<label class="input-bordered input flex flex-1 items-center gap-2">
			<i class="fa-solid fa-magnifying-glass opacity-50"></i>
			<input type="text" class="grow" placeholder={m.searchContainers()} bind:value={search} />
		</label>
	</div>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
		{#each filtered as container}
			<a
				href="/app/containers/{container.id}"
				class="card bg-base-100 shadow-sm transition hover:shadow-md"
			>
				<div class="card-body">
					<h2 class="card-title">
						<i class="fa-duotone fa-box text-primary"></i>
						{container.number ?? 'Unnamed'}
					</h2>
					{#if container.description}
						<p class="text-sm opacity-70">{container.description}</p>
					{/if}
					<div class="flex flex-wrap gap-2 text-xs">
						{#if container.type}
							<span class="badge badge-ghost badge-sm">{container.type.name}</span>
						{/if}
						{#if container.location}
							<span class="badge badge-outline badge-sm">
								<i class="fa-solid fa-location-dot mr-1"></i>{container.location.name}
							</span>
						{/if}
						<span class="badge badge-sm badge-info">
							<i class="fa-solid fa-cubes mr-1"></i>{m.itemsInContainer({
								count: container.items?.length ?? 0
							})}
						</span>
					</div>
				</div>
			</a>
		{:else}
			<p class="col-span-full text-center opacity-50">
				{#if search}
					{m.noContainersMatching({ query: search })}
				{:else}
					{m.noContainersYet()}
				{/if}
			</p>
		{/each}
	</div>
</div>
