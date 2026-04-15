import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { logChange } from '$api/services/auditLog';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('container');

abilityBuilder.container.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.container.allow(['update', 'delete']).when((ctx) => {
	if (isGlobalAdmin(ctx)) return 'allow';
	ctx.mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createContainer: t.drizzleField({
		type: ref,
		args: {
			typeId: t.arg.id(),
			number: t.arg.string(),
			description: t.arg.string(),
			locationId: t.arg.id(),
			locationDetail: t.arg.string(),
			qrCode: t.arg.string(),
			isTemporarilyMoved: t.arg.boolean(),
			temporaryLocation: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();

			const [created] = await db
				.insert(schema.container)
				.values({ ...stripNulls(args), createdBy: user.sub })
				.returning();
			await logChange({
				tableName: 'container',
				recordId: created.id,
				action: 'INSERT',
				changedBy: user.sub
			});
			pubsub.created();
			const result = await db.query.container.findFirst(
				query(ctx.abilities.container.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateContainer: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			typeId: t.arg.id(),
			number: t.arg.string(),
			description: t.arg.string(),
			locationId: t.arg.id(),
			locationDetail: t.arg.string(),
			qrCode: t.arg.string(),
			isTemporarilyMoved: t.arg.boolean(),
			temporaryLocation: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();

			const { id, ...updates } = args;
			await db
				.update(schema.container)
				.set(stripNulls(updates))
				.where(eq(schema.container.id, id as string));
			pubsub.updated(id as string);
			const result = await db.query.container.findFirst(
				query(ctx.abilities.container.filter('read').query.single)
			);
			return result!;
		}
	}),
	deleteContainer: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can delete containers');

			await db.delete(schema.container).where(eq(schema.container.id, args.id as string));
			await logChange({
				tableName: 'container',
				recordId: args.id as string,
				action: 'DELETE',
				changedBy: user.sub
			});
			pubsub.removed();
			return true;
		}
	})
}));

export { ref as ContainerRef };
