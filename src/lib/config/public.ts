import { env } from '$env/dynamic/public';
import { z } from 'zod';
import { getConfig } from './getConfig';

const schema = z.object({
	PUBLIC_LOGTO_ENDPOINT: z.string(),
	PUBLIC_LOGTO_APP_ID: z.string(),
	PUBLIC_DEFAULT_LOCALE: z.string().default('de'),
	PUBLIC_CONTACT_EMAIL: z.string().optional()
});

export const configPublic = getConfig({ schema, envSource: env });
