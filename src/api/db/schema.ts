import { nanoid } from '../../lib/helpers/nanoid';
import { pgTable, text, timestamp, pgEnum, boolean, integer, serial } from 'drizzle-orm/pg-core';

const defaultTimestamps = {
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'date' })
		.defaultNow()
		.$onUpdate(() => new Date())
};

const defaultIdAndTimestamps = {
	id: text()
		.$defaultFn(() => nanoid())
		.primaryKey()
		.notNull(),
	...defaultTimestamps
};

// --- Enums ---

export const auditAction = pgEnum('audit_action', ['INSERT', 'UPDATE', 'DELETE']);

export const sessionStatus = pgEnum('session_status', [
	'PLANNED',
	'IN_PROGRESS',
	'COMPLETED',
	'CANCELLED'
]);

export const checkStatus = pgEnum('check_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED']);

export const flagCondition = pgEnum('flag_condition', ['GOOD', 'DAMAGED', 'NEEDS_REPLACEMENT']);

// --- Tables ---

export const user = pgTable('user', {
	id: text().primaryKey().unique().notNull(),
	...defaultTimestamps,
	email: text().notNull().unique(),
	familyName: text().notNull(),
	givenName: text().notNull(),
	locale: text(),
	preferredUsername: text().notNull()
});

export const location = pgTable('location', {
	...defaultIdAndTimestamps,
	name: text().notNull().unique(),
	description: text()
});

export const itemType = pgTable('item_type', {
	...defaultIdAndTimestamps,
	name: text().notNull().unique(),
	description: text(),
	createdBy: text().references(() => user.id)
});

export const containerType = pgTable('container_type', {
	...defaultIdAndTimestamps,
	name: text().notNull().unique(),
	description: text(),
	createdBy: text().references(() => user.id)
});

export const container = pgTable('container', {
	...defaultIdAndTimestamps,
	typeId: text().references(() => containerType.id),
	number: text(),
	description: text(),
	locationId: text().references(() => location.id),
	locationDetail: text(),
	qrCode: text().unique(),
	createdBy: text().references(() => user.id)
});

export const item = pgTable('item', {
	...defaultIdAndTimestamps,
	name: text().notNull(),
	typeId: text().references(() => itemType.id),
	description: text(),
	photo: text(),
	serialNumber: text(),
	value: integer(),
	qrCode: text().unique(),
	quantity: integer(),
	containerId: text().references(() => container.id),
	locationDetail: text(),
	warningFlag: boolean().notNull().default(false),
	warningFlagNote: text(),
	createdBy: text().references(() => user.id),
	updatedBy: text().references(() => user.id)
});

export const itemAlias = pgTable('item_alias', {
	...defaultIdAndTimestamps,
	itemId: text()
		.notNull()
		.references(() => item.id, { onDelete: 'cascade' }),
	alias: text().notNull()
});

export const flag = pgTable('flag', {
	...defaultIdAndTimestamps,
	countryCode: text().notNull(),
	countryName: text().notNull(),
	quantity: integer().notNull().default(1),
	containerId: text().references(() => container.id),
	notes: text()
});

export const comment = pgTable('comment', {
	...defaultIdAndTimestamps,
	itemId: text()
		.notNull()
		.references(() => item.id, { onDelete: 'cascade' }),
	text: text().notNull(),
	createdBy: text().references(() => user.id)
});

export const auditLog = pgTable('audit_log', {
	id: serial().primaryKey(),
	tableName: text().notNull(),
	recordId: text().notNull(),
	action: auditAction().notNull(),
	fieldName: text(),
	oldValue: text(),
	newValue: text(),
	changedBy: text().references(() => user.id),
	changedAt: timestamp().defaultNow().notNull()
});

// --- Inventory ---

export const inventorySession = pgTable('inventory_session', {
	...defaultIdAndTimestamps,
	name: text().notNull(),
	startDate: timestamp().defaultNow().notNull(),
	endDate: timestamp(),
	status: sessionStatus().notNull().default('PLANNED'),
	createdBy: text().references(() => user.id)
});

export const inventoryCheck = pgTable('inventory_check', {
	...defaultIdAndTimestamps,
	sessionId: text()
		.notNull()
		.references(() => inventorySession.id, { onDelete: 'cascade' }),
	containerId: text()
		.notNull()
		.references(() => container.id),
	checkedBy: text().references(() => user.id),
	status: checkStatus().notNull().default('PENDING'),
	startedAt: timestamp(),
	completedAt: timestamp()
});

export const inventoryCheckItem = pgTable('inventory_check_item', {
	...defaultIdAndTimestamps,
	checkId: text()
		.notNull()
		.references(() => inventoryCheck.id, { onDelete: 'cascade' }),
	itemId: text()
		.notNull()
		.references(() => item.id),
	found: boolean().notNull().default(false),
	notes: text(),
	movedToContainerId: text().references(() => container.id)
});

// --- Flag Inventory ---

export const flagInventorySession = pgTable('flag_inventory_session', {
	...defaultIdAndTimestamps,
	name: text().notNull(),
	date: timestamp().defaultNow().notNull(),
	status: sessionStatus().notNull().default('PLANNED'),
	createdBy: text().references(() => user.id)
});

export const flagCheck = pgTable('flag_check', {
	...defaultIdAndTimestamps,
	sessionId: text()
		.notNull()
		.references(() => flagInventorySession.id, { onDelete: 'cascade' }),
	flagId: text()
		.notNull()
		.references(() => flag.id),
	found: boolean().notNull().default(false),
	condition: flagCondition(),
	notes: text(),
	checkedBy: text().references(() => user.id)
});
