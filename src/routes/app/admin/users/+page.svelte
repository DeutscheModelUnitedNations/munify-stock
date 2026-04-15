<script lang="ts">
	import { client } from '$lib/generated-client/client';
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';

	import type { UserView } from '$lib/types/views';

	let users = $state<UserView[]>([]);

	if (browser) {
		const q = client.liveQuery.users({
			id: true,
			email: true,
			givenName: true,
			familyName: true,
			preferredUsername: true,
			createdAt: true
		});
		q.subscribe((v) => {
			if (v) users = v;
		});
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold">
		<i class="fa-duotone fa-users mr-2"></i>{m.usersTitle()}
	</h1>

	<p class="text-sm opacity-50">
		{m.usersHint()}
	</p>

	<div class="overflow-x-auto">
		<table class="table">
			<thead>
				<tr>
					<th>{m.userName()}</th>
					<th>{m.userEmail()}</th>
					<th>{m.userUsername()}</th>
					<th>{m.userFirstLogin()}</th>
				</tr>
			</thead>
			<tbody>
				{#each users as user}
					<tr class="hover:bg-base-200">
						<td>
							<div class="flex items-center gap-2">
								<i class="fa-duotone fa-user opacity-50"></i>
								{user.givenName}
								{user.familyName}
							</div>
						</td>
						<td>{user.email}</td>
						<td class="text-sm opacity-70">{user.preferredUsername}</td>
						<td class="text-sm opacity-70">{new Date(user.createdAt).toLocaleDateString()}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="text-center opacity-50">{m.noUsersYet()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
