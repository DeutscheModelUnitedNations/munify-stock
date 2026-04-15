/**
 * Generate the rumble GraphQL client.
 *
 * Usage: Start the dev server first, then run:
 *   bun run generate:client
 */
import { generateFromSchema } from '@m1212e/rumble/client/generate';
import { buildClientSchema, getIntrospectionQuery } from 'graphql';

const GRAPHQL_URL = process.env.GRAPHQL_URL ?? 'http://localhost:5173/api/graphql';

async function main() {
	console.log(`Fetching schema from ${GRAPHQL_URL}...`);

	const res = await fetch(GRAPHQL_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: getIntrospectionQuery() })
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch schema: ${res.status} ${res.statusText}`);
	}

	const { data, errors } = await res.json();
	if (errors) {
		throw new Error(`Introspection failed: ${JSON.stringify(errors)}`);
	}

	const schema = buildClientSchema(data);

	console.log('Generating client...');
	await generateFromSchema({
		schema,
		outputPath: './src/lib/generated-client',
		apiUrl: '/api/graphql',
		removeExisting: true,
		forceReactivity: true
	});

	console.log('Client generated at src/lib/generated-client/');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
