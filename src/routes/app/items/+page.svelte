<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';
	import {
		openItemDrawer,
		openContainerDrawer
	} from '$lib/components/EntityDrawer/entityDrawerState.svelte';
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
		type PaginationState,
		type FilterFn,
		type Row
	} from '$lib/components/TanStackTable';
	import { DataTable } from '$lib/components/TanStackTable/ui';
	import type { ItemListView } from '$lib/types/views';
	import { hasAnyFlag, getActiveFlags } from '$lib/itemFlags';

	let itemsList = $state<ItemListView[]>([]);

	if (browser) {
		const items = client.liveQuery.items({
			id: true,
			customId: true,
			name: true,
			quantity: true,
			isDamaged: true,
			needsReview: true,
			isMissing: true,
			qrCode: true,
			aliases: true,
			type: { name: true },
			container: { id: true, label: true },
			comments: { id: true, resolved: true, parentId: true }
		});
		items.subscribe((v) => {
			if (v) itemsList = v;
		});
	}

	// Custom global filter that also searches aliases
	const aliasAwareFilter: FilterFn<ItemListView> = (
		row: Row<ItemListView>,
		_columnId: string,
		filterValue: string
	) => {
		const search = filterValue.toLowerCase();
		const item = row.original;
		return (
			item.name.toLowerCase().includes(search) ||
			(item.customId ?? '').toLowerCase().includes(search) ||
			(item.aliases ?? []).some((a: string) => a.toLowerCase().includes(search)) ||
			(item.type?.name ?? '').toLowerCase().includes(search) ||
			(item.container?.label ?? '').toLowerCase().includes(search)
		);
	};

	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 });
	let globalFilter = $state('');

	const columns: ColumnDef<ItemListView>[] = [
		{
			accessorKey: 'name',
			header: m.itemName(),
			cell: ({ row }) =>
				renderSnippet(nameCell, {
					id: row.original.id,
					name: row.original.name,
					quantity: row.original.quantity
				})
		},
		{
			accessorKey: 'customId',
			header: m.customId(),
			cell: ({ row }) => renderSnippet(customIdCell, row.original.customId)
		},
		{
			id: 'type',
			accessorFn: (row) => row.type?.name ?? '',
			header: m.itemType(),
			cell: ({ row }) => renderSnippet(badgeCell, row.original.type?.name ?? null)
		},
		{
			accessorKey: 'quantity',
			header: m.itemQuantity(),
			cell: ({ row }) => row.original.quantity ?? '--'
		},
		{
			id: 'container',
			accessorFn: (row) => row.container?.label ?? '',
			header: m.itemContainer(),
			cell: ({ row }) => renderSnippet(containerCell, row.original.container)
		},
		{
			id: 'flags',
			accessorFn: (row) => (hasAnyFlag(row) ? 'flagged' : 'ok'),
			header: m.itemFlags(),
			cell: ({ row }) => renderSnippet(flagsCell, row.original)
		},
		{
			id: 'unresolvedComments',
			accessorFn: (row) => row.comments?.filter((c) => !c.resolved && !c.parentId).length ?? 0,
			header: m.comments(),
			cell: ({ row }) =>
				renderSnippet(
					commentCountCell,
					row.original.comments?.filter((c) => !c.resolved && !c.parentId).length ?? 0
				)
		}
	];

	const table = createSvelteTable({
		get data() {
			return itemsList;
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
		globalFilterFn: aliasAwareFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	});
</script>

{#snippet customIdCell(customId: string | null)}
	<span class="font-mono">{customId ?? '--'}</span>
{/snippet}

{#snippet nameCell(props: { id: string; name: string; quantity: number | null })}
	<button onclick={() => openItemDrawer(props.id)} class="link text-left font-medium link-hover">
		<span class="inline-flex items-baseline gap-1">
			<i
				class="fa-duotone {props.quantity && props.quantity > 1
					? 'fa-cubes'
					: 'fa-cube'} shrink-0 text-primary"
			></i>
			<span>{props.name}</span>
		</span>
	</button>
{/snippet}

{#snippet badgeCell(value: string | null)}
	{#if value}
		<span class="badge badge-soft badge-sm">{value}</span>
	{:else}
		<span class="opacity-40">--</span>
	{/if}
{/snippet}

{#snippet containerCell(container: { id: string; label: string | null } | null)}
	{#if container}
		<button onclick={() => openContainerDrawer(container.id)} class="link text-left link-hover">
			<i class="fa-duotone fa-box mr-1 text-primary"></i>
			{container.label ?? 'Container'}
		</button>
	{:else}
		<span class="opacity-40">--</span>
	{/if}
{/snippet}

{#snippet flagsCell(item: ItemListView)}
	{#if hasAnyFlag(item)}
		<div class="flex flex-wrap gap-1">
			{#each getActiveFlags(item) as flag}
				<span class="badge gap-1 badge-soft badge-sm {flag.badgeClass}">
					<i class={flag.icon}></i>
					{flag.label()}
				</span>
			{/each}
		</div>
	{:else}
		<span class="badge gap-1 badge-soft badge-sm badge-success">
			<i class="fa-solid fa-check"></i>
			{m.ok()}
		</span>
	{/if}
{/snippet}

{#snippet commentCountCell(count: number)}
	{#if count > 0}
		<span class="badge badge-soft badge-sm badge-warning">
			<i class="fa-solid fa-comment mr-1"></i>{count}
		</span>
	{:else}
		<span class="opacity-40">--</span>
	{/if}
{/snippet}

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">
			<i class="fa-duotone fa-cubes mr-2"></i>{m.items()}
		</h1>
		<a href="/app/items/new" class="btn btn-sm btn-primary">
			<i class="fa-solid fa-plus"></i>
			{m.newItem()}
		</a>
	</div>

	<div class="flex gap-2">
		<label class="input-bordered input flex flex-1 items-center gap-2">
			<i class="fa-solid fa-magnifying-glass opacity-50"></i>
			<input
				type="text"
				class="grow"
				placeholder={m.searchItems()}
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
				<DataTable.Row onclick={() => openItemDrawer(row.original.id)}>
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
							{m.noItemsMatching({ query: globalFilter })}
						{:else}
							{m.noItemsYet()}
						{/if}
					</td>
				</tr>
			{/each}
		</DataTable.Body>
	</DataTable.Root>

	<DataTable.Pagination {table} />
</div>
