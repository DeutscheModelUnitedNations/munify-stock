import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { eq } from 'drizzle-orm';
import { basics } from './basics';

const { ref, pubsub } = basics('inventoryCheck');

abilityBuilder.inventoryCheck.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.inventoryCheck.allow(['update', 'delete']).when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createInventoryCheck: t.drizzleField({
		type: ref,
		args: {
			sessionId: t.arg.id({ required: true }),
			containerId: t.arg.id({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();

			const [_created] = await db
				.insert(schema.inventoryCheck)
				.values({ ...args, checkedBy: user.sub, startedAt: new Date(), status: 'IN_PROGRESS' })
				.returning();
			pubsub.created();
			const result = await db.query.inventoryCheck.findFirst(
				query(ctx.abilities.inventoryCheck.filter('read').query.single)
			);
			return result!;
		}
	}),
	completeInventoryCheck: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();

			await db
				.update(schema.inventoryCheck)
				.set({ status: 'COMPLETED', completedAt: new Date() })
				.where(eq(schema.inventoryCheck.id, args.id as string));
			pubsub.updated(args.id as string);
			const result = await db.query.inventoryCheck.findFirst(
				query(ctx.abilities.inventoryCheck.filter('read').query.single)
			);
			return result!;
		}
	})
}));

export { ref as InventoryCheckRef };
