<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';

	let itemsList = $state<any[]>([]);
	let containersList = $state<any[]>([]);
	let flagsList = $state<any[]>([]);
	let auditLogsList = $state<any[]>([]);

	if (browser) {
		const items = client.liveQuery.items({ id: true, warningFlag: true });
		items.subscribe((v) => {
			if (v) itemsList = v;
		});

		const containers = client.liveQuery.containers({ id: true });
		containers.subscribe((v) => {
			if (v) containersList = v;
		});

		const flags = client.liveQuery.flags({ id: true });
		flags.subscribe((v) => {
			if (v) flagsList = v;
		});

		const logs = client.liveQuery.auditLogs({
			id: true,
			tableName: true,
			recordId: true,
			action: true,
			fieldName: true,
			changedAt: true,
			changedBy: true
		});
		logs.subscribe((v) => {
			if (v) auditLogsList = v;
		});
	}

	const stats = $derived([
		{
			label: m.items(),
			value: itemsList.length,
			icon: 'fa-boxes-stacked',
			color: 'text-primary',
			href: '/app/items'
		},
		{
			label: m.containers(),
			value: containersList.length,
			icon: 'fa-box',
			color: 'text-secondary',
			href: '/app/containers'
		},
		{
			label: m.warnings(),
			value: itemsList.filter((i) => i.warningFlag).length,
			icon: 'fa-triangle-exclamation',
			color: 'text-warning',
			href: '/app/items'
		},
		{
			label: m.flags(),
			value: flagsList.length,
			icon: 'fa-flag',
			color: 'text-accent',
			href: '/app/flags'
		}
	]);
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-bold">
		<i class="fa-duotone fa-gauge-high mr-2"></i>{m.dashboard()}
	</h1>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		{#each stats as stat}
			<a href={stat.href} class="card bg-base-100 shadow-sm transition hover:shadow-md">
				<div class="card-body p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs opacity-70">{stat.label}</p>
							<p class="text-3xl font-bold">{stat.value}</p>
						</div>
						<i class="fa-duotone {stat.icon} {stat.color} text-3xl opacity-50"></i>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- Quick Actions -->
	<div class="flex flex-wrap gap-2">
		<a href="/app/items/new" class="btn btn-outline btn-sm">
			<i class="fa-solid fa-plus"></i>
			{m.newItem()}
		</a>
		<a href="/app/containers/new" class="btn btn-outline btn-sm">
			<i class="fa-solid fa-plus"></i>
			{m.newContainer()}
		</a>
		<a href="/app/scan" class="btn btn-outline btn-sm">
			<i class="fa-solid fa-qrcode"></i>
			{m.scanCodeTitle()}
		</a>
	</div>

	<!-- Recent Activity -->
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="card-title text-base">
				<i class="fa-duotone fa-clock-rotate-left"></i>
				{m.recentActivity()}
			</h2>
			{#if auditLogsList.length > 0}
				<div class="overflow-x-auto">
					<table class="table table-sm">
						<thead>
							<tr>
								<th>{m.action()}</th>
								<th>{m.table()}</th>
								<th>{m.field()}</th>
								<th>{m.when()}</th>
							</tr>
						</thead>
						<tbody>
							{#each auditLogsList.slice(0, 20) as log}
								<tr>
									<td>
										{#if log.action === 'INSERT'}
											<span class="badge badge-xs badge-success">{m.created()}</span>
										{:else if log.action === 'UPDATE'}
											<span class="badge badge-xs badge-info">{m.updated()}</span>
										{:else}
											<span class="badge badge-xs badge-error">{m.deleted()}</span>
										{/if}
									</td>
									<td class="text-xs">{log.tableName}</td>
									<td class="text-xs">{log.fieldName ?? '--'}</td>
									<td class="text-xs">{new Date(log.changedAt).toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-center text-sm opacity-50">{m.noActivityYet()}</p>
			{/if}
		</div>
	</div>
</div>
