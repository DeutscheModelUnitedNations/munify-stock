<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import * as m from '$lib/paraglide/messages';

	import type { ItemDetailView, NamedView, ContainerFormView } from '$lib/types/views';

	interface Props {
		item: ItemDetailView;
		itemTypes: NamedView[];
		containers: ContainerFormView[];
		locations: NamedView[];
		onsaved: () => void;
	}

	let { item, itemTypes, containers, locations, onsaved }: Props = $props();

	let submitting = $state(false);
	let placementMode = $state<'container' | 'location'>('container');
	let isTemporarilyMoved = $state(false);
	let aliases = $state<string[]>([]);
	let aliasInput = $state('');

	$effect(() => {
		placementMode = item.containerId ? 'container' : 'location';
		isTemporarilyMoved = item.isTemporarilyMoved ?? false;
		aliases = [...(item.aliases ?? [])];
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		const form = new FormData(e.target as HTMLFormElement);

		const containerId =
			placementMode === 'container' ? (form.get('containerId') as string) || undefined : undefined;
		const locationId =
			placementMode === 'location' ? (form.get('locationId') as string) || undefined : undefined;
		const temporaryLocation = isTemporarilyMoved
			? (form.get('temporaryLocation') as string) || undefined
			: undefined;

		try {
			await client.mutate.updateItem({
				__args: {
					id: item.id,
					name: (form.get('name') as string) || undefined,
					customId: (form.get('customId') as string) || undefined,
					typeId: (form.get('typeId') as string) || undefined,
					description: (form.get('description') as string) || undefined,
					quantity: form.get('quantity') ? Number(form.get('quantity')) : undefined,
					serialNumber: (form.get('serialNumber') as string) || undefined,
					value: form.get('value') ? Math.round(Number(form.get('value')) * 100) : undefined,
					locationDetail: (form.get('locationDetail') as string) || undefined,
					containerId,
					locationId,
					isTemporarilyMoved,
					temporaryLocation,
					aliases
				},
				id: true
			});
			onsaved();
		} finally {
			submitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-4">
	<div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
		<FormFieldset title={m.general()}>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemName()} *</legend>
				<input name="name" type="text" class="input w-full" required value={item.name} />
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemType()}</legend>
				<select name="typeId" class="select w-full">
					<option value="">{m.itemNoType()}</option>
					{#each itemTypes as type}
						<option value={type.id} selected={type.id === item.type?.id}>{type.name}</option>
					{/each}
				</select>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemDescription()}</legend>
				<textarea name="description" class="textarea w-full" rows="3"
					>{item.description ?? ''}</textarea
				>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.aliases()}</legend>
				{#if aliases.length > 0}
					<div class="mb-2 flex flex-wrap gap-2">
						{#each aliases as alias, i}
							<span class="badge gap-1 badge-outline">
								{alias}
								<button
									type="button"
									class="btn btn-circle btn-ghost btn-xs"
									onclick={() => (aliases = aliases.filter((_, idx) => idx !== i))}
									aria-label={m.delete()}
								>
									<i class="fa-solid fa-xmark text-xs"></i>
								</button>
							</span>
						{/each}
					</div>
				{/if}
				<input
					type="text"
					class="input w-full"
					placeholder={m.aliasPlaceholder()}
					bind:value={aliasInput}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							const trimmed = aliasInput.trim();
							if (trimmed && !aliases.includes(trimmed)) {
								aliases = [...aliases, trimmed];
								aliasInput = '';
							}
						}
					}}
				/>
			</fieldset>
		</FormFieldset>

		<FormFieldset title={m.details()}>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.customId()}</legend>
				<input
					name="customId"
					type="text"
					class="input w-full"
					pattern="^[a-zA-Z0-9\-._]+$"
					value={item.customId ?? ''}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemQuantity()}</legend>
				<input
					name="quantity"
					type="number"
					min="1"
					class="input w-full"
					value={item.quantity ?? ''}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemSerialNumber()}</legend>
				<input
					name="serialNumber"
					type="text"
					class="input w-full"
					value={item.serialNumber ?? ''}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemValue()} (EUR)</legend>
				<input
					name="value"
					type="number"
					step="0.01"
					min="0"
					class="input w-full"
					value={item.value != null ? (item.value / 100).toFixed(2) : ''}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemLocationDetail()}</legend>
				<input
					name="locationDetail"
					type="text"
					class="input w-full"
					value={item.locationDetail ?? ''}
				/>
			</fieldset>
		</FormFieldset>

		<FormFieldset title={m.location()}>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.placementMode()}</legend>
				<div class="join w-full">
					<button
						type="button"
						class="btn join-item flex-1"
						class:btn-active={placementMode === 'container'}
						onclick={() => (placementMode = 'container')}
					>
						<i class="fa-solid fa-box"></i>
						{m.inContainer()}
					</button>
					<button
						type="button"
						class="btn join-item flex-1"
						class:btn-active={placementMode === 'location'}
						onclick={() => (placementMode = 'location')}
					>
						<i class="fa-solid fa-location-dot"></i>
						{m.atLocation()}
					</button>
				</div>
			</fieldset>

			{#if placementMode === 'container'}
				<fieldset class="fieldset">
					<legend class="fieldset-legend">{m.itemContainer()}</legend>
					<select name="containerId" class="select w-full">
						<option value="">{m.itemNoContainer()}</option>
						{#each containers as container}
							<option value={container.id} selected={container.id === item.containerId}>
								{container.label ?? 'Unnamed'}{container.description
									? ` - ${container.description}`
									: ''}
							</option>
						{/each}
					</select>
				</fieldset>
			{:else}
				<fieldset class="fieldset">
					<legend class="fieldset-legend">{m.location()}</legend>
					<select name="locationId" class="select w-full">
						<option value="">{m.noLocation()}</option>
						{#each locations as loc}
							<option value={loc.id} selected={loc.id === item.locationId}>{loc.name}</option>
						{/each}
					</select>
				</fieldset>
			{/if}

			<fieldset class="fieldset">
				<label class="label cursor-pointer justify-start gap-2">
					<input type="checkbox" class="checkbox" bind:checked={isTemporarilyMoved} />
					<span>{m.temporarilyMoved()}</span>
				</label>
			</fieldset>

			{#if isTemporarilyMoved}
				<fieldset class="fieldset">
					<legend class="fieldset-legend">{m.temporaryLocation()}</legend>
					<input
						name="temporaryLocation"
						type="text"
						class="input w-full"
						placeholder={m.temporaryLocationPlaceholder()}
						value={item.temporaryLocation ?? ''}
					/>
				</fieldset>
			{/if}
		</FormFieldset>
	</div>

	<div class="mt-2 flex gap-2">
		<button type="submit" class="btn flex-1 btn-primary" disabled={submitting}>
			{#if submitting}
				<span class="loading loading-sm loading-spinner"></span>
			{:else}
				<i class="fa-solid fa-save"></i>
			{/if}
			{m.save()}
		</button>
	</div>
</form>
