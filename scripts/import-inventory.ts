/**
 * Standalone CSV inventory import script for MUNify STOCK.
 * Reads a CSV and inserts directly into PostgreSQL via Drizzle.
 *
 * Usage: bun run scripts/import-inventory.ts <path-to-csv>
 *
 * Environment variables:
 *   DATABASE_URL — PostgreSQL connection string (default: postgres://postgres:postgres@localhost:5432/postgres)
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/api/db/schema';
import { importInventoryCSV } from '../src/api/services/csvImport';

const CSV_PATH = process.argv[2];
const DATABASE_URL =
	process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres';

if (!CSV_PATH) {
	console.error('Usage: bun run scripts/import-inventory.ts <path-to-csv>');
	process.exit(1);
}

const db = drizzle(DATABASE_URL, { schema, casing: 'snake_case' });

async function main() {
	console.log(`Reading CSV from ${CSV_PATH}...`);
	const csvText = await Bun.file(CSV_PATH).text();

	const summary = await importInventoryCSV(db as any, csvText);

	console.log('\n=== Import Summary ===');
	console.log(`Locations created:        ${summary.locationsCreated}`);
	console.log(`Container types created:  ${summary.containerTypesCreated}`);
	console.log(`Containers created:       ${summary.containersCreated}`);
	console.log(`Items created:            ${summary.itemsCreated}`);
	console.log(`Items failed:             ${summary.itemsFailed}`);
	console.log(`Rows skipped:             ${summary.rowsSkipped}`);

	if (summary.errors.length > 0) {
		console.log('\nErrors:');
		for (const err of summary.errors) {
			console.log(`  ${err}`);
		}
	}

	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
