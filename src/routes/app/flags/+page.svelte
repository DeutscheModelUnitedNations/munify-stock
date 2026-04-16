<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import * as m from '$lib/paraglide/messages';
	import {
		createSvelteTable,
		FlexRender,
		getCoreRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		renderSnippet,
		type ColumnDef,
		type SortingState,
		type PaginationState
	} from '$lib/components/TanStackTable';
	import { DataTable } from '$lib/components/TanStackTable/ui';
	import type { FlagListView } from '$lib/types/views';

	let flags = $state<FlagListView[]>([]);
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

	let sorting = $state<SortingState>([{ id: 'countryName', desc: false }]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 });
	let globalFilter = $state('');

	const columns: ColumnDef<FlagListView>[] = [
		{
			accessorKey: 'countryCode',
			header: m.countryCode(),
			cell: ({ row }) =>
				renderSnippet(flagCell, {
					code: row.original.countryCode
				})
		},
		{
			accessorKey: 'countryName',
			header: m.countryName()
		},
		{
			accessorKey: 'quantity',
			header: m.quantity(),
			cell: ({ row }) => renderSnippet(quantityCell, row.original.quantity)
		},
		{
			id: 'container',
			accessorFn: (row) => row.container?.label ?? '',
			header: m.itemContainer(),
			cell: ({ row }) => renderSnippet(containerCell, row.original.container)
		}
	];

	const table = createSvelteTable({
		get data() {
			return flags;
		},
		columns,
		state: {
			get sorting() {
				return sorting;
			},
			get pagination() {
				return pagination;
			},
			get globalFilter() {
				return globalFilter;
			}
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		onGlobalFilterChange: (updater) => {
			globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
		},
		globalFilterFn: 'includesString',
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	});

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

{#snippet flagCell(props: { code: string })}
	<span class="flex items-center gap-2">
		<span class="fi fi-{props.code.toLowerCase()} text-xl"></span>
		<span class="font-mono text-xs opacity-70">{props.code.toUpperCase()}</span>
	</span>
{/snippet}

{#snippet quantityCell(quantity: number | null)}
	<span class="badge badge-soft badge-sm badge-info">x{quantity ?? 0}</span>
{/snippet}

{#snippet containerCell(container: { id: string; label: string | null } | null)}
	{#if container}
		<span class="badge badge-soft badge-outline badge-sm">{container.label ?? 'Box'}</span>
	{:else}
		<span class="opacity-40">--</span>
	{/if}
{/snippet}

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
			<input
				type="text"
				class="grow"
				placeholder={m.searchFlags()}
				value={globalFilter}
				oninput={(e) => {
					globalFilter = e.currentTarget.value;
					pagination = { ...pagination, pageIndex: 0 };
				}}
			/>
		</label>
	</div>

	<DataTable.Root>
		<DataTable.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<tr>
					{#each headerGroup.headers as header (header.id)}
						<DataTable.Head>
							{#if !header.isPlaceholder}
								<button
									class="flex items-center gap-2"
									class:cursor-pointer={header.column.getCanSort()}
									onclick={() => header.column.toggleSorting()}
								>
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
									{#if header.column.getIsSorted() === 'asc'}
										<i class="fa-duotone fa-arrow-down-a-z text-xs"></i>
									{:else if header.column.getIsSorted() === 'desc'}
										<i class="fa-duotone fa-arrow-down-z-a text-xs"></i>
									{:else if header.column.getCanSort()}
										<i class="fa-duotone fa-arrows-up-down text-xs opacity-30"></i>
									{/if}
								</button>
							{/if}
						</DataTable.Head>
					{/each}
				</tr>
			{/each}
		</DataTable.Header>
		<DataTable.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<DataTable.Row class="!cursor-default">
					{#each row.getVisibleCells() as cell (cell.id)}
						<DataTable.Cell>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</DataTable.Cell>
					{/each}
				</DataTable.Row>
			{:else}
				<tr>
					<td colspan={columns.length} class="text-center opacity-50">
						{#if globalFilter}
							{m.noFlagsMatching({ query: globalFilter })}
						{:else}
							{m.noFlagsYet()}
						{/if}
					</td>
				</tr>
			{/each}
		</DataTable.Body>
	</DataTable.Root>

	<DataTable.Pagination {table} />
</div>
