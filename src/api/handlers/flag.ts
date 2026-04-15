import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { logChange } from '$api/services/auditLog';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('flag');

abilityBuilder.flag.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.flag.allow(['update', 'delete']).when((ctx) => {
	if (isGlobalAdmin(ctx)) return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createFlag: t.drizzleField({
		type: ref,
		args: {
			countryCode: t.arg.string({ required: true }),
			countryName: t.arg.string({ required: true }),
			quantity: t.arg.int(),
			containerId: t.arg.id(),
			notes: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can create flags');

			const [created] = await db.insert(schema.flag).values(stripNulls(args)).returning();
			await logChange({
				tableName: 'flag',
				recordId: created.id,
				action: 'INSERT',
				changedBy: user.sub
			});
			pubsub.created();
			const result = await db.query.flag.findFirst(
				query(ctx.abilities.flag.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateFlag: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			countryCode: t.arg.string(),
			countryName: t.arg.string(),
			quantity: t.arg.int(),
			containerId: t.arg.id(),
			notes: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can update flags');

			const { id, ...updates } = args;
			await db
				.update(schema.flag)
				.set(stripNulls(updates))
				.where(eq(schema.flag.id, id as string));
			pubsub.updated(id as string);
			const result = await db.query.flag.findFirst(
				query(ctx.abilities.flag.filter('read').query.single)
			);
			return result!;
		}
	}),
	deleteFlag: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can delete flags');

			await db.delete(schema.flag).where(eq(schema.flag.id, args.id as string));
			await logChange({
				tableName: 'flag',
				recordId: args.id as string,
				action: 'DELETE',
				changedBy: user.sub
			});
			pubsub.removed();
			return true;
		}
	})
}));

export { ref as FlagRef };
