import fs from 'node:fs';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { ssp } from 'sveltekit-search-params/plugin';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		ssp(),
		tailwindcss(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['cookie', 'preferredLanguage', 'baseLocale']
		}),
		sveltekit()
	],
	server: {
		https: fs.existsSync('.certs/cert.pem')
			? {
					cert: fs.readFileSync('.certs/cert.pem'),
					key: fs.readFileSync('.certs/key.pem')
				}
			: undefined
	},
	ssr: {
		external: ['pg']
	}
});
