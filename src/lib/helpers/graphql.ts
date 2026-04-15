/**
 * Execute a GraphQL query/mutation against the local API.
 * Used from server-side load functions.
 */
export async function gql<T = unknown>(
	fetch: typeof globalThis.fetch,
	query: string,
	variables?: Record<string, unknown>
): Promise<T> {
	const res = await fetch('/api/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, variables })
	});
	const json = await res.json();
	if (json.errors) {
		throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
	}
	return json.data as T;
}
