type EntityType = 'item' | 'container';

let activeType = $state<EntityType | null>(null);
let activeId = $state<string | null>(null);

export function openItemDrawer(itemId: string) {
	activeType = 'item';
	activeId = itemId;
}

export function openContainerDrawer(containerId: string) {
	activeType = 'container';
	activeId = containerId;
}

export function closeDrawer() {
	activeType = null;
	activeId = null;
}

export function getDrawerState() {
	return {
		get type() {
			return activeType;
		},
		get id() {
			return activeId;
		},
		get isOpen() {
			return activeId !== null;
		}
	};
}
