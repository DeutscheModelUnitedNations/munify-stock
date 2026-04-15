import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder } from '$api/rumble';
import { eq } from 'drizzle-orm';
import { basics } from './basics';

const { ref, pubsub } = basics('comment');

abilityBuilder.comment.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.comment.allow(['update', 'delete']).when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createComment: t.drizzleField({
		type: ref,
		args: {
			itemId: t.arg.id({ required: true }),
			text: t.arg.string({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			const [created] = await db
				.insert(schema.comment)
				.values({ ...args, createdBy: user.sub })
				.returning();
			pubsub.created();
			const result = await db.query.comment.findFirst(
				query(ctx.abilities.comment.filter('read').query.single)
			);
			return result!;
		}
	}),
	deleteComment: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			ctx.mustBeLoggedIn();
			await db.delete(schema.comment).where(eq(schema.comment.id, args.id as string));
			pubsub.removed();
			return true;
		}
	})
}));

export { ref as CommentRef };
