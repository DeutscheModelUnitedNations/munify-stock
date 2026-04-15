<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';
</script>

<div class="flex min-h-screen items-center justify-center bg-base-100">
	<div class="text-center">
		<i class="fa-duotone fa-triangle-exclamation mb-4 text-6xl text-warning"></i>
		<h1 class="text-5xl font-bold">{page.status}</h1>
		<p class="mt-2 text-lg opacity-70">{page.error?.message ?? 'Something went wrong'}</p>
		<div class="mt-6 flex justify-center gap-3">
			<a href="/app" class="btn btn-primary">
				<i class="fa-duotone fa-gauge-high"></i>
				{m.dashboard()}
			</a>
			<button class="btn btn-ghost" onclick={() => history.back()}>
				<i class="fa-solid fa-arrow-left"></i>
				{m.back()}
			</button>
		</div>
	</div>
</div>
