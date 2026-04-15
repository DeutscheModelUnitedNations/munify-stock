<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import NavMenu from './NavMenu/NavMenu.svelte';
	import NavMenuButton from './NavMenu/NavMenuButton.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		expanded?: boolean;
		children: Snippet;
	}

	let { expanded = $bindable(true), children }: Props = $props();

	let isMobile = $state(false);

	onMount(() => {
		isMobile = window.innerWidth < 640;
		if (isMobile) expanded = false;
	});

	function closeIfMobile() {
		if (isMobile) expanded = false;
	}
</script>

{#if expanded}
	<button
		aria-label="Close navigation drawer"
		aria-hidden="true"
		class="fixed top-0 left-0 z-10 h-full w-full bg-black opacity-40 sm:hidden"
		onclick={() => (expanded = false)}
	></button>
{/if}

<div class="fixed top-0 left-0 z-20 h-full py-4 pl-3 sm:static sm:h-auto sm:py-0 sm:pl-0">
	<div
		class="relative flex flex-col overflow-hidden rounded-box border-1 border-base-300 bg-base-200 duration-300 {expanded
			? 'h-full w-60 shadow sm:shadow-none'
			: 'h-0 w-0 items-center sm:h-full sm:w-16'}"
	>
		<button
			class="btn top-0 right-2 z-10 mt-2 flex btn-circle items-center p-3 btn-ghost {expanded
				? 'absolute'
				: ''}"
			onclick={() => (expanded = !expanded)}
			aria-label="Toggle menu expand state"
		>
			<i class="fa-duotone fa-arrow-right text-center {expanded ? 'rotate-180' : ''} duration-300"
			></i>
		</button>

		<div class="flex-col {expanded ? 'px-6 pt-4' : 'hidden items-center p-1 sm:flex'}">
			<div class="flex flex-col justify-center">
				<i class="fa-duotone fa-warehouse mb-4 text-3xl"></i>
				<div
					class="text-md overflow-hidden font-normal duration-200 {expanded
						? 'h-6 w-full'
						: 'h-0 w-0'}"
				>
					MUNify
				</div>
				<div
					class="overflow-hidden text-2xl font-bold duration-200 {expanded
						? 'h-9 w-full'
						: 'h-0 w-0'}"
				>
					STOCK
				</div>
			</div>

			<div class={expanded ? 'mt-8' : 'hidden sm:flex'}>
				{@render children()}
			</div>
		</div>

		<NavMenu>
			<div class={expanded ? 'px-3' : 'hidden sm:block'}>
				<NavMenuButton
					href="/app"
					icon="fa-gauge-high"
					title={m.dashboard()}
					bind:expanded
					onnavigate={closeIfMobile}
				/>
			</div>
		</NavMenu>
	</div>
</div>
