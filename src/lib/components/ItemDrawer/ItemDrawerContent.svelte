<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import * as m from '$lib/paraglide/messages';

	import type { ItemDetailView, ItemAuditLogView } from '$lib/types/views';
	import type { NamedView, ContainerFormView } from '$lib/types/views';

	import { getActiveFlags } from '$lib/itemFlags';
	import ItemDetailsTab from './ItemDetailsTab.svelte';
	import ItemHistoryTab from './ItemHistoryTab.svelte';
	import CommentsSection from '$lib/components/Comments/CommentsSection.svelte';
	import ItemEditTab from './ItemEditTab.svelte';

	interface Props {
		itemId: string;
	}

	const props: Props = $props();

	let activeTab = $state<'details' | 'history' | 'comments' | 'edit'>('details');
	let item = $state<ItemDetailView | null>(null);
	let auditLogs = $state<ItemAuditLogView[]>([]);

	let itemTypes = $state<NamedView[]>([]);
	let containers = $state<ContainerFormView[]>([]);
	let locations = $state<NamedView[]>([]);

	const itemQuery = client.liveQuery.item({
		__args: { id: props.itemId },
		id: true,
		customId: true,
		name: true,
		description: true,
		quantity: true,
		serialNumber: true,
		value: true,
		qrCode: true,
		photo: true,
		isDamaged: true,
		needsReview: true,
		isMissing: true,
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
			updatedAt: true,
			resolved: true,
			resolvedAt: true,
			parentId: true,
			resolvedByUser: { givenName: true, familyName: true },
			createdByUser: { givenName: true, familyName: true },
			replies: {
				id: true,
				text: true,
				createdAt: true,
				updatedAt: true,
				createdByUser: { givenName: true, familyName: true }
			}
		}
	});
	itemQuery.subscribe((v) => {
		if (v) item = v;
	});

	const logsQuery = client.liveQuery.auditLogs({
		__args: { where: { recordId: props.itemId } },
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

	const typesQuery = client.liveQuery.itemTypes({ id: true, name: true });
	typesQuery.subscribe((v) => {
		if (v) itemTypes = v;
	});

	const containersQuery = client.liveQuery.containers({
		id: true,
		label: true,
		description: true
	});
	containersQuery.subscribe((v) => {
		if (v) containers = v;
	});

	const locationsQuery = client.liveQuery.locations({ id: true, name: true });
	locationsQuery.subscribe((v) => {
		if (v) locations = v;
	});
</script>

{#if item}
	<div class="flex flex-col gap-4 overflow-y-auto p-4 sm:p-6">
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-3">
				{#if item.quantity && item.quantity > 1}
					<i class="fa-duotone fa-cubes text-2xl text-primary"></i>
				{:else}
					<i class="fa-duotone fa-cube text-2xl text-primary"></i>
				{/if}
				<h1 class="text-2xl font-bold">{item.name}</h1>
			</div>
			{#if getActiveFlags(item).length > 0}
				<div class="flex flex-wrap gap-2">
					{#each getActiveFlags(item) as flag}
						<span class="badge gap-1 {flag.badgeClass}">
							<i class={flag.icon}></i>
							{flag.label()}
						</span>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Tabs -->
		<div role="tablist" class="tabs-border tabs">
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
				{m.history()}
				<span class="ml-1 badge badge-sm">{auditLogs.length}</span>
			</button>
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'comments'}
				onclick={() => (activeTab = 'comments')}
			>
				<i class="fa-duotone fa-comments mr-1"></i>
				{m.comments()}
				<span class="ml-1 badge badge-sm"
					>{item.comments?.filter((c) => !c.parentId && !c.resolved).length ?? 0}</span
				>
			</button>
			<button
				role="tab"
				class="tab"
				class:tab-active={activeTab === 'edit'}
				onclick={() => (activeTab = 'edit')}
			>
				<i class="fa-duotone fa-pen mr-1"></i>
				{m.edit()}
			</button>
		</div>

		{#if activeTab === 'details'}
			<ItemDetailsTab {item} />
		{:else if activeTab === 'history'}
			<ItemHistoryTab {auditLogs} />
		{:else if activeTab === 'comments'}
			<CommentsSection comments={item.comments ?? []} entityId={item.id} entityType="item" />
		{:else if activeTab === 'edit'}
			<ItemEditTab
				{item}
				{itemTypes}
				{containers}
				{locations}
				onsaved={() => (activeTab = 'details')}
			/>
		{/if}
	</div>
{:else}
	<div class="flex flex-1 items-center justify-center">
		<span class="loading loading-lg loading-spinner"></span>
	</div>
{/if}
