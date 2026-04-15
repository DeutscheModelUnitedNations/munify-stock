import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { logChange } from '$api/services/auditLog';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('location');

abilityBuilder.location.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.location.allow(['update', 'delete']).when((ctx) => {
	if (isGlobalAdmin(ctx)) return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createLocation: t.drizzleField({
		type: ref,
		args: {
			name: t.arg.string({ required: true }),
			description: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can create locations');

			const [created] = await db.insert(schema.location).values(args).returning();
			await logChange({
				tableName: 'location',
				recordId: created.id,
				action: 'INSERT',
				changedBy: user.sub
			});
			pubsub.created();
			const result = await db.query.location.findFirst(
				query(ctx.abilities.location.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateLocation: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			name: t.arg.string(),
			description: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can update locations');

			const { id, ...updates } = args;
			await db
				.update(schema.location)
				.set(stripNulls(updates))
				.where(eq(schema.location.id, id as string));
			pubsub.updated(id as string);
			const result = await db.query.location.findFirst(
				query(ctx.abilities.location.filter('read').query.single)
			);
			return result!;
		}
	}),
	deleteLocation: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can delete locations');

			await db.delete(schema.location).where(eq(schema.location.id, args.id as string));
			await logChange({
				tableName: 'location',
				recordId: args.id as string,
				action: 'DELETE',
				changedBy: user.sub
			});
			pubsub.removed();
			return true;
		}
	})
}));

export { ref as LocationRef };
