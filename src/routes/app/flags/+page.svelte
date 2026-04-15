<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	import type { FlagListView } from '$lib/types/views';

	let flags = $state<FlagListView[]>([]);
	let search = $state('');
	let showAddForm = $state(false);
	let submitting = $state(false);

	if (browser) {
		const flagsQuery = client.liveQuery.flags({
			id: true,
			countryCode: true,
			countryName: true,
			quantity: true,
			notes: true,
			container: { id: true, label: true }
		});
		flagsQuery.subscribe((v) => {
			if (v) flags = v;
		});
	}

	const filtered = $derived(
		flags.filter(
			(f) =>
				!search ||
				f.countryName.toLowerCase().includes(search.toLowerCase()) ||
				f.countryCode.toLowerCase().includes(search.toLowerCase())
		)
	);

	async function handleAdd(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		const form = new FormData(e.target as HTMLFormElement);
		const countryCode = (form.get('countryCode') as string).toLowerCase();
		const countryName = form.get('countryName') as string;
		const quantity = form.get('quantity') ? Number(form.get('quantity')) : undefined;

		try {
			await client.mutate.createFlag({
				__args: { countryCode, countryName, quantity },
				id: true
			});
			showAddForm = false;
			(e.target as HTMLFormElement).reset();
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">
			<i class="fa-duotone fa-flag mr-2"></i>{m.flags()}
		</h1>
		<div class="flex gap-2">
			<a href="/app/flags/inventory" class="btn btn-outline btn-sm">
				<i class="fa-duotone fa-clipboard-list"></i>
				{m.inventorySessions()}
			</a>
			<button class="btn btn-sm btn-primary" onclick={() => (showAddForm = !showAddForm)}>
				<i class="fa-solid fa-plus"></i>
				{m.addFlag()}
			</button>
		</div>
	</div>

	{#if showAddForm}
		<form onsubmit={handleAdd} class="mx-auto w-full max-w-xl">
			<FormFieldset title={m.addFlag()}>
				<div class="flex gap-2">
					<fieldset class="fieldset w-24">
						<legend class="fieldset-legend">{m.countryCode()}</legend>
						<input
							name="countryCode"
							type="text"
							class="input w-full uppercase"
							placeholder="DE"
							maxlength="2"
							required
						/>
					</fieldset>
					<fieldset class="fieldset flex-1">
						<legend class="fieldset-legend">{m.countryName()}</legend>
						<input
							name="countryName"
							type="text"
							class="input w-full"
							placeholder="Germany"
							required
						/>
					</fieldset>
					<fieldset class="fieldset w-24">
						<legend class="fieldset-legend">{m.quantity()}</legend>
						<input name="quantity" type="number" min="1" class="input w-full" value="1" />
					</fieldset>
				</div>
				<div class="mt-2 flex justify-end gap-2">
					<button type="button" class="btn btn-ghost btn-sm" onclick={() => (showAddForm = false)}>
						{m.cancel()}
					</button>
					<button type="submit" class="btn btn-sm btn-primary" disabled={submitting}>
						{#if submitting}
							<span class="loading loading-sm loading-spinner"></span>
						{/if}
						{m.add()}
					</button>
				</div>
			</FormFieldset>
		</form>
	{/if}

	<div class="flex gap-2">
		<label class="input-bordered input flex flex-1 items-center gap-2">
			<i class="fa-solid fa-magnifying-glass opacity-50"></i>
			<input type="text" class="grow" placeholder={m.searchFlags()} bind:value={search} />
		</label>
	</div>

	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each filtered as flag}
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body items-center p-4">
					<span class="fi fi-{flag.countryCode.toLowerCase()} text-4xl"></span>
					<p class="text-sm font-medium">{flag.countryName}</p>
					<p class="text-xs opacity-50">{flag.countryCode.toUpperCase()}</p>
					<div class="flex gap-1">
						<span class="badge badge-sm badge-info">x{flag.quantity}</span>
						{#if flag.container}
							<span class="badge badge-outline badge-sm">{flag.container.label ?? 'Box'}</span>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<p class="col-span-full text-center opacity-50">
				{#if search}
					{m.noFlagsMatching({ query: search })}
				{:else}
					{m.noFlagsYet()}
				{/if}
			</p>
		{/each}
	</div>
</div>
