<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import * as m from '$lib/paraglide/messages';

	let containerTypes = $state<any[]>([]);
	let locations = $state<any[]>([]);
	let submitting = $state(false);

	if (browser) {
		const typesQuery = client.liveQuery.containerTypes({ id: true, name: true });
		typesQuery.subscribe((v) => {
			if (v) containerTypes = v;
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
		const number = (form.get('number') as string) || undefined;
		const typeId = (form.get('typeId') as string) || undefined;
		const description = (form.get('description') as string) || undefined;
		const locationId = (form.get('locationId') as string) || undefined;
		const locationDetail = (form.get('locationDetail') as string) || undefined;

		try {
			const result = await client.mutate.createContainer({
				__args: { number, typeId, description, locationId, locationDetail },
				id: true
			});
			if (result?.id) {
				goto(`/app/containers/${result.id}`);
			}
		} finally {
			submitting = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-6 text-2xl font-bold">
		<i class="fa-duotone fa-plus mr-2"></i>{m.newContainer()}
	</h1>

	<form onsubmit={handleSubmit} class="flex flex-col gap-4">
		<FormFieldset title={m.general()}>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerNumber()}</legend>
				<input
					name="number"
					type="text"
					class="input w-full"
					placeholder={m.containerNumberPlaceholder()}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerType()}</legend>
				<select name="typeId" class="select w-full">
					<option value="">{m.noType()}</option>
					{#each containerTypes as type}
						<option value={type.id}>{type.name}</option>
					{/each}
				</select>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerDescription()}</legend>
				<textarea name="description" class="textarea w-full" rows="3"></textarea>
			</fieldset>
		</FormFieldset>

		<FormFieldset title={m.location()}>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">{m.containerLocation()}</legend>
				<select name="locationId" class="select w-full">
					<option value="">{m.noLocation()}</option>
					{#each locations as location}
						<option value={location.id}>{location.name}</option>
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
				/>
			</fieldset>
		</FormFieldset>

		<div class="mt-2 flex gap-2">
			<a href="/app/containers" class="btn btn-ghost">
				<i class="fa-solid fa-arrow-left"></i>
				{m.cancel()}
			</a>
			<button type="submit" class="btn flex-1 btn-primary" disabled={submitting}>
				{#if submitting}
					<span class="loading loading-sm loading-spinner"></span>
				{:else}
					<i class="fa-solid fa-save"></i>
				{/if}
				{m.create()}
				{m.containers()}
			</button>
		</div>
	</form>
</div>
