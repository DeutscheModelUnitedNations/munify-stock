<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import QrCodeDisplay from '$lib/components/QrCodeDisplay.svelte';
	import InfoCard from '$lib/components/InfoCard.svelte';
	import DetailCard from '$lib/components/DetailCard.svelte';
	import { openItemDrawer } from '$lib/components/EntityDrawer/entityDrawerState.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getActiveFlags } from '$lib/itemFlags';

	import type { ContainerDetailView } from '$lib/types/views';

	interface Props {
		containerId: string;
	}

	const props: Props = $props();

	let container = $state<ContainerDetailView | null>(null);

	const containerQuery = client.liveQuery.container({
		__args: { id: props.containerId },
		id: true,
		customId: true,
		label: true,
		description: true,
		qrCode: true,
		locationDetail: true,
		createdAt: true,
		isTemporarilyMoved: true,
		temporaryLocation: true,
		type: { id: true, name: true },
		location: { id: true, name: true },
		items: {
			id: true,
			name: true,
			quantity: true,
			isDamaged: true,
			needsReview: true,
			isMissing: true,
			type: { name: true }
		}
	});
	containerQuery.subscribe((v) => {
		if (v) container = v;
	});
</script>

{#if container}
	<div class="flex flex-col gap-4 overflow-y-auto p-4 sm:p-6">
		<div class="flex items-center gap-3">
			<i class="fa-duotone fa-box text-2xl text-primary"></i>
			<h1 class="text-2xl font-bold">{container.label ?? 'Unnamed Container'}</h1>
		</div>

		{#if container.isTemporarilyMoved}
			<div class="alert alert-warning">
				<i class="fa-solid fa-person-walking-luggage"></i>
				<span>{m.temporarilyAt({ location: container.temporaryLocation ?? '' })}</span>
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			{#if container.type}
				<InfoCard value={container.type.name} label={m.containerType()} icon="fa-solid fa-tag" />
			{/if}

			{#if container.location}
				<InfoCard
					value={container.location.name}
					label={m.containerLocation()}
					icon="fa-solid fa-location-dot"
				/>
			{/if}

			{#if container.locationDetail}
				<InfoCard
					value={container.locationDetail}
					label={m.containerLocationDetail()}
					icon="fa-solid fa-map-pin"
				/>
			{/if}

			{#if container.customId}
				<InfoCard
					value={container.customId}
					label={m.customId()}
					icon="fa-solid fa-fingerprint"
					mono
				/>
			{/if}
		</div>

		{#if container.description}
			<DetailCard title={m.description()} icon="fa-duotone fa-align-left">
				<p>{container.description}</p>
			</DetailCard>
		{/if}

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Items list -->
			<div class="card overflow-hidden border border-base-300 bg-base-100">
				<div class="card-body">
					<h2 class="card-title text-sm opacity-70">
						<i class="fa-duotone fa-cubes"></i>
						{m.items()} ({container.items?.length ?? 0})
					</h2>
					{#if (container.items?.length ?? 0) > 0}
						<ul class="flex flex-col gap-1">
							{#each container.items as item}
								<li>
									<button
										onclick={() => openItemDrawer(item.id)}
										class="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-base-200"
									>
										<i class="fa-duotone fa-cube text-base-content/50"></i>
										<span class="flex-1">{item.name}</span>
										{#each getActiveFlags(item) as flag}
											<i
												class="{flag.icon} text-xs {flag.badgeClass === 'badge-error'
													? 'text-error'
													: 'text-warning'}"
											></i>
										{/each}
										{#if item.type}
											<span class="badge badge-ghost badge-xs">{item.type.name}</span>
										{/if}
										{#if item.quantity != null}
											<span class="badge badge-xs badge-info">x{item.quantity}</span>
										{/if}
									</button>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm opacity-50">{m.noItemsInContainer()}</p>
					{/if}
				</div>
			</div>

			<!-- QR Code -->
			<div class="card overflow-hidden border border-base-300 bg-base-100">
				<div class="card-body items-center">
					{#if container.customId}
						<QrCodeDisplay
							value={`STOCK:container:${container.customId}`}
							label={container.label ?? 'Container'}
						/>
					{:else}
						<div class="alert text-sm alert-warning">
							<i class="fa-solid fa-triangle-exclamation"></i>
							<span>{m.noCustomIdWarning()}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="flex flex-1 items-center justify-center">
		<span class="loading loading-lg loading-spinner"></span>
	</div>
{/if}
