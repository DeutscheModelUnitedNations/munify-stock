<script lang="ts">
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import SideNavigationDrawer from '$lib/components/SideNavigationDrawer.svelte';
	import NavMenu from '$lib/components/NavMenu/NavMenu.svelte';
	import NavMenuButton from '$lib/components/NavMenu/NavMenuButton.svelte';
	import NavMenuSection from '$lib/components/NavMenu/NavMenuSection.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import EntityDrawer from '$lib/components/EntityDrawer/EntityDrawer.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data, children } = $props();

	let sidebarExpanded = $state(true);
	let searchModal: SearchModal;
</script>

<div class="flex h-full w-full flex-col">
	<!-- Top Navbar (full width) -->
	<div class="w-full p-4">
		<div
			class="navbar justify-between gap-0 rounded-box border-1 border-base-300 bg-base-200 px-4 py-2 sm:gap-2"
		>
			{#if !sidebarExpanded}
				<button
					class="sm:hidden"
					aria-label="Open navigation"
					onclick={() => (sidebarExpanded = true)}
				>
					<i class="fa-duotone fa-bars mr-3 text-xl"></i>
				</button>
			{/if}

			<Breadcrumbs />

			<div class="flex items-center gap-1">
				<button
					class="btn hidden gap-2 text-base-content/60 btn-ghost btn-sm sm:flex"
					onclick={() => searchModal.openSearch()}
				>
					<i class="fa-duotone fa-magnifying-glass"></i>
					<span class="text-sm">{m.search()}</span>
					<kbd class="kbd kbd-xs">&#8984;K</kbd>
				</button>
				<ThemeSwitcher />

				<div class="dropdown dropdown-end z-10">
					<div tabindex="-1" class="btn btn-square btn-ghost">
						<i class="fa-duotone fa-user text-xl"></i>
					</div>
					<ul
						tabindex="-1"
						class="dropdown-content menu mt-3 w-52 rounded-box bg-base-100 p-2 shadow-2xl"
					>
						{#if data.user}
							<li class="menu-title text-xs">{data.user.email}</li>
						{/if}
						<li>
							<a href="/app">
								<i class="fa-duotone fa-gauge-high w-4"></i>
								{m.dashboard()}
							</a>
						</li>
						<li>
							<a href="/logout">
								<i class="fa-duotone fa-sign-out w-4"></i>
								{m.logout()}
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Sidebar + Content (below navbar) -->
	<div class="flex h-full w-full px-4">
		<SideNavigationDrawer bind:expanded={sidebarExpanded}>
			<NavMenu>
				<NavMenuButton
					href="/app/items"
					icon="fa-boxes-stacked"
					title={m.items()}
					bind:expanded={sidebarExpanded}
				/>
				<NavMenuButton
					href="/app/containers"
					icon="fa-box"
					title={m.containers()}
					bind:expanded={sidebarExpanded}
				/>
				<NavMenuButton
					href="/app/flags"
					icon="fa-flag"
					title={m.flags()}
					bind:expanded={sidebarExpanded}
				/>
				<NavMenuButton
					href="/app/inventory"
					icon="fa-clipboard-list"
					title={m.inventory()}
					bind:expanded={sidebarExpanded}
				/>
				<NavMenuButton
					href="/app/scan"
					icon="fa-qrcode"
					title={m.scanCode()}
					bind:expanded={sidebarExpanded}
				/>
				<NavMenuSection title={m.admin()} icon="fa-shield-halved" expanded={sidebarExpanded}>
					<NavMenuButton
						href="/app/admin/types"
						icon="fa-tags"
						title={m.types()}
						bind:expanded={sidebarExpanded}
					/>
					<NavMenuButton
						href="/app/admin/locations"
						icon="fa-location-dot"
						title={m.locations()}
						bind:expanded={sidebarExpanded}
					/>
					<NavMenuButton
						href="/app/admin/users"
						icon="fa-users"
						title={m.users()}
						bind:expanded={sidebarExpanded}
					/>
				</NavMenuSection>
			</NavMenu>
		</SideNavigationDrawer>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto px-2 sm:px-4">
			{@render children()}
		</main>
	</div>
</div>

<SearchModal bind:this={searchModal} />
<EntityDrawer />
