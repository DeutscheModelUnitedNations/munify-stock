<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';
	import {
		openItemDrawer,
		openContainerDrawer
	} from '$lib/components/EntityDrawer/entityDrawerState.svelte';
	import type {
		DashboardItemView,
		DashboardContainerView,
		IdView,
		DashboardAuditLogView,
		DashboardLocationView
	} from '$lib/types/views';
	import { ITEM_FLAGS } from '$lib/itemFlags';

	let itemsList = $state<DashboardItemView[]>([]);
	let containersList = $state<DashboardContainerView[]>([]);
	let flagsList = $state<IdView[]>([]);
	let auditLogsList = $state<DashboardAuditLogView[]>([]);
	let locationsList = $state<DashboardLocationView[]>([]);

	if (browser) {
		const items = client.liveQuery.items({
			id: true,
			name: true,
			isDamaged: true,
			needsReview: true,
			isMissing: true,
			isTemporarilyMoved: true,
			temporaryLocation: true
		});
		items.subscribe((v) => {
			if (v) itemsList = v;
		});

		const containers = client.liveQuery.containers({
			id: true,
			label: true,
			isTemporarilyMoved: true,
			temporaryLocation: true
		});
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

		const locations = client.liveQuery.locations({
			id: true,
			name: true,
			description: true,
			containers: { id: true, items: { id: true } },
			directItems: { id: true }
		});
		locations.subscribe((v) => {
			if (v) locationsList = v;
		});
	}

	const stats = $derived([
		{
			label: m.items(),
			value: itemsList.length,
			icon: 'fa-cubes',
			color: 'text-primary',
			bg: 'bg-base-200',
			href: '/app/items'
		},
		{
			label: m.containers(),
			value: containersList.length,
			icon: 'fa-box-isometric-tape',
			color: 'text-secondary',
			bg: 'bg-base-200',
			href: '/app/containers'
		},
		{
			label: m.flags(),
			value: flagsList.length,
			icon: 'fa-flag',
			color: 'text-accent',
			bg: 'bg-base-200',
			href: '/app/flags'
		}
	]);

	const TONE_BG = {
		error: 'bg-error/15',
		warning: 'bg-warning/15',
		success: 'bg-success/15',
		info: 'bg-info/15'
	} as const;
	const TONE_TEXT = {
		error: 'text-error',
		warning: 'text-warning',
		success: 'text-success',
		info: 'text-info'
	} as const;
	type Tone = keyof typeof TONE_BG;

	const movedItems = $derived(itemsList.filter((i) => i.isTemporarilyMoved));
	const movedContainers = $derived(containersList.filter((c) => c.isTemporarilyMoved));

	const warningStats = $derived([
		...ITEM_FLAGS.map((flag) => {
			const value = itemsList.filter((i) => i[flag.key]).length;
			const tone: Tone =
				value === 0 ? 'success' : (flag.badgeClass.replace('badge-', '') as 'error' | 'warning');
			return {
				label: flag.label(),
				value,
				icon: flag.icon,
				bg: TONE_BG[tone],
				accent: TONE_TEXT[tone]
			};
		}),
		(() => {
			const value = movedContainers.length;
			const tone: Tone = value === 0 ? 'success' : 'info';
			return {
				label: m.containersOnTheMove(),
				value,
				icon: 'fa-solid fa-box-isometric-tape',
				bg: TONE_BG[tone],
				accent: TONE_TEXT[tone]
			};
		})(),
		(() => {
			const value = movedItems.length;
			const tone: Tone = value === 0 ? 'success' : 'info';
			return {
				label: m.itemsOnTheMove(),
				value,
				icon: 'fa-solid fa-cube',
				bg: TONE_BG[tone],
				accent: TONE_TEXT[tone]
			};
		})()
	]);
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-bold">
		<i class="fa-duotone fa-gauge-high mr-2"></i>{m.dashboard()}
	</h1>

	<!-- Stats Cards -->
	<div class="grid grid-cols-3 gap-3">
		{#each stats as stat}
			<a
				href={stat.href}
				class="card {stat.bg} shadow-sm transition hover:bg-base-300 hover:shadow-md"
			>
				<div class="card-body p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs opacity-70">{stat.label}</p>
							<p class="text-3xl font-bold">{stat.value}</p>
						</div>
						<i class="fa-solid {stat.icon} text-3xl"></i>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- Warnings & On the Move -->
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="card-title text-base">
				<i class="fa-duotone fa-triangle-exclamation"></i>
				{m.warnings()}
			</h2>
			<div class="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
				{#each warningStats as warn}
					<a href="/app/items" class="rounded-lg {warn.bg} p-3 transition hover:opacity-80">
						<div class="flex items-center justify-between gap-2">
							<div class="min-w-0">
								<p class="truncate text-xs opacity-70">{warn.label}</p>
								<p class="text-2xl font-bold {warn.accent}">{warn.value}</p>
							</div>
							<i class="{warn.icon} text-2xl {warn.accent}"></i>
						</div>
					</a>
				{/each}
			</div>

			{#if movedItems.length > 0 || movedContainers.length > 0}
				<div class="divider my-1 text-xs">
					<i class="fa-duotone fa-person-walking-luggage mr-1"></i>
					{m.onTheMove()}
				</div>
				<div class="flex flex-col gap-1">
					{#each movedContainers as container}
						<button
							onclick={() => openContainerDrawer(container.id)}
							class="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-base-200"
						>
							<i class="fa-solid fa-box-isometric-tape text-secondary"></i>
							<span class="flex-1 font-medium">{container.label ?? 'Unnamed'}</span>
							<span class="text-xs opacity-60">{container.temporaryLocation}</span>
						</button>
					{/each}
					{#each movedItems as item}
						<button
							onclick={() => openItemDrawer(item.id)}
							class="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-base-200"
						>
							<i class="fa-solid fa-cube text-primary"></i>
							<span class="flex-1 font-medium">{item.name}</span>
							<span class="text-xs opacity-60">{item.temporaryLocation}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
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

	<!-- Location Overview -->
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="card-title text-base">
				<i class="fa-duotone fa-location-dot"></i>
				{m.locationOverview()}
			</h2>
			{#if locationsList.length > 0}
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{#each locationsList as loc}
						{@const containerCount = loc.containers?.length ?? 0}
						{@const itemsInContainersCount =
							loc.containers?.reduce(
								(sum: number, c: { id: string; items: IdView[] }) => sum + (c.items?.length ?? 0),
								0
							) ?? 0}
						{@const soloItemCount = loc.directItems?.length ?? 0}
						<a
							href="/app/admin/locations"
							class="card bg-base-200 shadow-sm transition hover:bg-base-300 hover:shadow-md"
						>
							<div class="card-body p-4">
								<h3 class="font-semibold">{loc.name}</h3>
								{#if loc.description}
									<p class="text-xs opacity-60">{loc.description}</p>
								{/if}
								<div class="mt-1 flex flex-wrap gap-3 text-sm">
									<span class="flex items-center gap-1">
										<i class="fa-solid fa-box-isometric-tape text-secondary"></i>
										{m.containersAtLocation({ count: containerCount })}
									</span>
									<span class="flex items-center gap-1">
										<i class="fa-solid fa-cubes text-primary"></i>
										{m.itemsInContainers({ count: itemsInContainersCount })}
									</span>
									<span class="flex items-center gap-1">
										<i class="fa-solid fa-cube text-accent"></i>
										{m.soloItemsAtLocation({ count: soloItemCount })}
									</span>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<p class="text-center text-sm opacity-50">{m.noLocationsOnDashboard()}</p>
			{/if}
		</div>
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
											<span class="badge badge-soft badge-xs badge-success">{m.created()}</span>
										{:else if log.action === 'UPDATE'}
											<span class="badge badge-soft badge-xs badge-info">{m.updated()}</span>
										{:else}
											<span class="badge badge-soft badge-xs badge-error">{m.deleted()}</span>
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
