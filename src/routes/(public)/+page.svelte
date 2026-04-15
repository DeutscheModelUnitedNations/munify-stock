<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import * as m from '$lib/paraglide/messages';
</script>

<!-- Navbar -->
<div class="navbar bg-base-300 px-6 py-3">
	<div class="flex-1">
		<a href="/" class="flex items-center gap-2 text-lg font-bold">
			<i class="fa-duotone fa-warehouse text-primary"></i>
			{m.appName()}
		</a>
	</div>
	<div class="flex-none">
		<a href="/app" class="btn btn-ghost btn-sm">
			<i class="fa-duotone fa-right-to-bracket"></i>
			{m.login()}
		</a>
	</div>
</div>

<!-- Hero -->
<div class="bg-base-300">
	<div class="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-20 md:flex-row">
		<div class="flex flex-1 justify-center">
			<div
				class="flex h-64 w-64 items-center justify-center rounded-full bg-base-100/10 md:h-80 md:w-80"
			>
				<i class="fa-duotone fa-warehouse text-[8rem] text-primary/60"></i>
			</div>
		</div>
		<div class="flex-1 text-center md:text-right">
			<h1 class="text-4xl font-bold md:text-5xl">
				{m.heroTitle()}
			</h1>
			<p class="mt-4 text-lg opacity-70">
				{m.heroSubtitle()}
			</p>
			<a href="/app" class="btn mt-6 btn-lg btn-primary">
				<i class="fa-duotone fa-right-to-bracket"></i>
				{m.openApp()}
			</a>
		</div>
	</div>
</div>

<!-- Features -->
<div class="bg-base-200 px-6 py-16">
	<div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
		<div class="card bg-base-300">
			<div class="card-body items-center text-center">
				<i class="fa-duotone fa-boxes-stacked mb-2 text-4xl text-primary"></i>
				<h2 class="card-title">{m.featureInventoryTitle()}</h2>
				<p class="text-sm opacity-70">
					{m.featureInventoryDescription()}
				</p>
			</div>
		</div>
		<div class="card bg-base-300">
			<div class="card-body items-center text-center">
				<i class="fa-duotone fa-barcode-read mb-2 text-4xl text-primary"></i>
				<h2 class="card-title">{m.featureQrTitle()}</h2>
				<p class="text-sm opacity-70">
					{m.featureQrDescription()}
				</p>
			</div>
		</div>
		<div class="card bg-base-300">
			<div class="card-body items-center text-center">
				<i class="fa-duotone fa-flag mb-2 text-4xl text-primary"></i>
				<h2 class="card-title">{m.featureFlagsTitle()}</h2>
				<p class="text-sm opacity-70">
					{m.featureFlagsDescription()}
				</p>
			</div>
		</div>
	</div>
</div>

<!-- About -->
<div class="bg-base-300 px-6 py-16">
	<div class="mx-auto max-w-3xl">
		<h2 class="mb-6 text-3xl font-bold">
			{m.aboutTitle()}
		</h2>
		<p class="leading-relaxed opacity-80">
			{m.aboutText()}
		</p>

		<h2 class="mt-12 mb-6 text-3xl font-bold">{m.missionTitle()}</h2>
		<p class="leading-relaxed opacity-80">
			{m.missionText()}
		</p>

		<a href="https://dmun.de" target="_blank" rel="noopener" class="btn mt-6 btn-sm btn-primary">
			<i class="fa-duotone fa-globe"></i>
			{m.learnMoreDmun()}
		</a>
	</div>
</div>

<Footer />
