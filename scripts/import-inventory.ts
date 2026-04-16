/**
 * Standalone CSV inventory import script for MUNify STOCK.
 * Reads a CSV and inserts directly into PostgreSQL via Drizzle.
 *
 * Usage: bun run scripts/import-inventory.ts
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../src/api/db/schema';
import { nanoid } from '../src/lib/helpers/nanoid';

// --- Configuration ---

const CSV_PATH =
	'/Users/tadestrehk/Downloads/Sicherungskopie von 20250601_MG_Materialliste_postBW - Tabellenblatt1.csv';
const DATABASE_URL =
	process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres';

const db = drizzle(DATABASE_URL, { schema, casing: 'snake_case' });

// CSV column indices (0-based)
const COL = {
	nummer: 0,
	artikel: 1,
	anzahl: 2,
	verpackung: 3,
	kistenbezeichnung: 4,
	standort: 5,
	anmerkung: 6,
	alternativeSchlagworte: 7
} as const;

const CUSTOM_ID_REGEX = /^[a-zA-Z0-9\-._]+$/;
const SKIP_ARTIKEL_PATTERNS = [/^Flaggen/i, /^Flaggenf/i];
const CONTAINER_TYPE_KEYWORDS = ['Kiste', 'Karton', 'Rolle', 'Tasche', 'Trolley'];

// --- CSV Parser ---

function parseCSV(text: string): string[][] {
	const rows: string[][] = [];
	let current: string[] = [];
	let field = '';
	let inQuotes = false;
	let i = 0;

	while (i < text.length) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === '"') {
				if (i + 1 < text.length && text[i + 1] === '"') {
					field += '"';
					i += 2;
				} else {
					inQuotes = false;
					i++;
				}
			} else {
				field += ch;
				i++;
			}
		} else {
			if (ch === '"') {
				inQuotes = true;
				i++;
			} else if (ch === ',') {
				current.push(field.trim());
				field = '';
				i++;
			} else if (ch === '\r') {
				i++;
			} else if (ch === '\n') {
				current.push(field.trim());
				field = '';
				if (current.some((c) => c !== '')) rows.push(current);
				current = [];
				i++;
			} else {
				field += ch;
				i++;
			}
		}
	}
	current.push(field.trim());
	if (current.some((c) => c !== '')) rows.push(current);
	return rows;
}

// --- Helpers ---

function extractContainerType(verpackung: string): string | null {
	for (const kw of CONTAINER_TYPE_KEYWORDS) {
		if (verpackung.startsWith(kw)) return kw;
	}
	return null;
}

function cleanCustomId(raw: string): string | null {
	if (!raw || raw === '-') return null;
	const cleaned = raw.replace(/[?\s]/g, '');
	if (!cleaned || !CUSTOM_ID_REGEX.test(cleaned)) return null;
	return cleaned;
}

function parseQuantity(raw: string): { quantity?: number; quantityDescription?: string } {
	if (!raw || raw === '-') return {};
	const n = parseInt(raw, 10);
	if (!isNaN(n) && n.toString() === raw.trim()) return { quantity: n };
	return { quantityDescription: raw };
}

function isMetadataRow(row: string[]): boolean {
	return (row[COL.standort] ?? '') === '-';
}

function isSkippedArtikel(artikel: string): boolean {
	return SKIP_ARTIKEL_PATTERNS.some((p) => p.test(artikel));
}

// --- Main ---

const PRIMARY_LOCATION = 'Kiel';

interface ContainerInfo {
	key: string;
	type: string | null;
	label: string;
	verpackung: string;
	description?: string;
	temporaryLocation?: string;
}

async function main() {
	console.log(`Reading CSV from ${CSV_PATH}...`);
	const csvText = await Bun.file(CSV_PATH).text();
	const allRows = parseCSV(csvText);

	const headerRow = allRows[0];
	console.log(`Header: ${headerRow?.join(' | ')}`);

	let dataStart = 1;
	for (let i = 1; i < allRows.length; i++) {
		if ((allRows[i][COL.artikel] ?? '').includes('Bitte nicht')) {
			dataStart = i + 1;
			break;
		}
	}

	const dataRows = allRows.slice(dataStart);
	console.log(`Total data rows: ${dataRows.length}`);

	// --- Phase 1: Extract unique entities ---

	const locationNames = new Set<string>();
	const containerTypeNames = new Set<string>();
	const containerInfoMap = new Map<string, ContainerInfo>();
	const metadataDescriptions = new Map<string, string>();

	for (const row of dataRows) {
		const standort = row[COL.standort] ?? '';
		const verpackung = row[COL.verpackung] ?? '';
		const kistenbezeichnung = row[COL.kistenbezeichnung] ?? '';
		const artikel = row[COL.artikel] ?? '';
		const anmerkung = row[COL.anmerkung] ?? '';

		if (isMetadataRow(row)) {
			if (verpackung && anmerkung) metadataDescriptions.set(verpackung, anmerkung);
			continue;
		}

		if (!artikel || isSkippedArtikel(artikel)) continue;

		if (standort && standort !== '-') locationNames.add(standort);

		if (verpackung && verpackung.toLowerCase() !== 'lose') {
			const typeName = extractContainerType(verpackung);
			if (typeName) containerTypeNames.add(typeName);

			const containerKey = `${verpackung}||${kistenbezeichnung}`;
			if (!containerInfoMap.has(containerKey)) {
				containerInfoMap.set(containerKey, {
					key: containerKey,
					type: typeName,
					label: kistenbezeichnung || verpackung,
					verpackung,
					temporaryLocation: standort && standort !== PRIMARY_LOCATION ? standort : undefined
				});
			} else if (standort && standort !== PRIMARY_LOCATION) {
				containerInfoMap.get(containerKey)!.temporaryLocation = standort;
			}
		}
	}

	for (const [, container] of containerInfoMap) {
		const desc = metadataDescriptions.get(container.verpackung);
		if (desc) container.description = desc;
	}

	console.log(`\nEntities to create:`);
	console.log(`  Locations: ${locationNames.size}`);
	console.log(`  Container Types: ${containerTypeNames.size}`);
	console.log(`  Containers: ${containerInfoMap.size}`);

	// --- Phase 2: Create locations ---

	console.log('\nCreating locations...');
	const locationIdMap = new Map<string, string>();
	for (const name of locationNames) {
		const [existing] = await db
			.select({ id: schema.location.id })
			.from(schema.location)
			.where(eq(schema.location.name, name))
			.limit(1);
		if (existing) {
			locationIdMap.set(name, existing.id);
			console.log(`  EXISTS location "${name}" -> ${existing.id}`);
			continue;
		}
		const id = nanoid();
		await db.insert(schema.location).values({ id, name });
		locationIdMap.set(name, id);
		console.log(`  OK location "${name}" -> ${id}`);
	}

	// --- Phase 3: Create container types ---

	console.log('\nCreating container types...');
	const containerTypeIdMap = new Map<string, string>();
	for (const name of containerTypeNames) {
		const [existing] = await db
			.select({ id: schema.containerType.id })
			.from(schema.containerType)
			.where(eq(schema.containerType.name, name))
			.limit(1);
		if (existing) {
			containerTypeIdMap.set(name, existing.id);
			console.log(`  EXISTS container type "${name}" -> ${existing.id}`);
			continue;
		}
		const id = nanoid();
		await db.insert(schema.containerType).values({ id, name });
		containerTypeIdMap.set(name, id);
		console.log(`  OK container type "${name}" -> ${id}`);
	}

	// --- Phase 4: Create containers ---

	console.log('\nCreating containers...');
	const containerIdMap = new Map<string, string>();
	const usedCustomIds = new Set<string>();
	for (const [key, info] of containerInfoMap) {
		const id = nanoid();

		// Derive customId from Verpackung: "Kiste 11" -> "K-11", "Kiste 15 (lang)" -> "K-15"
		let customId: string | undefined;
		const kisteMatch = info.verpackung.match(/^Kiste\s+(\d+)/);
		if (kisteMatch) {
			let candidate = `K-${kisteMatch[1]}`;
			let suffix = 2;
			while (usedCustomIds.has(candidate)) {
				candidate = `K-${kisteMatch[1]}-${suffix}`;
				suffix++;
			}
			customId = candidate;
			usedCustomIds.add(customId);
		}

		await db.insert(schema.container).values({
			id,
			customId,
			label: info.label,
			typeId: info.type ? containerTypeIdMap.get(info.type) : undefined,
			locationId: locationIdMap.get(PRIMARY_LOCATION),
			description: info.description,
			isTemporarilyMoved: !!info.temporaryLocation,
			temporaryLocation: info.temporaryLocation
		});
		containerIdMap.set(key, id);
		console.log(
			`  OK container "${info.label}" (${info.verpackung}) customId=${customId ?? '--'} -> ${id}`
		);
	}

	// --- Phase 5: Create items ---

	console.log('\nCreating items...');
	let itemsCreated = 0;
	let itemsFailed = 0;
	let itemsSkipped = 0;

	for (const row of dataRows) {
		const artikel = row[COL.artikel] ?? '';
		const standort = row[COL.standort] ?? '';
		const verpackung = row[COL.verpackung] ?? '';
		const kistenbezeichnung = row[COL.kistenbezeichnung] ?? '';

		if (isMetadataRow(row) || !artikel || isSkippedArtikel(artikel)) {
			itemsSkipped++;
			continue;
		}

		try {
			const customId = cleanCustomId(row[COL.nummer] ?? '');
			const { quantity, quantityDescription } = parseQuantity(row[COL.anzahl] ?? '');
			const description = row[COL.anmerkung] ?? '';
			const aliasesRaw = row[COL.alternativeSchlagworte] ?? '';
			const aliases = aliasesRaw
				? aliasesRaw
						.split(',')
						.map((a) => a.trim())
						.filter(Boolean)
				: [];

			const isLoose = !verpackung || verpackung.toLowerCase() === 'lose';
			const containerKey = `${verpackung}||${kistenbezeichnung}`;
			const containerId = isLoose ? undefined : containerIdMap.get(containerKey);
			const locationId = isLoose && standort ? locationIdMap.get(standort) : undefined;

			await db.insert(schema.item).values({
				id: nanoid(),
				name: artikel,
				customId: customId ?? undefined,
				quantity,
				quantityDescription,
				description: description || undefined,
				aliases,
				containerId,
				locationId
			});
			itemsCreated++;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error(`  FAIL item "${artikel}" (Nummer: ${row[COL.nummer]}): ${msg}`);
			itemsFailed++;
		}
	}

	// --- Summary ---

	console.log('\n=== Import Summary ===');
	console.log(`Locations created:        ${locationIdMap.size}`);
	console.log(`Container types created:  ${containerTypeIdMap.size}`);
	console.log(`Containers created:       ${containerIdMap.size}`);
	console.log(`Items created:            ${itemsCreated}`);
	console.log(`Items failed:             ${itemsFailed}`);
	console.log(`Rows skipped:             ${itemsSkipped}`);

	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
