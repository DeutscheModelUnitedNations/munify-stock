<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import * as m from '$lib/paraglide/messages';

	import type { ContainerDetailView, NamedView } from '$lib/types/views';

	interface Props {
		container: ContainerDetailView;
		containerTypes: NamedView[];
		locations: NamedView[];
		onsaved: () => void;
	}

	let { container, containerTypes, locations, onsaved }: Props = $props();

	let submitting = $state(false);
	let isTemporarilyMoved = $state(false);

	$effect(() => {
		isTemporarilyMoved = container.isTemporarilyMoved ?? false;
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		const form = new FormData(e.target as HTMLFormElement);

		const temporaryLocation = isTemporarilyMoved
			? (form.get('temporaryLocation') as string) || undefined
			: undefined;

		try {
			await client.mutate.updateContainer({
				__args: {
					id: container.id,
					customId: (form.get('customId') as string) || undefined,
					typeId: (form.get('typeId') as string) || undefined,
					label: (form.get('label') as string) || undefined,
					description: (form.get('description') as string) || undefined,
					locationId: (form.get('locationId') as string) || undefined,
					locationDetail: (form.get('locationDetail') as string) || undefined,
					isTemporarilyMoved,
					temporaryLocation
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
	<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
		<FormFieldset title={m.general()}>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerLabel()}</legend>
				<input
					name="label"
					type="text"
					class="input w-full"
					placeholder={m.containerLabelPlaceholder()}
					value={container.label ?? ''}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerType()}</legend>
				<select name="typeId" class="select w-full">
					<option value="">{m.noType()}</option>
					{#each containerTypes as type}
						<option value={type.id} selected={type.id === container.type?.id}>{type.name}</option>
					{/each}
				</select>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerDescription()}</legend>
				<textarea name="description" class="textarea w-full" rows="3"
					>{container.description ?? ''}</textarea
				>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.customId()}</legend>
				<input
					name="customId"
					type="text"
					class="input w-full"
					placeholder={m.customIdPlaceholder()}
					pattern="^[a-zA-Z0-9\-._]+$"
					value={container.customId ?? ''}
				/>
			</fieldset>
		</FormFieldset>

		<FormFieldset title={m.location()}>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerLocation()}</legend>
				<select name="locationId" class="select w-full">
					<option value="">{m.noLocation()}</option>
					{#each locations as loc}
						<option value={loc.id} selected={loc.id === container.location?.id}>{loc.name}</option>
					{/each}
				</select>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerLocationDetail()}</legend>
				<input
					name="locationDetail"
					type="text"
					class="input w-full"
					placeholder={m.containerLocationDetailPlaceholder()}
					value={container.locationDetail ?? ''}
				/>
			</fieldset>

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
						value={container.temporaryLocation ?? ''}
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
