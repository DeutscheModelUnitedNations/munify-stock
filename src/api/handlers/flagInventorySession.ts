import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { logChange } from '$api/services/auditLog';
import { eq } from 'drizzle-orm';
import { basics } from './basics';

const { ref, pubsub } = basics('flagInventorySession');

abilityBuilder.flagInventorySession.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.flagInventorySession.allow(['update', 'delete']).when((ctx) => {
	if (isGlobalAdmin(ctx)) return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createFlagInventorySession: t.drizzleField({
		type: ref,
		args: {
			name: t.arg.string({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();

			const [created] = await db
				.insert(schema.flagInventorySession)
				.values({ ...args, createdBy: user.sub })
				.returning();
			await logChange({
				tableName: 'flagInventorySession',
				recordId: created.id,
				action: 'INSERT',
				changedBy: user.sub
			});
			pubsub.created();
			const result = await db.query.flagInventorySession.findFirst(
				query(ctx.abilities.flagInventorySession.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateFlagInventorySessionStatus: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			status: t.arg.string({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();

			await db
				.update(schema.flagInventorySession)
				.set({
					status: args.status as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
				})
				.where(eq(schema.flagInventorySession.id, args.id as string));
			pubsub.updated(args.id as string);
			const result = await db.query.flagInventorySession.findFirst(
				query(ctx.abilities.flagInventorySession.filter('read').query.single)
			);
			return result!;
		}
	})
}));

export { ref as FlagInventorySessionRef };
