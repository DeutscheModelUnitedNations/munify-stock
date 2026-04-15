<script lang="ts">
	import './layout.css';
	import 'flag-icons/css/flag-icons.min.css';
	import { initialSetTheme } from '$lib/utils/theme.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { children } = $props();

	const changeFaDuotoneTheme = () => {
		const r = document.querySelector(':root') as HTMLElement | null;
		const html = document.querySelector('html');
		if (html?.getAttribute('data-theme') === 'dark') {
			r?.style.setProperty('--fa-primary-color', '#b1cbed');
			r?.style.setProperty('--fa-primary-opacity', '1');
			r?.style.setProperty('--fa-secondary-color', '#3d7dd2');
			r?.style.setProperty('--fa-secondary-opacity', '1');
		} else {
			r?.style.setProperty('--fa-primary-color', '#000000');
			r?.style.setProperty('--fa-primary-opacity', '1');
			r?.style.setProperty('--fa-secondary-color', '#3d7dd2');
			r?.style.setProperty('--fa-secondary-opacity', '1');
		}
	};

	if (browser) {
		changeFaDuotoneTheme();
		const observer = new MutationObserver((mutationsList) => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
					changeFaDuotoneTheme();
				}
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
	}

	onMount(() => {
		initialSetTheme();
		const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
		matchMedia.addEventListener('change', () => {
			initialSetTheme();
		});
	});
</script>

<svelte:head>
	<title>MUNify STOCK</title>
</svelte:head>
{@render children()}
