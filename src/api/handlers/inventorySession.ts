import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { logChange } from '$api/services/auditLog';
import { eq } from 'drizzle-orm';
import { basics } from './basics';

const { ref, pubsub } = basics('inventorySession');

abilityBuilder.inventorySession.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.inventorySession.allow(['update', 'delete']).when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createInventorySession: t.drizzleField({
		type: ref,
		args: {
			name: t.arg.string({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();

			const [created] = await db
				.insert(schema.inventorySession)
				.values({ ...args, createdBy: user.sub })
				.returning();
			await logChange({
				tableName: 'inventorySession',
				recordId: created.id,
				action: 'INSERT',
				changedBy: user.sub
			});
			pubsub.created();
			const result = await db.query.inventorySession.findFirst(
				query(ctx.abilities.inventorySession.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateInventorySessionStatus: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			status: t.arg.string({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();

			const updates: Record<string, unknown> = {
				status: args.status as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
			};
			if (args.status === 'COMPLETED') {
				updates.endDate = new Date();
			}

			await db
				.update(schema.inventorySession)
				.set(updates)
				.where(eq(schema.inventorySession.id, args.id as string));
			pubsub.updated(args.id as string);
			const result = await db.query.inventorySession.findFirst(
				query(ctx.abilities.inventorySession.filter('read').query.single)
			);
			return result!;
		}
	})
}));

export { ref as InventorySessionRef };
