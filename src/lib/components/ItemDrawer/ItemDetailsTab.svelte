<script lang="ts">
	import QrCodeDisplay from '$lib/components/QrCodeDisplay.svelte';
	import InfoCard from '$lib/components/InfoCard.svelte';
	import DetailCard from '$lib/components/DetailCard.svelte';
	import { openContainerDrawer } from '$lib/components/EntityDrawer/entityDrawerState.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ItemDetailView } from '$lib/types/views';

	interface Props {
		item: ItemDetailView;
	}

	let { item }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
	<!-- Row 1: ID + Quantity + Location | QR-Code -->
	{#if item.customId}
		<InfoCard
			value={item.customId}
			label={m.customId()}
			icon="fa-solid fa-fingerprint"
			mono
			large
			class={item.quantity != null ? '' : 'md:col-span-2 xl:col-span-2'}
		/>
	{/if}

	{#if item.quantity != null}
		<InfoCard
			value={item.quantity}
			label={m.itemQuantity()}
			icon="fa-solid fa-cubes-stacked"
			large
		/>
	{/if}

	<!-- Location card -->
	{#if item.container}
		<button
			onclick={() => openContainerDrawer(item.container!.id)}
			class="card overflow-hidden border text-left transition-colors md:col-span-2 xl:col-span-2 {item.isTemporarilyMoved &&
			item.temporaryLocation
				? 'border-warning bg-warning hover:bg-warning/20'
				: 'border-base-300 bg-base-100 hover:bg-base-200'}"
		>
			<div class="card-body gap-1 py-4">
				{#if item.isTemporarilyMoved && item.temporaryLocation}
					<div class="flex items-center gap-2 overflow-hidden">
						<i class="fa-solid fa-box shrink-0 opacity-40"></i>
						<span class="truncate text-xl font-bold line-through opacity-40">
							{item.container.label ?? 'Unnamed'}
						</span>
						<i class="fa-solid fa-arrow-right shrink-0 opacity-40"></i>
						<span class="truncate text-xl font-bold">{item.temporaryLocation}</span>
					</div>
				{:else}
					<div class="flex items-center gap-2 overflow-hidden">
						<i class="fa-solid fa-box shrink-0 text-primary"></i>
						<span class="truncate text-xl font-bold">
							{item.container.label ?? 'Unnamed'}
						</span>
					</div>
				{/if}
				<span class="text-xs opacity-50">
					<i class="fa-solid fa-location-dot mr-1"></i>
					{#if item.container.location}
						{item.container.location.name}
					{:else}
						{m.location()}
					{/if}
				</span>
			</div>
		</button>
	{:else if item.location}
		<div
			class="card overflow-hidden border md:col-span-2 xl:col-span-2 {item.isTemporarilyMoved &&
			item.temporaryLocation
				? 'border-warning bg-warning'
				: 'border-base-300 bg-base-100'}"
		>
			<div class="card-body gap-1 py-4">
				{#if item.isTemporarilyMoved && item.temporaryLocation}
					<div class="flex items-center gap-2 overflow-hidden">
						<i class="fa-solid fa-location-dot shrink-0 opacity-40"></i>
						<span class="truncate text-xl font-bold line-through opacity-40"
							>{item.location.name}</span
						>
						<i class="fa-solid fa-arrow-right shrink-0 opacity-40"></i>
						<span class="truncate text-xl font-bold">{item.temporaryLocation}</span>
					</div>
				{:else}
					<div class="flex items-center gap-2 overflow-hidden">
						<i class="fa-solid fa-location-dot shrink-0 text-primary"></i>
						<span class="truncate text-xl font-bold">{item.location.name}</span>
					</div>
				{/if}
				<span class="text-xs opacity-50">
					<i class="fa-solid fa-location-dot mr-1"></i>{m.location()}
				</span>
			</div>
		</div>
	{:else}
		<div
			class="card overflow-hidden border md:col-span-2 xl:col-span-2 {item.isTemporarilyMoved &&
			item.temporaryLocation
				? 'border-warning bg-warning'
				: 'border-base-300 bg-base-100'}"
		>
			<div class="card-body gap-1 py-4">
				{#if item.isTemporarilyMoved && item.temporaryLocation}
					<div class="flex items-center gap-2 overflow-hidden">
						<i class="fa-solid fa-arrow-right shrink-0 opacity-40"></i>
						<span class="truncate text-xl font-bold">{item.temporaryLocation}</span>
					</div>
					<span class="text-xs opacity-50">
						<i class="fa-solid fa-location-dot mr-1"></i>{m.temporaryLocation()}
					</span>
				{:else}
					<div class="flex items-center gap-2">
						<i class="fa-solid fa-cube shrink-0 opacity-40"></i>
						<span class="text-xl font-bold opacity-50">{m.soloItem()}</span>
					</div>
					<span class="text-xs opacity-50">
						<i class="fa-solid fa-location-dot mr-1"></i>{m.location()}
					</span>
				{/if}
			</div>
		</div>
	{/if}

	<!-- QR-Code: on lg spans all rows in col 5, on md/sm goes to bottom -->
	<div
		class="card overflow-hidden border border-base-300 bg-base-100 md:col-span-2 xl:col-span-1 xl:col-start-5 xl:row-span-3 xl:row-start-1"
	>
		<div class="card-body items-center justify-center">
			{#if item.customId}
				<QrCodeDisplay value={`STOCK:item:${item.customId}`} label={item.name} />
			{:else}
				<div class="alert text-sm alert-warning">
					<i class="fa-solid fa-triangle-exclamation"></i>
					<span>{m.noCustomIdWarning()}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Row 2: Type, Serial, Value, Location Detail -->
	{#if item.type}
		<InfoCard value={item.type.name} label={m.itemType()} icon="fa-solid fa-tag" />
	{/if}

	{#if item.serialNumber}
		<InfoCard
			value={item.serialNumber}
			label={m.itemSerialNumber()}
			icon="fa-solid fa-barcode"
			mono
		/>
	{/if}

	{#if item.value != null}
		<InfoCard
			value="{(item.value / 100).toFixed(2)} EUR"
			label={m.itemValue()}
			icon="fa-solid fa-euro-sign"
		/>
	{/if}

	{#if item.locationDetail}
		<InfoCard
			value={item.locationDetail}
			label={m.itemLocationDetail()}
			icon="fa-solid fa-map-pin"
		/>
	{/if}

	<!-- Row 3: Description + Aliases -->
	{#if item.description}
		<DetailCard
			title={m.description()}
			icon="fa-duotone fa-align-left"
			class="md:col-span-2 {item.aliases?.length > 0 ? 'xl:col-span-2' : 'xl:col-span-4'}"
		>
			<p>{item.description}</p>
		</DetailCard>
	{/if}

	{#if item.aliases?.length > 0}
		<DetailCard
			title={m.aliases()}
			icon="fa-duotone fa-tags"
			class="md:col-span-2 {item.description ? 'xl:col-span-2' : 'xl:col-span-4'}"
		>
			<div class="flex flex-wrap gap-2">
				{#each item.aliases as alias}
					<span class="badge badge-soft badge-outline">{alias}</span>
				{/each}
			</div>
		</DetailCard>
	{/if}
</div>
