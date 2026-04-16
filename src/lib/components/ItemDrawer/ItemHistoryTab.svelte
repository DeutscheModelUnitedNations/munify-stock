<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	import type { ItemAuditLogView } from '$lib/types/views';

	interface Props {
		auditLogs: ItemAuditLogView[];
	}

	let { auditLogs }: Props = $props();
</script>

<div class="overflow-x-auto">
	<table class="table table-sm">
		<thead>
			<tr>
				<th>{m.action()}</th>
				<th>{m.field()}</th>
				<th>{m.oldValue()}</th>
				<th>{m.newValue()}</th>
				<th>{m.when()}</th>
			</tr>
		</thead>
		<tbody>
			{#each auditLogs as log}
				<tr>
					<td>
						{#if log.action === 'INSERT'}
							<span class="badge badge-soft badge-sm badge-success">{m.created()}</span>
						{:else if log.action === 'UPDATE'}
							<span class="badge badge-soft badge-sm badge-info">{m.updated()}</span>
						{:else}
							<span class="badge badge-soft badge-sm badge-error">{m.deleted()}</span>
						{/if}
					</td>
					<td>{log.fieldName ?? '--'}</td>
					<td class="max-w-32 truncate">{log.oldValue ?? '--'}</td>
					<td class="max-w-32 truncate">{log.newValue ?? '--'}</td>
					<td>{new Date(log.changedAt).toLocaleString()}</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="text-center opacity-50">{m.noHistoryYet()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
