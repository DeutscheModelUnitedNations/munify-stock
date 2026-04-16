import { db, schema } from '$api/db/db';
import { abilityBuilder, schemaBuilder, pubsub as rumblePubsub } from '$api/rumble';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { eq } from 'drizzle-orm';
import { basics, stripNulls } from './basics';

const { ref, pubsub } = basics('comment');

// Pubsubs for parent entities so liveQueries on items/containers refresh when comments change
const itemPubsub = rumblePubsub({ table: 'item' });
const containerPubsub = rumblePubsub({ table: 'container' });

/** Notify the parent item or container that its comments changed */
async function notifyParentEntity(commentId: string) {
	const [row] = await db
		.select({
			itemId: schema.comment.itemId,
			containerId: schema.comment.containerId,
			parentId: schema.comment.parentId
		})
		.from(schema.comment)
		.where(eq(schema.comment.id, commentId))
		.limit(1);
	if (!row) return;

	// If this is a reply, look up the parent comment's target
	if (row.parentId) {
		const [parent] = await db
			.select({
				itemId: schema.comment.itemId,
				containerId: schema.comment.containerId
			})
			.from(schema.comment)
			.where(eq(schema.comment.id, row.parentId))
			.limit(1);
		if (parent?.itemId) itemPubsub.updated(parent.itemId);
		else if (parent?.containerId) containerPubsub.updated(parent.containerId);
		return;
	}

	if (row.itemId) itemPubsub.updated(row.itemId);
	else if (row.containerId) containerPubsub.updated(row.containerId);
}

abilityBuilder.comment.allow('read').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

abilityBuilder.comment.allow('update').when(({ mustBeLoggedIn }) => {
	mustBeLoggedIn();
	return 'allow';
});

schemaBuilder.mutationFields((t) => ({
	createComment: t.drizzleField({
		type: ref,
		args: {
			itemId: t.arg.id(),
			containerId: t.arg.id(),
			parentId: t.arg.id(),
			text: t.arg.string({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();

			const targets = [args.itemId, args.containerId, args.parentId].filter(Boolean);
			if (targets.length !== 1) {
				throw new Error('Exactly one of itemId, containerId, or parentId must be provided');
			}

			if (args.parentId) {
				const [parent] = await db
					.select({ id: schema.comment.id, parentId: schema.comment.parentId })
					.from(schema.comment)
					.where(eq(schema.comment.id, args.parentId as string))
					.limit(1);
				if (!parent) throw new Error('Parent comment not found');
				if (parent.parentId) throw new Error('Cannot reply to a reply');
			}

			const [created] = await db
				.insert(schema.comment)
				.values({ ...stripNulls(args), createdBy: user.sub })
				.returning();
			pubsub.created();

			// Notify the parent item/container
			if (args.itemId) itemPubsub.updated(args.itemId as string);
			else if (args.containerId) containerPubsub.updated(args.containerId as string);
			else if (args.parentId) await notifyParentEntity(created.id);

			const result = await db.query.comment.findFirst(
				query(ctx.abilities.comment.filter('read').query.single)
			);
			return result!;
		}
	}),
	updateComment: t.drizzleField({
		type: ref,
		args: {
			id: t.arg.id({ required: true }),
			text: t.arg.string({ required: true })
		},
		resolve: async (query, _root, args, ctx) => {
			ctx.mustBeLoggedIn();
			await db
				.update(schema.comment)
				.set({ text: args.text })
				.where(eq(schema.comment.id, args.id as string));
			pubsub.updated(args.id as string);
			await notifyParentEntity(args.id as string);
			const result = await db.query.comment.findFirst(
				query(ctx.abilities.comment.filter('read').query.single)
			);
			return result!;
		}
	}),
	resolveComment: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			const user = ctx.mustBeLoggedIn();
			const [comment] = await db
				.select({ id: schema.comment.id, parentId: schema.comment.parentId })
				.from(schema.comment)
				.where(eq(schema.comment.id, args.id as string))
				.limit(1);
			if (!comment) throw new Error('Comment not found');
			if (comment.parentId) throw new Error('Cannot resolve a reply');

			await db
				.update(schema.comment)
				.set({ resolved: true, resolvedAt: new Date(), resolvedBy: user.sub })
				.where(eq(schema.comment.id, args.id as string));
			pubsub.updated(args.id as string);
			await notifyParentEntity(args.id as string);
			return true;
		}
	}),
	unresolveComment: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			ctx.mustBeLoggedIn();
			const [comment] = await db
				.select({
					id: schema.comment.id,
					parentId: schema.comment.parentId,
					itemId: schema.comment.itemId,
					containerId: schema.comment.containerId
				})
				.from(schema.comment)
				.where(eq(schema.comment.id, args.id as string))
				.limit(1);
			if (!comment) throw new Error('Comment not found');
			if (comment.parentId) throw new Error('Cannot unresolve a reply');

			await db
				.update(schema.comment)
				.set({ resolved: false, resolvedAt: null, resolvedBy: null })
				.where(eq(schema.comment.id, args.id as string));
			pubsub.updated(args.id as string);
			if (comment.itemId) itemPubsub.updated(comment.itemId);
			else if (comment.containerId) containerPubsub.updated(comment.containerId);
			return true;
		}
	}),
	deleteComment: t.field({
		type: 'Boolean',
		args: { id: t.arg.id({ required: true }) },
		resolve: async (_root, args, ctx) => {
			ctx.mustBeLoggedIn();
			if (!isGlobalAdmin(ctx)) throw new Error('Only admins can delete comments');

			// Look up target before deleting
			const [comment] = await db
				.select({
					itemId: schema.comment.itemId,
					containerId: schema.comment.containerId,
					parentId: schema.comment.parentId
				})
				.from(schema.comment)
				.where(eq(schema.comment.id, args.id as string))
				.limit(1);

			// Delete replies then the comment itself
			await db.delete(schema.comment).where(eq(schema.comment.parentId, args.id as string));
			await db.delete(schema.comment).where(eq(schema.comment.id, args.id as string));
			pubsub.removed();

			// Notify parent entity
			if (comment) {
				if (comment.itemId) itemPubsub.updated(comment.itemId);
				else if (comment.containerId) containerPubsub.updated(comment.containerId);
				else if (comment.parentId) {
					// Deleted a reply — find the parent comment's target
					const [parent] = await db
						.select({
							itemId: schema.comment.itemId,
							containerId: schema.comment.containerId
						})
						.from(schema.comment)
						.where(eq(schema.comment.id, comment.parentId))
						.limit(1);
					if (parent?.itemId) itemPubsub.updated(parent.itemId);
					else if (parent?.containerId) containerPubsub.updated(parent.containerId);
				}
			}
			return true;
		}
	})
}));

export { ref as CommentRef };
