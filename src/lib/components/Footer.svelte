<script lang="ts">
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import dmunLogo from '$lib/assets/dmunlogo/logo.png';
	import * as m from '$lib/paraglide/messages';
</script>

<div class="w-full p-4">
	<footer
		class="footer-center mt-3 footer flex flex-col rounded-xl bg-base-200 p-10 text-base-content"
	>
		<nav class="flex flex-col flex-wrap justify-center gap-4 md:flex-row">
			<a class="link link-hover" href="/">{m.home()}</a>
			<a class="link link-hover" href="https://dmun.de/impressum" target="_blank"
				>{m.imprintAndPrivacy()}</a
			>
		</nav>
		<div class="flex">
			<ThemeSwitcher />
			<LanguageSwitcher />
		</div>
		<nav>
			<div class="grid grid-flow-col gap-4" id="socials">
				<a href="https://www.instagram.com/dmun_ev/" aria-label="Instagram">
					<i class="fa-brands fa-instagram text-3xl"></i>
				</a>
				<a href="https://x.com/DMUN_eV" aria-label="X / Twitter">
					<i class="fa-brands fa-x-twitter text-3xl"></i>
				</a>
				<a href="https://www.facebook.com/deutschemodelunitednations/" aria-label="Facebook">
					<i class="fa-brands fa-facebook text-3xl"></i>
				</a>
				<a href="https://www.youtube.com/user/DeutscheMUNeV" aria-label="YouTube">
					<i class="fa-brands fa-youtube text-3xl"></i>
				</a>
				<a href="https://github.com/deutschemodelunitednations" aria-label="GitHub">
					<i class="fa-brands fa-github text-3xl"></i>
				</a>
			</div>
		</nav>
		<aside>
			<p>{m.aServiceBy()}</p>
			<a
				href="https://dmun.de"
				target="_blank"
				rel="noopener"
				class="transition-all duration-300 hover:scale-105"
			>
				<img src={dmunLogo} alt="DMUN Logo" class="w-40 dark:hue-rotate-180 dark:invert" />
			</a>
			<p>
				Copyright © {new Date().getFullYear() !== 2024 ? '2024-' : ''}{new Date().getFullYear()} -
				{m.allRightsReserved()} Deutsche Model United Nations e.V.
			</p>
		</aside>
	</footer>
</div>

<style>
	#socials a {
		transition: transform 0.3s;
	}
	#socials a:hover {
		transform: scale(1.2);
	}
</style>
