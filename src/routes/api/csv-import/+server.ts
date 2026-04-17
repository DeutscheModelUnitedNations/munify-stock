import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$api/db/db';
import { context } from '$api/context';
import { isGlobalAdmin } from '$api/services/isAdminEmail';
import { importInventoryCSV } from '$api/services/csvImport';

export const POST: RequestHandler = async (event) => {
	const ctx = await context(event);

	if (!isGlobalAdmin(ctx)) {
		return json({ error: 'Forbidden: admin access required' }, { status: 403 });
	}

	const contentType = event.request.headers.get('content-type') ?? '';

	let csvText: string;

	if (contentType.includes('multipart/form-data')) {
		const formData = await event.request.formData();
		const file = formData.get('file');
		if (!file || !(file instanceof File)) {
			return json({ error: 'Missing "file" field in form data' }, { status: 400 });
		}
		csvText = await file.text();
	} else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
		csvText = await event.request.text();
	} else {
		return json(
			{ error: 'Unsupported content type. Use multipart/form-data or text/csv.' },
			{ status: 400 }
		);
	}

	if (!csvText.trim()) {
		return json({ error: 'CSV file is empty' }, { status: 400 });
	}

	let userId: string | undefined;
	try {
		const user = ctx.mustBeLoggedIn();
		userId = user.sub;
	} catch {
		// M2M without sub — proceed without createdBy
	}

	const summary = await importInventoryCSV(db, csvText, userId);

	return json(summary, { status: summary.itemsFailed > 0 ? 207 : 200 });
};
