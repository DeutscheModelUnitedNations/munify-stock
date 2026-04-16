<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';
	import { openContainerDrawer } from '$lib/components/EntityDrawer/entityDrawerState.svelte';
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
	import type { ContainerListView } from '$lib/types/views';

	let containersList = $state<ContainerListView[]>([]);

	if (browser) {
		const containers = client.liveQuery.containers({
			id: true,
			customId: true,
			label: true,
			description: true,
			qrCode: true,
			locationDetail: true,
			type: { name: true },
			location: { name: true },
			items: { id: true },
			comments: { id: true, resolved: true, parentId: true }
		});
		containers.subscribe((v) => {
			if (v) containersList = v;
		});
	}

	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 });
	let globalFilter = $state('');

	const columns: ColumnDef<ContainerListView>[] = [
		{
			accessorKey: 'label',
			header: m.containerLabel(),
			cell: ({ row }) =>
				renderSnippet(labelCell, { id: row.original.id, label: row.original.label })
		},
		{
			accessorKey: 'customId',
			header: m.customId(),
			cell: ({ row }) => renderSnippet(customIdCell, row.original.customId)
		},
		{
			accessorKey: 'description',
			header: m.description(),
			cell: ({ row }) => renderSnippet(descriptionCell, row.original.description)
		},
		{
			id: 'type',
			accessorFn: (row) => row.type?.name ?? '',
			header: m.containerType(),
			cell: ({ row }) => renderSnippet(badgeCell, row.original.type?.name ?? null)
		},
		{
			id: 'location',
			accessorFn: (row) => row.location?.name ?? '',
			header: m.location(),
			cell: ({ row }) => renderSnippet(locationCell, row.original.location?.name ?? null)
		},
		{
			id: 'itemCount',
			accessorFn: (row) => row.items?.length ?? 0,
			header: m.items(),
			cell: ({ row }) => renderSnippet(itemCountCell, row.original.items?.length ?? 0)
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
			return containersList;
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
</script>

{#snippet labelCell(props: { id: string; label: string | null })}
	<button onclick={() => openContainerDrawer(props.id)} class="link font-medium link-hover">
		<i class="fa-duotone fa-box mr-1 text-primary"></i>
		{props.label ?? 'Unnamed'}
	</button>
{/snippet}

{#snippet customIdCell(customId: string | null)}
	<span class="font-mono text-xs opacity-70">{customId ?? '--'}</span>
{/snippet}

{#snippet descriptionCell(description: string | null)}
	{#if description}
		<span class="max-w-48 truncate text-sm opacity-70">{description}</span>
	{:else}
		<span class="opacity-40">--</span>
	{/if}
{/snippet}

{#snippet badgeCell(value: string | null)}
	{#if value}
		<span class="badge badge-ghost badge-sm">{value}</span>
	{:else}
		<span class="opacity-40">--</span>
	{/if}
{/snippet}

{#snippet locationCell(locationName: string | null)}
	{#if locationName}
		<span class="badge badge-outline badge-sm">
			<i class="fa-solid fa-location-dot mr-1"></i>{locationName}
		</span>
	{:else}
		<span class="opacity-40">--</span>
	{/if}
{/snippet}

{#snippet itemCountCell(count: number)}
	<span class="badge badge-sm badge-info">
		<i class="fa-solid fa-cubes mr-1"></i>{m.itemsInContainer({ count })}
	</span>
{/snippet}

{#snippet commentCountCell(count: number)}
	{#if count > 0}
		<span class="badge badge-sm badge-warning">
			<i class="fa-solid fa-comment mr-1"></i>{count}
		</span>
	{:else}
		<span class="opacity-40">--</span>
	{/if}
{/snippet}

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">
			<i class="fa-duotone fa-box mr-2"></i>{m.containers()}
		</h1>
		<a href="/app/containers/new" class="btn btn-sm btn-primary">
			<i class="fa-solid fa-plus"></i>
			{m.newContainer()}
		</a>
	</div>

	<div class="flex gap-2">
		<label class="input-bordered input flex flex-1 items-center gap-2">
			<i class="fa-solid fa-magnifying-glass opacity-50"></i>
			<input
				type="text"
				class="grow"
				placeholder={m.searchContainers()}
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
				<DataTable.Row onclick={() => openContainerDrawer(row.original.id)}>
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
							{m.noContainersMatching({ query: globalFilter })}
						{:else}
							{m.noContainersYet()}
						{/if}
					</td>
				</tr>
			{/each}
		</DataTable.Body>
	</DataTable.Root>

	<DataTable.Pagination {table} />
</div>
