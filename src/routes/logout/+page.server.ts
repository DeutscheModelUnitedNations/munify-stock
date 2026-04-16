import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	await locals.logtoClient.signOut(url.origin + '/');
};
