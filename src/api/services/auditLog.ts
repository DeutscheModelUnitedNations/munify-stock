import { db, schema } from '$api/db/db';

export async function logChange({
	tableName,
	recordId,
	action,
	fieldName,
	oldValue,
	newValue,
	changedBy
}: {
	tableName: string;
	recordId: string;
	action: 'INSERT' | 'UPDATE' | 'DELETE';
	fieldName?: string;
	oldValue?: string;
	newValue?: string;
	changedBy?: string;
}) {
	await db.insert(schema.auditLog).values({
		tableName,
		recordId,
		action,
		fieldName,
		oldValue,
		newValue,
		changedBy
	});
}

/**
 * Log all changed fields between old and new values of a record.
 */
export async function logUpdate({
	tableName,
	recordId,
	oldValues,
	newValues,
	changedBy
}: {
	tableName: string;
	recordId: string;
	oldValues: Record<string, unknown>;
	newValues: Record<string, unknown>;
	changedBy?: string;
}) {
	for (const key of Object.keys(newValues)) {
		if (newValues[key] !== undefined && String(oldValues[key]) !== String(newValues[key])) {
			await logChange({
				tableName,
				recordId,
				action: 'UPDATE',
				fieldName: key,
				oldValue: oldValues[key] != null ? String(oldValues[key]) : undefined,
				newValue: newValues[key] != null ? String(newValues[key]) : undefined,
				changedBy
			});
		}
	}
}
