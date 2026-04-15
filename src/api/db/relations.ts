import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
	user: {
		createdItems: r.many.item({
			from: r.user.id,
			to: r.item.createdBy
		}),
		comments: r.many.comment({
			from: r.user.id,
			to: r.comment.createdBy
		})
	},
	location: {
		containers: r.many.container({
			from: r.location.id,
			to: r.container.locationId
		})
	},
	itemType: {
		items: r.many.item({
			from: r.itemType.id,
			to: r.item.typeId
		})
	},
	containerType: {
		containers: r.many.container({
			from: r.containerType.id,
			to: r.container.typeId
		})
	},
	container: {
		type: r.one.containerType({
			from: r.container.typeId,
			to: r.containerType.id
		}),
		location: r.one.location({
			from: r.container.locationId,
			to: r.location.id
		}),
		items: r.many.item({
			from: r.container.id,
			to: r.item.containerId
		}),
		createdByUser: r.one.user({
			from: r.container.createdBy,
			to: r.user.id
		})
	},
	item: {
		type: r.one.itemType({
			from: r.item.typeId,
			to: r.itemType.id
		}),
		container: r.one.container({
			from: r.item.containerId,
			to: r.container.id
		}),
		aliases: r.many.itemAlias({
			from: r.item.id,
			to: r.itemAlias.itemId
		}),
		comments: r.many.comment({
			from: r.item.id,
			to: r.comment.itemId
		}),
		createdByUser: r.one.user({
			from: r.item.createdBy,
			to: r.user.id
		})
	},
	itemAlias: {
		item: r.one.item({
			from: r.itemAlias.itemId,
			to: r.item.id
		})
	},
	flag: {
		container: r.one.container({
			from: r.flag.containerId,
			to: r.container.id
		}),
		checks: r.many.flagCheck({
			from: r.flag.id,
			to: r.flagCheck.flagId
		})
	},
	comment: {
		item: r.one.item({
			from: r.comment.itemId,
			to: r.item.id
		}),
		createdByUser: r.one.user({
			from: r.comment.createdBy,
			to: r.user.id
		})
	},
	inventorySession: {
		checks: r.many.inventoryCheck({
			from: r.inventorySession.id,
			to: r.inventoryCheck.sessionId
		}),
		createdByUser: r.one.user({
			from: r.inventorySession.createdBy,
			to: r.user.id
		})
	},
	inventoryCheck: {
		session: r.one.inventorySession({
			from: r.inventoryCheck.sessionId,
			to: r.inventorySession.id
		}),
		container: r.one.container({
			from: r.inventoryCheck.containerId,
			to: r.container.id
		}),
		items: r.many.inventoryCheckItem({
			from: r.inventoryCheck.id,
			to: r.inventoryCheckItem.checkId
		}),
		checkedByUser: r.one.user({
			from: r.inventoryCheck.checkedBy,
			to: r.user.id
		})
	},
	inventoryCheckItem: {
		check: r.one.inventoryCheck({
			from: r.inventoryCheckItem.checkId,
			to: r.inventoryCheck.id
		}),
		item: r.one.item({
			from: r.inventoryCheckItem.itemId,
			to: r.item.id
		})
	},
	flagInventorySession: {
		checks: r.many.flagCheck({
			from: r.flagInventorySession.id,
			to: r.flagCheck.sessionId
		}),
		createdByUser: r.one.user({
			from: r.flagInventorySession.createdBy,
			to: r.user.id
		})
	},
	flagCheck: {
		session: r.one.flagInventorySession({
			from: r.flagCheck.sessionId,
			to: r.flagInventorySession.id
		}),
		flag: r.one.flag({
			from: r.flagCheck.flagId,
			to: r.flag.id
		}),
		checkedByUser: r.one.user({
			from: r.flagCheck.checkedBy,
			to: r.user.id
		})
	}
}));
