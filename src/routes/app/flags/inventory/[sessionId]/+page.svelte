<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';

	import type {
		FlagInventorySessionListView,
		FlagSimpleView,
		FlagCheckView
	} from '$lib/types/views';

	let session = $state<FlagInventorySessionListView | null>(null);
	let flags = $state<FlagSimpleView[]>([]);
	let checks = $state<FlagCheckView[]>([]);
	let search = $state('');

	const sessionId = page.params.sessionId!;

	if (browser) {
		const sessionQuery = client.liveQuery.flagInventorySession({
			__args: { id: sessionId },
			id: true,
			name: true,
			date: true,
			status: true
		});
		sessionQuery.subscribe((v) => {
			if (v) session = v;
		});

		const flagsQuery = client.liveQuery.flags({
			id: true,
			countryCode: true,
			countryName: true,
			quantity: true
		});
		flagsQuery.subscribe((v) => {
			if (v) flags = v;
		});

		const checksQuery = client.liveQuery.flagChecks({
			__args: { where: { sessionId } },
			id: true,
			flagId: true,
			found: true,
			condition: true,
			notes: true
		});
		checksQuery.subscribe((v) => {
			if (v) checks = v;
		});
	}

	function getCheck(flagId: string) {
		return checks.find((c) => c.flagId === flagId);
	}

	const filtered = $derived(
		flags.filter(
			(f) =>
				!search ||
				f.countryName.toLowerCase().includes(search.toLowerCase()) ||
				f.countryCode.toLowerCase().includes(search.toLowerCase())
		)
	);

	const checkedCount = $derived(checks.filter((c) => c.found).length);
	const totalCount = $derived(flags.length);
	const missingCount = $derived(checks.filter((c) => !c.found).length);

	async function toggleFlag(flagId: string, currentlyFound: boolean) {
		const existing = getCheck(flagId);
		if (existing) {
			await client.mutate.updateFlagCheck({
				__args: { id: existing.id, found: !currentlyFound },
				id: true
			});
		} else {
			await client.mutate.checkFlag({
				__args: { sessionId, flagId, found: true },
				id: true
			});
		}
	}

	async function setCondition(flagId: string, condition: string) {
		const existing = getCheck(flagId);
		if (existing) {
			await client.mutate.updateFlagCheck({
				__args: { id: existing.id, condition },
				id: true
			});
		}
	}

	async function updateStatus(status: string) {
		await client.mutate.updateFlagInventorySessionStatus({
			__args: { id: sessionId, status },
			id: true
		});
	}
</script>

{#if session}
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<a href="/app/flags/inventory" class="btn btn-ghost btn-sm" aria-label="Back">
					<i class="fa-solid fa-arrow-left"></i>
				</a>
				<div>
					<h1 class="text-2xl font-bold">
						<i class="fa-duotone fa-clipboard-check mr-2"></i>{session.name}
					</h1>
					<p class="text-xs opacity-50">{new Date(session.date).toLocaleDateString()}</p>
				</div>
			</div>
			<div class="flex gap-2">
				{#if session.status === 'PLANNED'}
					<button class="btn btn-sm btn-warning" onclick={() => updateStatus('IN_PROGRESS')}>
						<i class="fa-solid fa-play"></i>
						{m.start()}
					</button>
				{:else if session.status === 'IN_PROGRESS'}
					<button class="btn btn-sm btn-success" onclick={() => updateStatus('COMPLETED')}>
						<i class="fa-solid fa-check"></i>
						{m.complete()}
					</button>
				{/if}
			</div>
		</div>

		<!-- Progress -->
		<div class="flex items-center gap-4">
			<progress class="progress flex-1 progress-success" value={checkedCount} max={totalCount}
			></progress>
			<div class="flex gap-3 text-sm">
				<span class="text-success">
					<i class="fa-solid fa-check"></i>
					{checkedCount}
				</span>
				<span class="text-error">
					<i class="fa-solid fa-xmark"></i>
					{missingCount}
				</span>
				<span class="opacity-50">
					/ {totalCount}
				</span>
			</div>
		</div>

		<!-- Search -->
		<label class="input-bordered input flex items-center gap-2">
			<i class="fa-solid fa-magnifying-glass opacity-50"></i>
			<input type="text" class="grow" placeholder={m.searchFlags()} bind:value={search} />
		</label>

		<!-- Flag Checklist -->
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as flag}
				{@const check = getCheck(flag.id)}
				{@const isFound = check?.found ?? false}
				<div
					class="card bg-base-100 shadow-sm transition {isFound
						? 'border-l-4 border-success'
						: check && !isFound
							? 'border-l-4 border-error'
							: ''}"
				>
					<div class="card-body flex-row items-center gap-3 p-3">
						<button
							class="btn btn-sm {isFound ? 'btn-success' : 'btn-ghost'}"
							onclick={() => toggleFlag(flag.id, isFound)}
						>
							{#if isFound}
								<i class="fa-solid fa-check"></i>
							{:else}
								<i class="fa-regular fa-square"></i>
							{/if}
						</button>

						<span class="fi fi-{flag.countryCode.toLowerCase()} text-2xl"></span>

						<div class="flex-1">
							<p class="text-sm font-medium">{flag.countryName}</p>
							<p class="text-xs opacity-50">
								{flag.countryCode.toUpperCase()} &middot; x{flag.quantity}
							</p>
						</div>

						{#if check}
							<select
								class="select w-28 select-xs"
								value={check.condition ?? ''}
								onchange={(e) => setCondition(flag.id, (e.target as HTMLSelectElement).value)}
							>
								<option value="">-- {m.condition()} --</option>
								<option value="GOOD">{m.conditionGood()}</option>
								<option value="DAMAGED">{m.conditionDamaged()}</option>
								<option value="NEEDS_REPLACEMENT">{m.conditionNeedsReplacement()}</option>
							</select>
						{/if}
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
{:else}
	<div class="flex justify-center p-8">
		<span class="loading loading-lg loading-spinner"></span>
	</div>
{/if}
