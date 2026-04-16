import { configPrivate } from '$config/private';
import type { RequestEvent } from '@sveltejs/kit';
import { GraphQLError } from 'graphql';

export const oidcRoles = ['admin', 'member'] as const;

export async function context(req: RequestEvent) {
	const roleNames: string[] = [];

	if (configPrivate.LOGTO_ROLE_CLAIM) {
		// Session auth: extract roles from ID token claims or user info
		let rolesRaw: unknown;

		if (req.locals.user) {
			const claims = await req.locals.logtoClient?.getIdTokenClaims?.().catch(() => null);
			rolesRaw =
				(claims as Record<string, unknown>)?.[configPrivate.LOGTO_ROLE_CLAIM] ??
				(req.locals.user as Record<string, unknown>)?.[configPrivate.LOGTO_ROLE_CLAIM];
		}

		// M2M auth: extract roles from scope claim
		if (!rolesRaw && req.locals.m2mToken) {
			const scope = req.locals.m2mToken.scope;
			if (typeof scope === 'string') {
				roleNames.push(...scope.split(' '));
			}
		}

		if (rolesRaw) {
			if (Array.isArray(rolesRaw)) {
				for (const role of rolesRaw) {
					const name = typeof role === 'string' ? role : (role as Record<string, unknown>)?.name;
					if (typeof name === 'string') roleNames.push(name);
				}
			} else if (typeof rolesRaw === 'object') {
				roleNames.push(...Object.keys(rolesRaw as Record<string, unknown>));
			}
		}
	}

	return {
		...req.locals,
		mustBeLoggedIn: () => {
			if (req.locals.user) {
				return req.locals.user;
			}

			if (req.locals.m2mToken) {
				return { sub: req.locals.m2mToken.sub as string, email: null } as unknown as NonNullable<
					typeof req.locals.user
				>;
			}

			throw new GraphQLError('Must be logged in');
		},
		hasRole(role: string) {
			return roleNames.includes(role);
		}
	};
}

export type Context = Awaited<ReturnType<typeof context>>;
