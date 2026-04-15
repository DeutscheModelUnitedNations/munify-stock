import type {
	AuditactionEnum,
	CheckstatusEnum,
	FlagconditionEnum,
	SessionstatusEnum
} from '$lib/generated-client/client';

// === Shared small shapes ===

export interface IdView {
	id: string;
}

export interface NamedView {
	id: string;
	name: string;
}

export interface NamedDescView {
	id: string;
	name: string;
	description: string | null;
}

export interface TypeView {
	name: string;
}

export interface LabelView {
	id: string;
	label: string | null;
}

// === Dashboard (app/+page.svelte) ===

export interface DashboardItemView {
	id: string;
	name: string;
	warningFlag: boolean;
	isTemporarilyMoved: boolean;
	temporaryLocation: string | null;
}

export interface DashboardContainerView {
	id: string;
	label: string | null;
	isTemporarilyMoved: boolean;
	temporaryLocation: string | null;
}

export interface DashboardLocationView {
	id: string;
	name: string;
	description: string | null;
	containers: { id: string; items: IdView[] }[] | null;
	directItems: IdView[] | null;
}

export interface DashboardAuditLogView {
	id: number;
	tableName: string;
	recordId: string;
	action: AuditactionEnum;
	fieldName: string | null;
	changedAt: Date;
	changedBy: string | null;
}

// === Items ===

export interface ItemListView {
	id: string;
	customId: string | null;
	name: string;
	quantity: number | null;
	warningFlag: boolean;
	warningFlagNote: string | null;
	qrCode: string | null;
	aliases: string[];
	type: TypeView | null;
	container: LabelView | null;
}

export interface ItemDetailView {
	id: string;
	customId: string | null;
	name: string;
	description: string | null;
	quantity: number | null;
	serialNumber: string | null;
	value: number | null;
	qrCode: string | null;
	photo: string | null;
	warningFlag: boolean;
	warningFlagNote: string | null;
	locationDetail: string | null;
	createdAt: Date;
	updatedAt: Date | null;
	type: NamedView | null;
	containerId: string | null;
	container: {
		id: string;
		label: string | null;
		description: string | null;
		location: NamedView | null;
	} | null;
	locationId: string | null;
	location: NamedView | null;
	isTemporarilyMoved: boolean;
	temporaryLocation: string | null;
	aliases: string[];
	comments:
		| {
				id: string;
				text: string;
				createdAt: Date;
				createdByUser: { givenName: string; familyName: string } | null;
		  }[]
		| null;
}

export interface ItemAuditLogView {
	id: number;
	action: AuditactionEnum;
	fieldName: string | null;
	oldValue: string | null;
	newValue: string | null;
	changedAt: Date;
	changedBy: string | null;
}

// === Containers ===

export interface ContainerListView {
	id: string;
	customId: string | null;
	label: string | null;
	description: string | null;
	qrCode: string | null;
	locationDetail: string | null;
	type: TypeView | null;
	location: TypeView | null;
	items: IdView[] | null;
}

export interface ContainerDetailView {
	id: string;
	customId: string | null;
	label: string | null;
	description: string | null;
	qrCode: string | null;
	locationDetail: string | null;
	createdAt: Date;
	isTemporarilyMoved: boolean;
	temporaryLocation: string | null;
	type: NamedView | null;
	location: NamedView | null;
	items:
		| {
				id: string;
				name: string;
				quantity: number | null;
				warningFlag: boolean;
				type: TypeView | null;
		  }[]
		| null;
}

export interface ContainerFormView {
	id: string;
	label: string | null;
	description: string | null;
}

// === Flags ===

export interface FlagListView {
	id: string;
	countryCode: string;
	countryName: string;
	quantity: number | null;
	notes: string | null;
	container: LabelView | null;
}

export interface FlagInventorySessionListView {
	id: string;
	name: string;
	date: Date;
	status: SessionstatusEnum;
}

export interface FlagCheckView {
	id: string;
	flagId: string;
	found: boolean;
	condition: FlagconditionEnum | null;
	notes: string | null;
}

export interface FlagSimpleView {
	id: string;
	countryCode: string;
	countryName: string;
	quantity: number | null;
}

// === Inventory ===

export interface InventorySessionListView {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date | null;
	status: SessionstatusEnum;
	checks: { id: string; status: CheckstatusEnum }[] | null;
}

export interface InventorySessionDetailView {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date | null;
	status: SessionstatusEnum;
}

export interface InventoryCheckListView {
	id: string;
	status: CheckstatusEnum;
	startedAt: Date | null;
	completedAt: Date | null;
	container: { id: string; label: string | null; description: string | null } | null;
	items: { id: string; found: boolean }[] | null;
}

export interface InventoryCheckDetailView {
	id: string;
	status: CheckstatusEnum;
	container: { id: string; label: string | null; description: string | null } | null;
}

export interface InventoryContainerItemView {
	id: string;
	name: string;
	quantity: number | null;
	warningFlag: boolean;
	type: TypeView | null;
}

export interface InventoryCheckItemView {
	id: string;
	checkId: string;
	itemId: string;
	found: boolean;
	notes: string | null;
	movedToContainerId: string | null;
}

export interface InventoryContainerSimpleView {
	id: string;
	label: string | null;
	description: string | null;
	items: IdView[] | null;
}

// === Admin ===

export interface LocationAdminView {
	id: string;
	name: string;
	description: string | null;
	containers: IdView[] | null;
}

export interface UserView {
	id: string;
	email: string;
	givenName: string;
	familyName: string;
	preferredUsername: string;
	createdAt: Date;
}

// === Search ===

export interface SearchItemView {
	id: string;
	customId: string | null;
	name: string;
	qrCode: string | null;
	type: TypeView | null;
	aliases: string[];
}

export interface SearchContainerView {
	id: string;
	customId: string | null;
	label: string | null;
	description: string | null;
}

export interface SearchFlagView {
	id: string;
	countryCode: string;
	countryName: string;
}
