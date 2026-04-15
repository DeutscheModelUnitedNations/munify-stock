<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import * as m from '$lib/paraglide/messages';

	let itemTypes = $state<any[]>([]);
	let containers = $state<any[]>([]);
	let locations = $state<any[]>([]);
	let submitting = $state(false);
	let placementMode = $state<'container' | 'location'>('container');
	let isTemporarilyMoved = $state(false);

	if (browser) {
		const typesQuery = client.liveQuery.itemTypes({ id: true, name: true });
		typesQuery.subscribe((v) => {
			if (v) itemTypes = v;
		});

		const containersQuery = client.liveQuery.containers({
			id: true,
			label: true,
			description: true
		});
		containersQuery.subscribe((v) => {
			if (v) containers = v;
		});

		const locationsQuery = client.liveQuery.locations({ id: true, name: true });
		locationsQuery.subscribe((v) => {
			if (v) locations = v;
		});
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		const form = new FormData(e.target as HTMLFormElement);
		const name = form.get('name') as string;
		const customId = (form.get('customId') as string) || undefined;
		const typeId = (form.get('typeId') as string) || undefined;
		const description = (form.get('description') as string) || undefined;
		const quantity = form.get('quantity') ? Number(form.get('quantity')) : undefined;
		const serialNumber = (form.get('serialNumber') as string) || undefined;

		const containerId =
			placementMode === 'container' ? (form.get('containerId') as string) || undefined : undefined;
		const locationId =
			placementMode === 'location' ? (form.get('locationId') as string) || undefined : undefined;

		const temporaryLocation = isTemporarilyMoved
			? (form.get('temporaryLocation') as string) || undefined
			: undefined;

		try {
			const result = await client.mutate.createItem({
				__args: {
					name,
					customId,
					typeId,
					description,
					containerId,
					locationId,
					quantity,
					serialNumber,
					isTemporarilyMoved,
					temporaryLocation
				},
				id: true
			});
			if (result?.id) {
				goto(`/app/items/${result.id}`);
			}
		} finally {
			submitting = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-6 text-2xl font-bold">
		<i class="fa-duotone fa-plus mr-2"></i>{m.newItem()}
	</h1>

	<form onsubmit={handleSubmit} class="flex flex-col gap-4">
		<FormFieldset title={m.general()}>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemName()} *</legend>
				<input name="name" type="text" class="input w-full" required />
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemType()}</legend>
				<select name="typeId" class="select w-full">
					<option value="">{m.itemNoType()}</option>
					{#each itemTypes as type}
						<option value={type.id}>{type.name}</option>
					{/each}
				</select>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemDescription()}</legend>
				<textarea name="description" class="textarea w-full" rows="3"></textarea>
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
					placeholder={m.customIdPlaceholder()}
				/>
				<p class="mt-1 text-xs text-base-content/50">{m.customIdHint()}</p>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemQuantity()}</legend>
				<input
					name="quantity"
					type="number"
					min="1"
					class="input w-full"
					placeholder={m.leaveEmptyForIndividual()}
				/>
				<p class="mt-1 text-xs text-base-content/50">
					{m.itemQuantityHint()}
				</p>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.itemSerialNumber()}</legend>
				<input name="serialNumber" type="text" class="input w-full" />
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
							<option value={container.id}>
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
							<option value={loc.id}>{loc.name}</option>
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
					/>
				</fieldset>
			{/if}
		</FormFieldset>

		<div class="mt-2 flex gap-2">
			<a href="/app/items" class="btn btn-ghost">
				<i class="fa-solid fa-arrow-left"></i>
				{m.cancel()}
			</a>
			<button type="submit" class="btn flex-1 btn-primary" disabled={submitting}>
				{#if submitting}
					<span class="loading loading-sm loading-spinner"></span>
				{:else}
					<i class="fa-solid fa-save"></i>
				{/if}
				{m.newItem()}
			</button>
		</div>
	</form>
</div>
