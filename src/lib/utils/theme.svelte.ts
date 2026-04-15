import { browser } from '$app/environment';

type Theme = 'system' | 'dark' | 'light';

let theme = $state<Theme>('system');

export function initialSetTheme() {
	if (!browser) return;
	const stored = localStorage.getItem('theme') as Theme | null;
	if (stored && ['system', 'light', 'dark'].includes(stored)) {
		theme = stored;
	}
	applyThemeToHTML(theme);
}

function applyThemeToHTML(t: Theme) {
	const html = document.querySelector('html');
	if (!html) return;
	let resolved = t;
	if (resolved === 'system') {
		resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	html.setAttribute('data-theme', resolved);
}

export function toggleTheme() {
	if (!browser) return;
	const themes: Theme[] = ['system', 'light', 'dark'];
	const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
	theme = themes[nextIndex];
	localStorage.setItem('theme', theme);
	applyThemeToHTML(theme);
}

export function getTheme(): Theme {
	return theme;
}
