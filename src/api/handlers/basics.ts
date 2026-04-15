import { schema } from '$api/db/db';
import { object, pubsub as rumblePubsub, query } from '$api/rumble';

/**
 * Strips null values from an object, converting them to undefined.
 * This is needed because GraphQL args use `null` for absent optional fields,
 * but Drizzle ORM expects `undefined`.
 */
export function stripNulls<T extends Record<string, unknown>>(
	obj: T
): { [K in keyof T]: Exclude<T[K], null> } {
	return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null)) as {
		[K in keyof T]: Exclude<T[K], null>;
	};
}

/**
 * Implements basic CRUD stuff for a table using the rumble helpers
 */
export function basics<TableName extends Parameters<typeof object>[0]['table']>(table: TableName) {
	const ref = object({
		table
	});
	const pubsub = rumblePubsub({ table: table });
	query({
		table: table
	});
	return {
		ref,
		pubsub,
		table: schema[table]
	};
}
