<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import * as m from '$lib/paraglide/messages';
	import logisticsImage from '$lib/assets/undraw/logistics.svg';
	import heavyLiftingImage from '$lib/assets/undraw/heavy-lifting.svg';
	import collectingImage from '$lib/assets/undraw/collecting.svg';
	import movingImage from '$lib/assets/undraw/moving.svg';
	import blob1 from '$lib/assets/blobs/blob_1.svg';
	import blob2 from '$lib/assets/blobs/blob_2.svg';
	import blob3 from '$lib/assets/blobs/blob_3.svg';
	import blob4 from '$lib/assets/blobs/blob_4.svg';
	import blob5 from '$lib/assets/blobs/blob_5.svg';

	const heroImages = [logisticsImage, heavyLiftingImage, collectingImage, movingImage];
	const heroImage = heroImages[Math.floor(Math.random() * heroImages.length)];

	const blobs = [blob1, blob2, blob3, blob4, blob5];
	const blob = blobs[Math.floor(Math.random() * blobs.length)];
</script>

<!-- Navbar -->
<div class="navbar bg-base-100 px-6 py-3 shadow-md">
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
<div class="relative overflow-hidden bg-base-300">
	<div
		class="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-32 md:flex-row md:py-40"
	>
		<div class="relative flex flex-1 justify-center">
			<img
				src={blob}
				alt=""
				class="absolute top-1/2 left-1/2 z-0 w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-40 dark:opacity-20"
			/>
			<img src={heroImage} alt={m.heroTitle()} class="relative z-10 w-72 md:w-96" />
		</div>
		<div class="flex-1 text-center md:text-right">
			<h1 class="text-4xl font-bold md:text-5xl">
				{m.heroTitle()}
			</h1>
			<p class="mt-4 text-lg opacity-70">
				{m.heroSubtitle()}
			</p>
			<a href="/app" class="btn mt-6 btn-lg btn-primary">
				<i class="fa-solid fa-right-to-bracket"></i>
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
				<i class="fa-duotone fa-cubes mb-2 text-4xl text-primary"></i>
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
<div class="bg-base-100 px-6 py-16">
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
			<i class="fa-solid fa-globe"></i>
			{m.learnMoreDmun()}
		</a>
	</div>
</div>

<Footer />
