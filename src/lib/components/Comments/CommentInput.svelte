<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	interface Props {
		onsubmit: (text: string) => Promise<void>;
		placeholder?: string;
		replyingToName?: string;
		oncancel?: () => void;
	}

	let { onsubmit, placeholder, replyingToName, oncancel }: Props = $props();

	let text = $state('');
	let submitting = $state(false);

	async function handleSubmit() {
		const trimmed = text.trim();
		if (!trimmed || submitting) return;
		submitting = true;
		try {
			await onsubmit(trimmed);
			text = '';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex flex-col gap-2">
	{#if replyingToName}
		<div class="flex items-center gap-2 text-sm opacity-70">
			<i class="fa-solid fa-reply"></i>
			<span>{m.replyingTo({ name: replyingToName })}</span>
			{#if oncancel}
				<button
					type="button"
					class="btn btn-circle btn-ghost btn-xs"
					onclick={oncancel}
					aria-label={m.cancel()}
				>
					<i class="fa-solid fa-xmark"></i>
				</button>
			{/if}
		</div>
	{/if}
	<div class="flex gap-2">
		<textarea
			class="textarea-bordered textarea flex-1"
			rows="2"
			bind:value={text}
			{placeholder}
			onkeydown={(e) => {
				if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
					e.preventDefault();
					handleSubmit();
				}
			}}
		></textarea>
		<button
			type="button"
			class="btn self-end btn-sm btn-primary"
			disabled={!text.trim() || submitting}
			onclick={handleSubmit}
		>
			{#if submitting}
				<span class="loading loading-xs loading-spinner"></span>
			{:else}
				<i class="fa-solid fa-paper-plane"></i>
			{/if}
		</button>
	</div>
</div>
