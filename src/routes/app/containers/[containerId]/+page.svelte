<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import QrCodeDisplay from '$lib/components/QrCodeDisplay.svelte';
	import * as m from '$lib/paraglide/messages';

	let container = $state<any>(null);

	if (browser) {
		const containerQuery = client.liveQuery.container({
			__args: { id: page.params.containerId! },
			id: true,
			number: true,
			description: true,
			qrCode: true,
			locationDetail: true,
			createdAt: true,
			type: { id: true, name: true },
			location: { id: true, name: true },
			items: {
				id: true,
				name: true,
				quantity: true,
				warningFlag: true,
				type: { name: true }
			}
		});
		containerQuery.subscribe((v) => {
			if (v) container = v;
		});
	}
</script>

{#if container}
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-3">
			<a href="/app/containers" class="btn btn-ghost btn-sm" aria-label="Back to containers">
				<i class="fa-solid fa-arrow-left"></i>
			</a>
			<h1 class="text-2xl font-bold">
				<i class="fa-duotone fa-box mr-2 text-primary"></i>
				{container.number ?? 'Unnamed Container'}
			</h1>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body">
					<h2 class="card-title text-sm opacity-70">
						<i class="fa-duotone fa-info-circle"></i>
						{m.details()}
					</h2>
					<div class="flex flex-col gap-2 text-sm">
						<div class="flex justify-between">
							<span class="opacity-70">{m.containerType()}</span>
							<span>{container.type?.name ?? '--'}</span>
						</div>
						<div class="flex justify-between">
							<span class="opacity-70">{m.containerLocation()}</span>
							<span>{container.location?.name ?? '--'}</span>
						</div>
						<div class="flex justify-between">
							<span class="opacity-70">{m.containerLocationDetail()}</span>
							<span>{container.locationDetail ?? '--'}</span>
						</div>
						<div class="flex justify-between">
							<span class="opacity-70">{m.qrCode()}</span>
							<span>{container.qrCode ?? '--'}</span>
						</div>
					</div>
					{#if container.description}
						<div class="mt-2 border-t border-base-300 pt-2">
							<p class="text-sm">{container.description}</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="card bg-base-100 shadow-sm">
				<div class="card-body items-center">
					<h2 class="card-title text-sm opacity-70">
						<i class="fa-duotone fa-qrcode"></i>
						{m.qrCode()}
					</h2>
					<QrCodeDisplay
						value={container.qrCode ?? `STOCK:container:${container.id}`}
						label={container.number ?? 'Container'}
					/>
				</div>
			</div>

			<div class="card bg-base-100 shadow-sm md:col-span-2">
				<div class="card-body">
					<h2 class="card-title text-sm opacity-70">
						<i class="fa-duotone fa-cubes"></i>
						{m.items()} ({container.items?.length ?? 0})
					</h2>
					{#if container.items?.length > 0}
						<ul class="flex flex-col gap-1">
							{#each container.items as item}
								<li>
									<a
										href="/app/items/{item.id}"
										class="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-base-200"
									>
										{#if item.warningFlag}
											<i class="fa-solid fa-triangle-exclamation text-warning"></i>
										{:else}
											<i class="fa-duotone fa-cube text-base-content/50"></i>
										{/if}
										<span class="flex-1">{item.name}</span>
										{#if item.type}
											<span class="badge badge-ghost badge-xs">{item.type.name}</span>
										{/if}
										{#if item.quantity != null}
											<span class="badge badge-xs badge-info">x{item.quantity}</span>
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm opacity-50">{m.noItemsInContainer()}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="flex justify-center p-8">
		<span class="loading loading-lg loading-spinner"></span>
	</div>
{/if}
