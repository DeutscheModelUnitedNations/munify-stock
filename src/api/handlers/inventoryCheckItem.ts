import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('inventoryCheckItem');

abilityBuilder.inventoryCheckItem.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.inventoryCheckItem.allow(['update', 'delete']).when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	checkInventoryItem: t.drizzleField({
		type: ref,
		args: {
			checkId: t.arg.id({ required: true }),
			itemId: t.arg.id({ required: true }),
			found: t.arg.boolean({ required: true }),
			notes: t.arg.string(),
			movedToContainerId: t.arg.id()
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();

			const [created] = await db.insert(schema.inventoryCheckItem).values(args).returning();
			pubsub.created();
			const result = await db.query.inventoryCheckItem.findFirst(
				query(ctx.abilities.inventoryCheckItem.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateInventoryCheckItem: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			found: t.arg.boolean(),
			notes: t.arg.string(),
			movedToContainerId: t.arg.id()
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();

			const { id, ...updates } = args;
			await db
				.update(schema.inventoryCheckItem)
				.set(stripNulls(updates))
				.where(eq(schema.inventoryCheckItem.id, id as string));
			pubsub.updated(id as string);
			const result = await db.query.inventoryCheckItem.findFirst(
				query(ctx.abilities.inventoryCheckItem.filter('read').query.single)
			);
			return result!;
		}
	})
}));

export { ref as InventoryCheckItemRef };
