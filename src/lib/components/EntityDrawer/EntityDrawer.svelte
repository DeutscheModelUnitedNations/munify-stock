<script lang="ts">
	import { Drawer } from 'vaul-svelte';
	import {
		getDrawerState,
		closeDrawer,
		openItemDrawer,
		openContainerDrawer
	} from './entityDrawerState.svelte';
	import ItemDrawerContent from '$lib/components/ItemDrawer/ItemDrawerContent.svelte';
	import ContainerDrawerContent from '$lib/components/ContainerDrawer/ContainerDrawerContent.svelte';
	import { queryParam } from 'sveltekit-search-params';

	const drawerState = getDrawerState();
	const itemParam = queryParam('item');
	const containerParam = queryParam('container');

	let closing = $state(false);

	// URL -> State sync (only when drawer is closed, e.g. page load with ?item=xxx)
	$effect(() => {
		if (closing || drawerState.isOpen) return;
		if ($itemParam) {
			openItemDrawer($itemParam);
		} else if ($containerParam) {
			openContainerDrawer($containerParam);
		}
	});

	// State -> URL sync
	$effect(() => {
		if (drawerState.isOpen && drawerState.id) {
			if (drawerState.type === 'item') {
				$itemParam = drawerState.id;
				$containerParam = null;
			} else if (drawerState.type === 'container') {
				$containerParam = drawerState.id;
				$itemParam = null;
			}
		} else if (!drawerState.isOpen) {
			$itemParam = null;
			$containerParam = null;
		}
	});

	// Reset closing guard once URL params cleared
	$effect(() => {
		if (closing && !$itemParam && !$containerParam) {
			closing = false;
		}
	});

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closing = true;
			closeDrawer();
		}
	};
</script>

<Drawer.Root direction="bottom" open={drawerState.isOpen} onOpenChange={handleOpenChange}>
	<Drawer.Portal>
		<Drawer.Overlay class="fixed inset-0 z-40 bg-black/40" />
		<Drawer.Content
			class="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[90vh] max-w-7xl flex-col rounded-t-2xl bg-base-100 shadow-2xl"
		>
			<div class="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-base-300"></div>
			<Drawer.Close
				class="btn absolute top-4 right-4 z-10 btn-square btn-ghost btn-sm"
				aria-label="Close"
			>
				<i class="fa-solid fa-xmark"></i>
			</Drawer.Close>
			<Drawer.Title class="sr-only">
				{drawerState.type === 'item' ? 'Item' : 'Container'}
			</Drawer.Title>
			{#key `${drawerState.type}:${drawerState.id}`}
				{#if drawerState.type === 'item' && drawerState.id}
					<ItemDrawerContent itemId={drawerState.id} />
				{:else if drawerState.type === 'container' && drawerState.id}
					<ContainerDrawerContent containerId={drawerState.id} />
				{/if}
			{/key}
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
