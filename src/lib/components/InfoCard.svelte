<script lang="ts">
	interface Props {
		value: string | number;
		label: string;
		icon?: string;
		mono?: boolean;
		large?: boolean;
		class?: string;
	}

	let { value, label, icon, mono = false, large = false, class: className = '' }: Props = $props();
</script>

<div class="card overflow-hidden border border-base-300 bg-base-100 {className}">
	<div class="card-body gap-0.5 py-4">
		<span
			class="truncate {large ? 'text-xl font-bold' : 'text-lg font-semibold'} {mono
				? 'font-mono'
				: ''}">{value}</span
		>
		<span class="text-xs opacity-50">
			{#if icon}
				<i class="{icon} mr-1"></i>
			{/if}
			{label}
		</span>
	</div>
</div>
