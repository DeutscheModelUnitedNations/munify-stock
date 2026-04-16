<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import * as m from '$lib/paraglide/messages';
	import type { CommentView } from '$lib/types/views';
	import CommentInput from './CommentInput.svelte';
	import CommentThread from './CommentThread.svelte';

	interface Props {
		comments: CommentView[];
		entityId: string;
		entityType: 'item' | 'container';
		isAdmin?: boolean;
	}

	let { comments, entityId, entityType, isAdmin = false }: Props = $props();

	let replyingToId = $state<string | null>(null);
	let showResolved = $state(false);

	let unresolvedComments = $derived(comments.filter((c) => !c.parentId && !c.resolved));
	let resolvedComments = $derived(comments.filter((c) => !c.parentId && c.resolved));

	async function createComment(text: string) {
		const args =
			entityType === 'item' ? { itemId: entityId, text } : { containerId: entityId, text };
		await client.mutate.createComment({ __args: args, id: true });
	}

	async function createReply(text: string) {
		if (!replyingToId) return;
		await client.mutate.createComment({
			__args: { parentId: replyingToId, text },
			id: true
		});
		replyingToId = null;
	}

	async function editComment(id: string, text: string) {
		await client.mutate.updateComment({ __args: { id, text }, id: true });
	}

	async function resolveComment(id: string) {
		await fetch('/api/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `mutation ResolveComment($id: ID!) { resolveComment(id: $id) }`,
				variables: { id }
			})
		});
	}

	async function unresolveComment(id: string) {
		await fetch('/api/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `mutation UnresolveComment($id: ID!) { unresolveComment(id: $id) }`,
				variables: { id }
			})
		});
	}

	async function deleteComment(id: string) {
		await fetch('/api/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `mutation DeleteComment($id: ID!) { deleteComment(id: $id) }`,
				variables: { id }
			})
		});
	}
</script>

<div class="flex flex-col gap-3">
	<CommentInput onsubmit={createComment} placeholder={m.commentPlaceholder()} />

	{#each unresolvedComments as comment (comment.id)}
		<CommentThread
			{comment}
			{isAdmin}
			{replyingToId}
			onreply={(id) => (replyingToId = id)}
			oncancelreply={() => (replyingToId = null)}
			onresolve={resolveComment}
			onunresolve={unresolveComment}
			ondelete={deleteComment}
			onedit={editComment}
			onsubmitreply={createReply}
		/>
	{:else}
		{#if resolvedComments.length === 0}
			<p class="text-center opacity-50">{m.noCommentsYet()}</p>
		{/if}
	{/each}

	{#if resolvedComments.length > 0}
		<button
			type="button"
			class="btn self-start btn-ghost btn-sm"
			onclick={() => (showResolved = !showResolved)}
		>
			<i class="fa-solid {showResolved ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
			{showResolved ? m.hideResolved() : m.showResolved()}
			<span class="badge badge-sm">{resolvedComments.length}</span>
		</button>

		{#if showResolved}
			<div class="flex flex-col gap-3 opacity-60">
				{#each resolvedComments as comment (comment.id)}
					<CommentThread
						{comment}
						{isAdmin}
						{replyingToId}
						onreply={(id) => (replyingToId = id)}
						oncancelreply={() => (replyingToId = null)}
						onresolve={resolveComment}
						onunresolve={unresolveComment}
						ondelete={deleteComment}
						onedit={editComment}
						onsubmitreply={createReply}
					/>
				{/each}
			</div>
		{/if}
	{/if}
</div>
