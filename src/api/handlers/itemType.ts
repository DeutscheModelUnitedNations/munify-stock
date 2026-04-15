import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { logChange } from '$api/services/auditLog';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('itemType');

abilityBuilder.itemType.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.itemType.allow(['update', 'delete']).when((ctx) => {
	if (isGlobalAdmin(ctx)) return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createItemType: t.drizzleField({
		type: ref,
		args: {
			name: t.arg.string({ required: true }),
			description: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can create item types');

			const [created] = await db
				.insert(schema.itemType)
				.values({ ...args, createdBy: user.sub })
				.returning();
			await logChange({
				tableName: 'itemType',
				recordId: created.id,
				action: 'INSERT',
				changedBy: user.sub
			});
			pubsub.created();
			const result = await db.query.itemType.findFirst(
				query(ctx.abilities.itemType.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateItemType: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			name: t.arg.string(),
			description: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can update item types');

			const { id, ...updates } = args;
			await db
				.update(schema.itemType)
				.set(stripNulls(updates))
				.where(eq(schema.itemType.id, id as string));
			pubsub.updated(id as string);
			const result = await db.query.itemType.findFirst(
				query(ctx.abilities.itemType.filter('read').query.single)
			);
			return result!;
		}
	}),
	deleteItemType: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can delete item types');

			await db.delete(schema.itemType).where(eq(schema.itemType.id, args.id as string));
			pubsub.removed();
			return true;
		}
	})
}));

export { ref as ItemTypeRef };
