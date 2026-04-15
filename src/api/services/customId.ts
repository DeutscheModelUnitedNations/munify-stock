import { db, schema } from '$api/db/db';
import { sql } from 'drizzle-orm';

const CUSTOM_ID_REGEX = /^[a-zA-Z0-9\-._]+$/;

export async function resolveCustomId(
	table: typeof schema.item | typeof schema.container,
	providedCustomId: string | null | undefined
): Promise<string> {
	if (providedCustomId) {
		if (!CUSTOM_ID_REGEX.test(providedCustomId)) {
			throw new Error(
				'Invalid customId: only alphanumeric characters, hyphens, dots, and underscores are allowed'
			);
		}
		return providedCustomId;
	}

	const result = await db.execute(
		sql`SELECT MAX(CAST(custom_id AS INTEGER)) as max_id FROM ${table} WHERE custom_id ~ '^[0-9]+$'`
	);
	const maxId = (result.rows[0]?.max_id as number | null) ?? 0;
	return (maxId + 1).toString();
}
