// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { LogtoClient, UserInfoResponse } from '@logto/sveltekit';
import type { JWTPayload } from 'jose';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			logtoClient: LogtoClient;
			user?: UserInfoResponse;
			m2mToken?: JWTPayload;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
