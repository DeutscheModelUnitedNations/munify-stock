import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { eq } from 'drizzle-orm';
import { basics } from './basics';

const { ref, pubsub } = basics('itemAlias');

abilityBuilder.itemAlias.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.itemAlias.allow(['update', 'delete']).when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createItemAlias: t.drizzleField({
		type: ref,
		args: {
			itemId: t.arg.id({ required: true }),
			alias: t.arg.string({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();
			const [created] = await db.insert(schema.itemAlias).values(args).returning();
			pubsub.created();
			const result = await db.query.itemAlias.findFirst(
				query(ctx.abilities.itemAlias.filter('read').query.single)
			);
			return result!;
		}
	}),
	deleteItemAlias: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			ctx.mustBeLoggedIn();
			await db.delete(schema.itemAlias).where(eq(schema.itemAlias.id, args.id as string));
			pubsub.removed();
			return true;
		}
	})
}));

export { ref as ItemAliasRef };
