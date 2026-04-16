<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	interface Props {
		/** The value to encode in the QR code */
		value: string;
		/** Label shown below the QR code */
		label?: string;
	}

	let { value, label }: Props = $props();

	let qrDataUrl = $state('');

	onMount(async () => {
		if (!browser || !value) return;
		const QRCode = await import('qrcode');
		qrDataUrl = await QRCode.toDataURL(value, { width: 200, margin: 2 });
	});

	function printQr() {
		const win = window.open('', '_blank');
		if (!win) return;
		win.document.write(`
			<html>
				<head><title>QR Code - ${label ?? value}</title>
				<style>
					body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
					img { width: 200px; height: 200px; }
					p { margin-top: 8px; font-size: 14px; font-weight: bold; }
					small { font-size: 10px; color: #666; }
				</style></head>
				<body>
					<img src="${qrDataUrl}" alt="QR Code" />
					${label ? `<p>${label}</p>` : ''}
					<small>${value}</small>
				</body>
			</html>
		`);
		win.document.close();
		win.print();
	}
</script>

{#if qrDataUrl}
	<div class="flex flex-col items-center gap-2">
		<img src={qrDataUrl} alt="QR Code for {label ?? value}" class="rounded-lg" />
		{#if label}
			<p class="text-sm font-medium">{label}</p>
		{/if}
		<p class="text-xs opacity-50">{value}</p>
		<button class="btn btn-ghost btn-xs" onclick={printQr}>
			<i class="fa-duotone fa-print"></i> Print
		</button>
	</div>
{:else}
	<div class="flex h-[200px] w-[200px] items-center justify-center">
		<span class="loading loading-sm loading-spinner"></span>
	</div>
{/if}
