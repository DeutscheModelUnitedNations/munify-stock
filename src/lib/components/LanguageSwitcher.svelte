<script lang="ts">
	import { locales, getLocale, cookieName, cookieMaxAge } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	const localeInfo: Record<string, { flag: string; label: string }> = {
		de: { flag: 'de', label: 'Deutsch' },
		en: { flag: 'gb', label: 'English' }
	};

	let modalOpen = $state(false);

	function switchLocale(locale: string) {
		document.cookie = `${cookieName}=${locale}; path=/; max-age=${cookieMaxAge}; domain=${window.location.hostname}; SameSite=Lax`;
		window.location.reload();
	}
</script>

<button class="btn btn-ghost btn-sm" onclick={() => (modalOpen = true)} aria-label={m.language()}>
	<span class="fi fi-{localeInfo[getLocale()]?.flag} text-lg"></span>
</button>

{#if modalOpen}
	<button
		class="fixed inset-0 z-50 bg-black/50"
		aria-label="Close"
		onclick={() => (modalOpen = false)}
	></button>
	<div
		class="fixed top-[30%] right-4 left-4 z-50 mx-auto max-w-xs rounded-box bg-base-100 p-6 shadow-2xl"
	>
		<h3 class="mb-4 text-lg font-bold">
			<i class="fa-solid fa-earth-europe mr-2"></i>{m.language()}
		</h3>
		<div class="flex flex-col gap-2">
			{#each locales as l}
				<button
					class="btn justify-start gap-4 text-lg btn-lg {getLocale() === l ? 'btn-active' : ''}"
					onclick={() => switchLocale(l)}
				>
					<span class="fi fi-{localeInfo[l]?.flag} text-xl"></span>
					{localeInfo[l]?.label ?? l}
				</button>
			{/each}
		</div>
	</div>
{/if}
