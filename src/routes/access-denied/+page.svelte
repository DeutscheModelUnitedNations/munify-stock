<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import Footer from '$lib/components/Footer.svelte';

	let { data } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<!-- Navbar -->
	<div class="navbar bg-base-100 px-6 py-3 shadow-md">
		<div class="flex-1">
			<a href="/" class="flex items-center gap-2 text-lg font-bold">
				<i class="fa-duotone fa-warehouse text-primary"></i>
				{m.appName()}
			</a>
		</div>
	</div>

	<!-- Content -->
	<div class="flex flex-1 items-center justify-center bg-base-200 px-6 py-16">
		<div class="card w-full max-w-md bg-base-100 shadow-xl">
			<div class="card-body items-center text-center">
				<i class="fa-duotone fa-lock mb-4 text-6xl text-error"></i>
				<h1 class="card-title text-2xl">{m.accessDeniedTitle()}</h1>
				<p class="mt-2 opacity-70">
					{m.accessDeniedMessage({ email: data.email })}
				</p>
				<p class="mt-2 text-sm opacity-50">
					{m.accessDeniedContact()}
				</p>
				<div class="mt-6 card-actions">
					<a href="/logout" class="btn btn-primary">
						<i class="fa-duotone fa-right-from-bracket"></i>
						{m.accessDeniedLogout()}
					</a>
				</div>
			</div>
		</div>
	</div>

	<Footer />
</div>
