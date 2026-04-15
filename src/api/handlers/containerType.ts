import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { logChange } from '$api/services/auditLog';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('containerType');

abilityBuilder.containerType.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.containerType.allow(['update', 'delete']).when((ctx) => {
	if (isGlobalAdmin(ctx)) return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createContainerType: t.drizzleField({
		type: ref,
		args: {
			name: t.arg.string({ required: true }),
			description: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can create container types');

			const [created] = await db
				.insert(schema.containerType)
				.values({ ...args, createdBy: user.sub })
				.returning();
			await logChange({
				tableName: 'containerType',
				recordId: created.id,
				action: 'INSERT',
				changedBy: user.sub
			});
			pubsub.created();
			const result = await db.query.containerType.findFirst(
				query(ctx.abilities.containerType.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateContainerType: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			name: t.arg.string(),
			description: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can update container types');

			const { id, ...updates } = args;
			await db
				.update(schema.containerType)
				.set(stripNulls(updates))
				.where(eq(schema.containerType.id, id as string));
			pubsub.updated(id as string);
			const result = await db.query.containerType.findFirst(
				query(ctx.abilities.containerType.filter('read').query.single)
			);
			return result!;
		}
	}),
	deleteContainerType: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can delete container types');

			await db.delete(schema.containerType).where(eq(schema.containerType.id, args.id as string));
			pubsub.removed();
			return true;
		}
	})
}));

export { ref as ContainerTypeRef };
