import { db, schema } from '$api/db/db';
import { building, dev } from '$app/environment';
import { configPrivate } from '$config/private';
import { configPublic } from '$config/public';
import { makeOIDC } from '@m1212e/sveltekit-oidc';

/**
 * Normalize OIDC claims from different providers into a consistent shape.
 * Logto uses `username` instead of `preferred_username` and `name` instead of `family_name`/`given_name`.
 */
function normalizeOIDCClaims(claims: Record<string, unknown>): Record<string, unknown> {
	const normalized: Record<string, unknown> = { ...claims };

	// Logto: username -> preferred_username
	if (!normalized.preferred_username && normalized.username) {
		normalized.preferred_username = normalized.username;
	}

	// Logto: name -> family_name + given_name (split on last space)
	if ((!normalized.family_name || !normalized.given_name) && typeof normalized.name === 'string') {
		const parts = normalized.name.trim().split(/\s+/);
		if (parts.length >= 2) {
			normalized.given_name = parts.slice(0, -1).join(' ');
			normalized.family_name = parts[parts.length - 1];
		} else {
			normalized.given_name = normalized.name;
			normalized.family_name = normalized.name;
		}
	}

	return normalized;
}

export const OIDC = !building
	? await makeOIDC({
			development: dev,
			oidcAuthority: configPublic.PUBLIC_OIDC_AUTHORITY,
			oidcClientId: configPublic.PUBLIC_OIDC_CLIENT_ID,
			oidcClientSecret: configPrivate.OIDC_CLIENT_SECRET,
			oidcScope: configPrivate.OIDC_SCOPES,
			loginCallbackRoute: configPublic.PUBLIC_OIDC_LOGIN_CALLBACK_ROUTE,
			logoutCallbackRoute: configPublic.PUBLIC_OIDC_LOGOUT_CALLBACK_ROUTE,
			authenticatedRoutes: ['/app'],
			logoutPath: '',
			async userLoggedInSuccessfully({ user }) {
				const normalized = normalizeOIDCClaims(user as Record<string, unknown>);
				const sub = normalized.sub as string;
				const locale =
					(normalized.locale as string | undefined) ?? configPublic.PUBLIC_DEFAULT_LOCALE;
				const preferredUsername = (normalized.preferred_username ?? normalized.email) as string;
				const email = normalized.email as string;
				const familyName = (normalized.family_name as string | undefined) ?? '';
				const givenName = (normalized.given_name as string | undefined) ?? '';
				await db
					.insert(schema.user)
					.values({
						id: sub,
						locale,
						preferredUsername,
						email,
						familyName,
						givenName
					})
					.onConflictDoUpdate({
						target: schema.user.id,
						set: {
							locale,
							preferredUsername,
							email,
							familyName,
							givenName
						}
					});
			}
		})
	: ({} as Awaited<ReturnType<typeof makeOIDC>>);
