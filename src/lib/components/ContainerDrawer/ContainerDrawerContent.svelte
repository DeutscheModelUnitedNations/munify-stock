<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import * as m from '$lib/paraglide/messages';

	import type { ContainerDetailView, NamedView } from '$lib/types/views';

	import ContainerDetailsTab from './ContainerDetailsTab.svelte';
	import ContainerEditTab from './ContainerEditTab.svelte';
	import CommentsSection from '$lib/components/Comments/CommentsSection.svelte';

	interface Props {
		containerId: string;
	}

	const props: Props = $props();

	let activeTab = $state<'details' | 'comments' | 'edit'>('details');
	let container = $state<ContainerDetailView | null>(null);

	let containerTypes = $state<NamedView[]>([]);
	let locations = $state<NamedView[]>([]);

	const containerQuery = client.liveQuery.container({
		__args: { id: props.containerId },
		id: true,
		customId: true,
		label: true,
		description: true,
		qrCode: true,
		locationDetail: true,
		createdAt: true,
		isTemporarilyMoved: true,
		temporaryLocation: true,
		type: { id: true, name: true },
		location: { id: true, name: true },
		items: {
			id: true,
			name: true,
			quantity: true,
			isDamaged: true,
			needsReview: true,
			isMissing: true,
			type: { name: true }
		},
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
	containerQuery.subscribe((v) => {
		if (v) container = v;
	});

	const typesQuery = client.liveQuery.containerTypes({ id: true, name: true });
	typesQuery.subscribe((v) => {
		if (v) containerTypes = v;
	});

	const locationsQuery = client.liveQuery.locations({ id: true, name: true });
	locationsQuery.subscribe((v) => {
		if (v) locations = v;
	});
</script>

{#if container}
	<div class="flex flex-col gap-4 overflow-y-auto p-4 sm:p-6">
		<div class="flex items-center gap-3">
			<i class="fa-duotone fa-box text-2xl text-primary"></i>
			<h1 class="text-2xl font-bold">{container.label ?? 'Unnamed Container'}</h1>
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
				class:tab-active={activeTab === 'comments'}
				onclick={() => (activeTab = 'comments')}
			>
				<i class="fa-duotone fa-comments mr-1"></i>
				{m.comments()}
				<span class="ml-1 badge badge-sm"
					>{container.comments?.filter((c) => !c.parentId && !c.resolved).length ?? 0}</span
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
			<ContainerDetailsTab {container} />
		{:else if activeTab === 'comments'}
			<CommentsSection
				comments={container.comments ?? []}
				entityId={container.id}
				entityType="container"
			/>
		{:else if activeTab === 'edit'}
			<ContainerEditTab
				{container}
				{containerTypes}
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
