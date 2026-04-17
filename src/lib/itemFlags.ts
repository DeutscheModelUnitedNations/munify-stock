import * as m from '$lib/paraglide/messages';

export interface ItemFlagDef {
	key: 'isDamaged' | 'needsReview' | 'isMissing';
	label: () => string;
	icon: string;
	badgeClass: string;
}

export const ITEM_FLAGS: ItemFlagDef[] = [
	{
		key: 'isDamaged',
		label: () => m.flagDamaged(),
		icon: 'fa-solid fa-wine-glass-crack',
		badgeClass: 'badge-error'
	},
	{
		key: 'needsReview',
		label: () => m.flagNeedsReview(),
		icon: 'fa-solid fa-clipboard-check',
		badgeClass: 'badge-warning'
	},
	{
		key: 'isMissing',
		label: () => m.flagMissing(),
		icon: 'fa-solid fa-ghost',
		badgeClass: 'badge-error'
	}
];

export type ItemFlagFields = Record<'isDamaged' | 'needsReview' | 'isMissing', boolean>;

export function hasAnyFlag(item: ItemFlagFields): boolean {
	return item.isDamaged || item.needsReview || item.isMissing;
}

export function getActiveFlags(item: ItemFlagFields): ItemFlagDef[] {
	return ITEM_FLAGS.filter((f) => item[f.key]);
}
