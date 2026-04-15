import { configPrivate } from '$config/private';
import type { RequestEvent } from '@sveltejs/kit';
import { GraphQLError } from 'graphql';

export const oidcRoles = ['admin', 'member'] as const;

export async function context(req: RequestEvent) {
	const OIDCRoleNames: string[] = [];
	if (configPrivate.OIDC_ROLE_CLAIM) {
		const tokenData = (req.locals.oidc?.accessToken ?? {}) as Record<string, unknown>;
		const idTokenData = (req.locals.oidc?.idToken ?? {}) as Record<string, unknown>;
		const rolesRaw =
			tokenData[configPrivate.OIDC_ROLE_CLAIM] ?? idTokenData[configPrivate.OIDC_ROLE_CLAIM];
		if (rolesRaw) {
			// Support both Logto format (array of role objects/strings) and Zitadel format (object with role keys)
			if (Array.isArray(rolesRaw)) {
				for (const role of rolesRaw) {
					const name = typeof role === 'string' ? role : (role as Record<string, unknown>)?.name;
					if (typeof name === 'string') OIDCRoleNames.push(name);
				}
			} else if (typeof rolesRaw === 'object') {
				OIDCRoleNames.push(...Object.keys(rolesRaw as Record<string, unknown>));
			}
		}
	}

	return {
		...req.locals,
		mustBeLoggedIn: () => {
			if (!req.locals.oidc?.user) {
				throw new GraphQLError('Must be logged in');
			}

			return req.locals.oidc.user;
		},
		hasRole(role: string) {
			return OIDCRoleNames.includes(role);
		}
	};
}

export type Context = Awaited<ReturnType<typeof context>>;
