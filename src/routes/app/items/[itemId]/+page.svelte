<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import QrCodeDisplay from '$lib/components/QrCodeDisplay.svelte';
	import * as m from '$lib/paraglide/messages';

	let activeTab = $state<'details' | 'history' | 'comments'>('details');
	let item = $state<any>(null);
	let auditLogs = $state<any[]>([]);

	if (browser) {
		const itemQuery = client.liveQuery.item({
			__args: { id: page.params.itemId! },
			id: true,
			customId: true,
			name: true,
			description: true,
			quantity: true,
			serialNumber: true,
			value: true,
			qrCode: true,
			photo: true,
			warningFlag: true,
			warningFlagNote: true,
			locationDetail: true,
			createdAt: true,
			updatedAt: true,
			type: { id: true, name: true },
			containerId: true,
			container: { id: true, label: true, description: true, location: { id: true, name: true } },
			locationId: true,
			location: { id: true, name: true },
			isTemporarilyMoved: true,
			temporaryLocation: true,
			aliases: true,
			comments: {
				id: true,
				text: true,
				createdAt: true,
				createdByUser: { givenName: true, familyName: true }
			}
		});
		itemQuery.subscribe((v) => {
			if (v) item = v;
		});

		const logsQuery = client.liveQuery.auditLogs({
			__args: { where: { recordId: page.params.itemId! } },
			id: true,
			action: true,
			fieldName: true,
			oldValue: true,
			newValue: true,
			changedAt: true,
			changedBy: true
		});
		logsQuery.subscribe((v) => {
			if (v) auditLogs = v;
		});
	}
</script>

{#if item}
	<div class="flex flex-col gap-4">
		{#if item.isTemporarilyMoved}
			<div class="alert alert-warning">
				<i class="fa-solid fa-person-walking-luggage"></i>
				<span>{m.temporarilyAt({ location: item.temporaryLocation ?? '' })}</span>
			</div>
		{/if}

		<div class="flex items-center gap-3">
			<a href="/app/items" class="btn btn-ghost btn-sm" aria-label="Back to items">
				<i class="fa-solid fa-arrow-left"></i>
			</a>
			<h1 class="text-2xl font-bold">{item.name}</h1>
			{#if item.warningFlag}
				<span class="badge gap-1 badge-warning">
					<i class="fa-solid fa-triangle-exclamation"></i>
					{item.warningFlagNote ?? m.itemWarning()}
				</span>
			{/if}
			{#if item.quantity != null}
				<span class="badge badge-info">Qty: {item.quantity}</span>
			{/if}
		</div>

		<!-- Tabs -->
		<div role="tablist" class="tabs-bordered tabs">
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'details'}
				onclick={() => (activeTab = 'details')}
			>
				<i class="fa-duotone fa-circle-info mr-1"></i>
				{m.details()}
			</button>
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'history'}
				onclick={() => (activeTab = 'history')}
			>
				<i class="fa-duotone fa-clock-rotate-left mr-1"></i>
				{m.history()} ({auditLogs.length})
			</button>
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'comments'}
				onclick={() => (activeTab = 'comments')}
			>
				<i class="fa-duotone fa-comments mr-1"></i>
				{m.comments()} ({item.comments?.length ?? 0})
			</button>
		</div>

		<!-- Details Tab -->
		{#if activeTab === 'details'}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="card-title text-sm opacity-70">
							<i class="fa-duotone fa-info-circle"></i>
							{m.information()}
						</h2>
						<div class="flex flex-col gap-2 text-sm">
							<div class="flex justify-between">
								<span class="opacity-70">{m.itemType()}</span>
								<span>{item.type?.name ?? '--'}</span>
							</div>
							<div class="flex justify-between">
								<span class="opacity-70">{m.itemSerialNumber()}</span>
								<span>{item.serialNumber ?? '--'}</span>
							</div>
							<div class="flex justify-between">
								<span class="opacity-70">{m.itemValue()}</span>
								<span>{item.value != null ? `${(item.value / 100).toFixed(2)} EUR` : '--'}</span>
							</div>
							<div class="flex justify-between">
								<span class="opacity-70">{m.customId()}</span>
								<span>{item.customId ?? '--'}</span>
							</div>
							<div class="flex justify-between">
								<span class="opacity-70">{m.itemQrCode()}</span>
								<span>{item.qrCode ?? '--'}</span>
							</div>
							<div class="flex justify-between">
								<span class="opacity-70">{m.itemLocationDetail()}</span>
								<span>{item.locationDetail ?? '--'}</span>
							</div>
						</div>
					</div>
				</div>

				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="card-title text-sm opacity-70">
							<i class="fa-duotone fa-location-dot"></i>
							{m.location()}
						</h2>
						{#if item.container}
							<div class="flex flex-col gap-1">
								{#if item.container.location}
									<span class="text-sm opacity-70">{item.container.location.name}</span>
								{/if}
								<a href="/app/containers/{item.container.id}" class="link link-primary">
									<i class="fa-solid fa-box mr-1"></i>
									{item.container.label ?? 'Unnamed'}{item.container.description
										? ` - ${item.container.description}`
										: ''}
								</a>
							</div>
						{:else if item.location}
							<span>
								<i class="fa-solid fa-location-dot mr-1 text-primary"></i>
								{item.location.name}
							</span>
						{:else}
							<span class="opacity-40">{m.notAssigned()}</span>
						{/if}
					</div>
				</div>

				<div class="card bg-base-100 shadow-sm">
					<div class="card-body items-center">
						<h2 class="card-title text-sm opacity-70">
							<i class="fa-duotone fa-qrcode"></i>
							{m.qrCode()}
						</h2>
						{#if item.customId}
							<QrCodeDisplay value={`STOCK:item:${item.customId}`} label={item.name} />
						{:else}
							<div class="alert text-sm alert-warning">
								<i class="fa-solid fa-triangle-exclamation"></i>
								<span>{m.noCustomIdWarning()}</span>
							</div>
						{/if}
					</div>
				</div>

				{#if item.description}
					<div class="card bg-base-100 shadow-sm md:col-span-2">
						<div class="card-body">
							<h2 class="card-title text-sm opacity-70">
								<i class="fa-duotone fa-align-left"></i>
								{m.description()}
							</h2>
							<p>{item.description}</p>
						</div>
					</div>
				{/if}

				{#if item.aliases?.length > 0}
					<div class="card bg-base-100 shadow-sm md:col-span-2">
						<div class="card-body">
							<h2 class="card-title text-sm opacity-70">
								<i class="fa-duotone fa-tags"></i>
								{m.aliases()}
							</h2>
							<div class="flex flex-wrap gap-2">
								{#each item.aliases as alias}
									<span class="badge badge-outline">{alias}</span>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- History Tab -->
		{#if activeTab === 'history'}
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
										<span class="badge badge-sm badge-success">{m.created()}</span>
									{:else if log.action === 'UPDATE'}
										<span class="badge badge-sm badge-info">{m.updated()}</span>
									{:else}
										<span class="badge badge-sm badge-error">{m.deleted()}</span>
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
		{/if}

		<!-- Comments Tab -->
		{#if activeTab === 'comments'}
			<div class="flex flex-col gap-3">
				{#each item.comments ?? [] as comment}
					<div class="card bg-base-100 shadow-sm">
						<div class="card-body py-3">
							<div class="flex items-center gap-2 text-xs opacity-70">
								<i class="fa-duotone fa-user"></i>
								{comment.createdByUser
									? `${comment.createdByUser.givenName} ${comment.createdByUser.familyName}`
									: 'Unknown'}
								<span>&middot;</span>
								{new Date(comment.createdAt).toLocaleString()}
							</div>
							<p>{comment.text}</p>
						</div>
					</div>
				{:else}
					<p class="text-center opacity-50">{m.noCommentsYet()}</p>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="flex justify-center p-8">
		<span class="loading loading-lg loading-spinner"></span>
	</div>
{/if}
