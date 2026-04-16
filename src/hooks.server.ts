import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleLogto, UserScope } from '@logto/sveltekit';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { locales, baseLocale, cookieName, cookieMaxAge } from '$lib/paraglide/runtime';
import { configPublic } from '$config/public';
import { configPrivate } from '$config/private';
import { db, schema } from '$api/db/db';

const nonBaseLocales = locales.filter((l) => l !== baseLocale);

// 1. Logto session auth
const logtoHandle = handleLogto(
	{
		endpoint: configPublic.PUBLIC_LOGTO_ENDPOINT,
		appId: configPublic.PUBLIC_LOGTO_APP_ID,
		appSecret: configPrivate.LOGTO_APP_SECRET,
		scopes: [UserScope.Email, UserScope.Phone, UserScope.CustomData, UserScope.Roles]
	},
	{
		encryptionKey: configPrivate.LOGTO_COOKIE_ENCRYPTION_KEY
	},
	{
		fetchUserInfo: true
	}
);

// 2. M2M bearer token validation (JWKS)
const jwks = createRemoteJWKSet(new URL(`${configPublic.PUBLIC_LOGTO_ENDPOINT}/oidc/jwks`));

const bearerTokenHandle: Handle = async ({ event, resolve }) => {
	const authorization = event.request.headers.get('authorization');
	if (!authorization?.startsWith('Bearer ')) {
		return resolve(event);
	}

	const token = authorization.slice('Bearer '.length);
	try {
		const { payload } = await jwtVerify(token, jwks, {
			issuer: `${configPublic.PUBLIC_LOGTO_ENDPOINT}/oidc`,
			...(configPrivate.LOGTO_API_RESOURCE ? { audience: configPrivate.LOGTO_API_RESOURCE } : {})
		});
		event.locals.m2mToken = payload;
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return resolve(event);
};

// 3. Auth guard for /app routes + user DB upsert
const authGuardAndUpsert: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/app')) {
		const isAuthenticated = await event.locals.logtoClient.isAuthenticated();
		if (!isAuthenticated) {
			await event.locals.logtoClient.signIn(`${event.url.origin}/callback`);
		}

		const user = event.locals.user;
		if (user) {
			const sub = user.sub;
			const email = user.email ?? '';
			const preferredUsername = (user.username ?? user.email ?? '') as string;
			const locale = configPublic.PUBLIC_DEFAULT_LOCALE;

			let givenName = '';
			let familyName = '';
			if (user.name) {
				const parts = user.name.trim().split(/\s+/);
				if (parts.length >= 2) {
					givenName = parts.slice(0, -1).join(' ');
					familyName = parts[parts.length - 1];
				} else {
					givenName = user.name;
					familyName = user.name;
				}
			}

			await db
				.insert(schema.user)
				.values({ id: sub, locale, preferredUsername, email, familyName, givenName })
				.onConflictDoUpdate({
					target: schema.user.id,
					set: { locale, preferredUsername, email, familyName, givenName }
				});
		}
	}

	return resolve(event);
};

// 4. Locale redirect (unchanged)
const localeRedirect: Handle = ({ event, resolve }) => {
	const { pathname } = event.url;
	for (const locale of nonBaseLocales) {
		if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
			const bare = pathname.slice(`/${locale}`.length) || '/';
			const domain = event.url.hostname;
			event.cookies.set(cookieName, locale, {
				path: '/',
				maxAge: cookieMaxAge,
				domain,
				httpOnly: false,
				sameSite: 'lax'
			});
			redirect(302, bare + event.url.search);
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(
	logtoHandle,
	bearerTokenHandle,
	authGuardAndUpsert,
	localeRedirect,
	({ event, resolve }) =>
		paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
			event.request = localizedRequest;

			return resolve(event, {
				transformPageChunk: ({ html }) => {
					return html.replace('%lang%', locale);
				}
			});
		})
);
