import { env } from '$env/dynamic/private';
import { z } from 'zod';
import { getConfig } from './getConfig';

const schema = z.object({
	DATABASE_URL: z.string(),
	LOGTO_APP_SECRET: z.string(),
	LOGTO_COOKIE_ENCRYPTION_KEY: z.string(),
	LOGTO_SCOPES: z.string().default('openid profile offline_access email phone roles'),
	LOGTO_ROLE_CLAIM: z.optional(z.string()),
	LOGTO_API_RESOURCE: z.optional(z.string()),
	NODE_ENV: z.union([z.literal('development'), z.literal('production'), z.literal('test')]),
	ADMIN_EMAIL_WHITELIST: z.string().optional().default(''),
	ADMIN_DOMAIN_WHITELIST: z.string().optional().default('')
});

export const configPrivate = getConfig({ schema, envSource: env });
