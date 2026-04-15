<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { Html5Qrcode } from 'html5-qrcode';
	import * as m from '$lib/paraglide/messages';

	let scannerEl: HTMLDivElement;
	let scanner: Html5Qrcode | null = null;
	let lastResult = $state('');
	let errorMsg = $state('');
	let scanning = $state(false);

	onMount(async () => {
		if (!browser) return;
		const { Html5Qrcode } = await import('html5-qrcode');
		scanner = new Html5Qrcode('qr-reader');

		try {
			scanning = true;
			await scanner.start(
				{ facingMode: 'environment' },
				{
					fps: 10,
					qrbox: { width: 250, height: 250 }
				},
				(decodedText: string) => {
					handleScan(decodedText);
				},
				() => {}
			);
		} catch {
			errorMsg = m.cameraError();
			scanning = false;
		}
	});

	onDestroy(() => {
		if (scanner?.isScanning) {
			scanner.stop().catch(() => {});
		}
	});

	async function handleScan(text: string) {
		if (text === lastResult) return;
		lastResult = text;

		// Check if it's an internal STOCK URL
		if (text.includes('/app/items/') || text.includes('/app/containers/')) {
			const url = new URL(text, window.location.origin);
			goto(url.pathname);
			return;
		}

		// Check if it's a known QR code format (e.g. STOCK:item:customId or STOCK:container:customId)
		if (text.startsWith('STOCK:')) {
			const parts = text.split(':');
			if (parts[1] === 'item' && parts[2]) {
				const result = await resolveByCustomId('item', parts[2]);
				if (result) {
					goto(`/app/items/${result}`);
					return;
				}
			}
			if (parts[1] === 'container' && parts[2]) {
				const result = await resolveByCustomId('container', parts[2]);
				if (result) {
					goto(`/app/containers/${result}`);
					return;
				}
			}
		}

		// Otherwise show the raw result
		errorMsg = '';
	}

	async function resolveByCustomId(
		type: 'item' | 'container',
		customId: string
	): Promise<string | null> {
		const queryName = type === 'item' ? 'itemByCustomId' : 'containerByCustomId';
		const res = await fetch('/api/graphql', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `query ($customId: String!) { ${queryName}(customId: $customId) }`,
				variables: { customId }
			})
		});
		const json = await res.json();
		return json.data?.[queryName] ?? null;
	}

	function resetScan() {
		lastResult = '';
		errorMsg = '';
	}
</script>

<div class="mx-auto flex max-w-lg flex-col gap-4">
	<h1 class="text-2xl font-bold">
		<i class="fa-duotone fa-barcode-read mr-2"></i>{m.scanCodeTitle()}
	</h1>

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body items-center">
			<div id="qr-reader" bind:this={scannerEl} class="w-full overflow-hidden rounded-lg"></div>

			{#if errorMsg}
				<div class="mt-4 alert alert-error">
					<i class="fa-solid fa-triangle-exclamation"></i>
					<span>{errorMsg}</span>
				</div>
			{/if}

			{#if lastResult}
				<div class="mt-4 flex w-full flex-col gap-2">
					<div class="alert alert-info">
						<i class="fa-duotone fa-barcode-read"></i>
						<div>
							<p class="text-sm font-bold">{m.scanned()}</p>
							<p class="text-xs break-all">{lastResult}</p>
						</div>
					</div>
					<button class="btn btn-outline btn-sm" onclick={resetScan}>
						<i class="fa-solid fa-rotate-right"></i>
						{m.scanAgain()}
					</button>
				</div>
			{:else if !errorMsg && !scanning}
				<p class="mt-4 text-sm opacity-50">Initializing camera...</p>
			{/if}
		</div>
	</div>

	<p class="text-center text-xs opacity-50">
		{m.scanCodeHint()}
	</p>
</div>
