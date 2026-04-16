<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { CommentView } from '$lib/types/views';
	import CommentInput from './CommentInput.svelte';

	interface Props {
		comment: CommentView;
		isAdmin: boolean;
		replyingToId: string | null;
		onreply: (parentId: string) => void;
		oncancelreply: () => void;
		onresolve: (id: string) => void;
		onunresolve: (id: string) => void;
		ondelete: (id: string) => void;
		onedit: (id: string, text: string) => Promise<void>;
		onsubmitreply: (text: string) => Promise<void>;
	}

	let {
		comment,
		isAdmin,
		replyingToId,
		onreply,
		oncancelreply,
		onresolve,
		onunresolve,
		ondelete,
		onedit,
		onsubmitreply
	}: Props = $props();

	let editingId = $state<string | null>(null);
	let editText = $state('');

	function authorName(user: { givenName: string; familyName: string } | null): string {
		return user ? `${user.givenName} ${user.familyName}` : 'Unknown';
	}

	function isEdited(createdAt: Date, updatedAt: Date | null): boolean {
		if (!updatedAt) return false;
		return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
	}

	function startEdit(id: string, currentText: string) {
		editingId = id;
		editText = currentText;
	}

	async function submitEdit(id: string) {
		const trimmed = editText.trim();
		if (!trimmed) return;
		await onedit(id, trimmed);
		editingId = null;
		editText = '';
	}

	function cancelEdit() {
		editingId = null;
		editText = '';
	}
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body gap-2 py-3">
		<!-- Main comment -->
		<div class="flex items-start justify-between gap-2">
			<div class="flex items-center gap-2 text-xs opacity-70">
				<i class="fa-duotone fa-user"></i>
				<span>{authorName(comment.createdByUser)}</span>
				<span>&middot;</span>
				<span>{new Date(comment.createdAt).toLocaleString()}</span>
				{#if isEdited(comment.createdAt, comment.updatedAt)}
					<span class="italic">{m.edited()}</span>
				{/if}
			</div>
			<div class="flex gap-1">
				{#if !comment.resolved}
					<button
						type="button"
						class="btn btn-circle btn-ghost btn-xs"
						title={m.resolve()}
						onclick={() => onresolve(comment.id)}
					>
						<i class="fa-solid fa-check text-success"></i>
					</button>
				{:else}
					<button
						type="button"
						class="btn btn-circle btn-ghost btn-xs"
						title={m.unresolve()}
						onclick={() => onunresolve(comment.id)}
					>
						<i class="fa-solid fa-rotate-left text-info"></i>
					</button>
				{/if}
				{#if isAdmin}
					<button
						type="button"
						class="btn btn-circle btn-ghost btn-xs"
						title={m.delete()}
						onclick={() => ondelete(comment.id)}
					>
						<i class="fa-solid fa-trash text-error"></i>
					</button>
				{/if}
			</div>
		</div>

		{#if editingId === comment.id}
			<div class="flex gap-2">
				<textarea class="textarea-bordered textarea flex-1" rows="2" bind:value={editText}
				></textarea>
				<div class="flex flex-col gap-1">
					<button
						type="button"
						class="btn btn-xs btn-primary"
						aria-label={m.save()}
						onclick={() => submitEdit(comment.id)}
					>
						<i class="fa-solid fa-check"></i>
					</button>
					<button
						type="button"
						class="btn btn-ghost btn-xs"
						aria-label={m.cancel()}
						onclick={cancelEdit}
					>
						<i class="fa-solid fa-xmark"></i>
					</button>
				</div>
			</div>
		{:else}
			<p class="whitespace-pre-wrap">{comment.text}</p>
		{/if}

		{#if comment.resolved && comment.resolvedByUser}
			<div class="mt-1 flex items-center gap-1 text-xs text-success">
				<i class="fa-solid fa-circle-check"></i>
				<span>{m.resolvedBy({ name: authorName(comment.resolvedByUser) })}</span>
				{#if comment.resolvedAt}
					<span>&middot;</span>
					<span>{new Date(comment.resolvedAt).toLocaleString()}</span>
				{/if}
			</div>
		{/if}

		<!-- Action buttons -->
		{#if !comment.resolved}
			<div class="flex gap-2">
				<button type="button" class="btn btn-ghost btn-xs" onclick={() => onreply(comment.id)}>
					<i class="fa-solid fa-reply"></i>
					{m.reply()}
				</button>
				{#if editingId !== comment.id}
					<button
						type="button"
						class="btn btn-ghost btn-xs"
						onclick={() => startEdit(comment.id, comment.text)}
					>
						<i class="fa-solid fa-pen"></i>
						{m.editComment()}
					</button>
				{/if}
			</div>
		{/if}

		<!-- Replies -->
		{#if comment.replies && comment.replies.length > 0}
			<div class="mt-1 ml-4 flex flex-col gap-2 border-l-2 border-base-300 pl-3">
				{#each comment.replies as reply}
					<div class="flex flex-col gap-1">
						<div class="flex items-start justify-between gap-2">
							<div class="flex items-center gap-2 text-xs opacity-70">
								<i class="fa-duotone fa-user"></i>
								<span>{authorName(reply.createdByUser)}</span>
								<span>&middot;</span>
								<span>{new Date(reply.createdAt).toLocaleString()}</span>
								{#if isEdited(reply.createdAt, reply.updatedAt)}
									<span class="italic">{m.edited()}</span>
								{/if}
							</div>
							<div class="flex gap-1">
								{#if editingId !== reply.id}
									<button
										type="button"
										class="btn btn-circle btn-ghost btn-xs"
										title={m.editComment()}
										onclick={() => startEdit(reply.id, reply.text)}
									>
										<i class="fa-solid fa-pen text-xs"></i>
									</button>
								{/if}
								{#if isAdmin}
									<button
										type="button"
										class="btn btn-circle btn-ghost btn-xs"
										title={m.delete()}
										onclick={() => ondelete(reply.id)}
									>
										<i class="fa-solid fa-trash text-xs text-error"></i>
									</button>
								{/if}
							</div>
						</div>
						{#if editingId === reply.id}
							<div class="flex gap-2">
								<textarea
									class="textarea-bordered textarea flex-1 textarea-sm"
									rows="2"
									bind:value={editText}
								></textarea>
								<div class="flex flex-col gap-1">
									<button
										type="button"
										class="btn btn-xs btn-primary"
										aria-label={m.save()}
										onclick={() => submitEdit(reply.id)}
									>
										<i class="fa-solid fa-check"></i>
									</button>
									<button
										type="button"
										class="btn btn-ghost btn-xs"
										aria-label={m.cancel()}
										onclick={cancelEdit}
									>
										<i class="fa-solid fa-xmark"></i>
									</button>
								</div>
							</div>
						{:else}
							<p class="text-sm whitespace-pre-wrap">{reply.text}</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Reply input -->
		{#if replyingToId === comment.id}
			<div class="mt-2 ml-4 border-l-2 border-primary pl-3">
				<CommentInput
					onsubmit={onsubmitreply}
					placeholder={m.replyPlaceholder()}
					replyingToName={authorName(comment.createdByUser)}
					oncancel={oncancelreply}
				/>
			</div>
		{/if}
	</div>
</div>
