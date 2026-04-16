<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	import type { ItemDetailView } from '$lib/types/views';

	interface Props {
		comments: NonNullable<ItemDetailView['comments']>;
	}

	let { comments }: Props = $props();
</script>

<div class="flex flex-col gap-3">
	{#each comments as comment}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body py-3">
				<div class="flex items-center gap-2 text-xs opacity-70">
					<i class="fa-duotone fa-user"></i>
					{comment.createdByUser
						? `${comment.createdByUser.givenName} ${comment.createdByUser.familyName}`
						: 'Unknown'}
					<span>&middot;</span>
					{new Date(comment.createdAt).toLocaleString()}
				</div>
				<p>{comment.text}</p>
			</div>
		</div>
	{:else}
		<p class="text-center opacity-50">{m.noCommentsYet()}</p>
	{/each}
</div>
