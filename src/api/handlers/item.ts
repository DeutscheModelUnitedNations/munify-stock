import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { logChange } from '$api/services/auditLog';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('item');

abilityBuilder.item.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.item.allow(['update', 'delete']).when((ctx) => {
	if (isGlobalAdmin(ctx)) return 'allow';
	ctx.mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createItem: t.drizzleField({
		type: ref,
		args: {
			name: t.arg.string({ required: true }),
			typeId: t.arg.id(),
			description: t.arg.string(),
			photo: t.arg.string(),
			serialNumber: t.arg.string(),
			value: t.arg.int(),
			qrCode: t.arg.string(),
			quantity: t.arg.int(),
			containerId: t.arg.id(),
			locationDetail: t.arg.string(),
			warningFlag: t.arg.boolean(),
			warningFlagNote: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();

			const [created] = await db
				.insert(schema.item)
				.values({ ...stripNulls(args), createdBy: user.sub })
				.returning();
			await logChange({
				tableName: 'item',
				recordId: created.id,
				action: 'INSERT',
				changedBy: user.sub
			});
			pubsub.created();
			const result = await db.query.item.findFirst(
				query(ctx.abilities.item.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateItem: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			name: t.arg.string(),
			typeId: t.arg.id(),
			description: t.arg.string(),
			photo: t.arg.string(),
			serialNumber: t.arg.string(),
			value: t.arg.int(),
			qrCode: t.arg.string(),
			quantity: t.arg.int(),
			containerId: t.arg.id(),
			locationDetail: t.arg.string(),
			warningFlag: t.arg.boolean(),
			warningFlagNote: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();

			const { id, ...updates } = args;
			await db
				.update(schema.item)
				.set({ ...stripNulls(updates), updatedBy: user.sub })
				.where(eq(schema.item.id, id as string));
			pubsub.updated(id as string);
			const result = await db.query.item.findFirst(
				query(ctx.abilities.item.filter('read').query.single)
			);
			return result!;
		}
	}),
	deleteItem: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can delete items');

			await db.delete(schema.item).where(eq(schema.item.id, args.id as string));
			await logChange({
				tableName: 'item',
				recordId: args.id as string,
				action: 'DELETE',
				changedBy: user.sub
			});
			pubsub.removed();
			return true;
		}
	})
}));

export { ref as ItemRef };
