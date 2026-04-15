<script lang="ts" generics="TData">
	import type { Table } from '@tanstack/table-core';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		table: Table<TData>;
		pageSizeOptions?: number[];
	}

	let { table, pageSizeOptions = [10, 20, 50, 100] }: Props = $props();

	const pageIndex = $derived(table.getState().pagination.pageIndex);
	const pageCount = $derived(table.getPageCount());
	const pageSize = $derived(table.getState().pagination.pageSize);
	const totalRows = $derived(table.getFilteredRowModel().rows.length);
</script>

<div class="flex flex-wrap items-center justify-between gap-4 px-2 py-3">
	<div class="text-sm text-base-content/70">
		{totalRows}
		{m.entries()}
	</div>

	<div class="flex items-center gap-4">
		<div class="flex items-center gap-2">
			<select
				class="select-bordered select select-sm"
				value={pageSize}
				onchange={(e) => {
					table.setPageSize(Number(e.currentTarget.value));
				}}
			>
				{#each pageSizeOptions as size}
					<option value={size}>{size}</option>
				{/each}
			</select>
		</div>

		<div class="join">
			<button
				class="btn join-item btn-sm"
				aria-label="First page"
				onclick={() => table.firstPage()}
				disabled={!table.getCanPreviousPage()}
			>
				<i class="fa-solid fa-angles-left"></i>
			</button>
			<button
				class="btn join-item btn-sm"
				aria-label="Previous page"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				<i class="fa-solid fa-angle-left"></i>
			</button>
			<button class="btn pointer-events-none join-item btn-sm">
				{pageIndex + 1} / {pageCount}
			</button>
			<button
				class="btn join-item btn-sm"
				aria-label="Next page"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				<i class="fa-solid fa-angle-right"></i>
			</button>
			<button
				class="btn join-item btn-sm"
				aria-label="Last page"
				onclick={() => table.lastPage()}
				disabled={!table.getCanNextPage()}
			>
				<i class="fa-solid fa-angles-right"></i>
			</button>
		</div>
	</div>
</div>
