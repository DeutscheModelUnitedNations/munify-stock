import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder, enum_ } from '$api/rumble';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('flagCheck');

const flagConditionEnum = enum_({ tsName: 'flagCondition' });

abilityBuilder.flagCheck.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.flagCheck.allow(['update', 'delete']).when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	checkFlag: t.drizzleField({
		type: ref,
		args: {
			sessionId: t.arg.id({ required: true }),
			flagId: t.arg.id({ required: true }),
			found: t.arg.boolean({ required: true }),
			condition: t.arg({ type: flagConditionEnum }),
			notes: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();

			const [created] = await db
				.insert(schema.flagCheck)
				.values({ ...args, checkedBy: user.sub })
				.returning();
			pubsub.created();
			const result = await db.query.flagCheck.findFirst(
				query(ctx.abilities.flagCheck.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateFlagCheck: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			found: t.arg.boolean(),
			condition: t.arg({ type: flagConditionEnum }),
			notes: t.arg.string()
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();

			const { id, ...updates } = args;
			await db
				.update(schema.flagCheck)
				.set(stripNulls(updates))
				.where(eq(schema.flagCheck.id, id as string));
			pubsub.updated(id as string);
			const result = await db.query.flagCheck.findFirst(
				query(ctx.abilities.flagCheck.filter('read').query.single)
			);
			return result!;
		}
	})
}));

export { ref as FlagCheckRef };
