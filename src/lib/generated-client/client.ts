import { Client, fetchExchange } from '@urql/core';
import { cacheExchange } from '@urql/exchange-graphcache';
import { nativeDateExchange } from '@m1212e/rumble/client';
import { schema } from './schema';
import { makeLiveQuery, makeMutation, makeSubscription, makeQuery } from '@m1212e/rumble/client';

export type AuditactionEnum = "DELETE" | "INSERT" | "UPDATE";
		
export type Auditlog = {
  action: AuditactionEnum,
  changedAt: DateTime,
  changedBy: String | null,
  fieldName: String | null,
  id: Int,
  newValue: String | null,
  oldValue: String | null,
  recordId: ID,
  tableName: String    
};
		
export type AuditlogOrderInputArgument = {
  action?: SortingParameter | null | undefined,
  changedAt?: SortingParameter | null | undefined,
  changedBy?: SortingParameter | null | undefined,
  fieldName?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  newValue?: SortingParameter | null | undefined,
  oldValue?: SortingParameter | null | undefined,
  recordId?: SortingParameter | null | undefined,
  tableName?: SortingParameter | null | undefined    
};
		
export type AuditlogWhereInputArgument = {
  action?: AuditactionEnum | null | undefined,
  changedAt?: DateWhereInputArgument | null | undefined,
  changedBy?: StringWhereInputArgument | null | undefined,
  fieldName?: StringWhereInputArgument | null | undefined,
  id?: IntWhereInputArgument | null | undefined,
  newValue?: StringWhereInputArgument | null | undefined,
  oldValue?: StringWhereInputArgument | null | undefined,
  recordId?: ID | null | undefined,
  tableName?: StringWhereInputArgument | null | undefined    
};
		
export type Boolean = boolean;
		
export type CheckstatusEnum = "COMPLETED" | "IN_PROGRESS" | "PENDING";
		
export type Comment = {
  container: (p?: {
    orderBy?: ContainerOrderInputArgument | null | undefined,
    where?: ContainerWhereInputArgument | null | undefined
  }) => Container | null,
  containerId: ID | null,
  createdAt: DateTime,
  createdBy: String | null,
  createdByUser: (p?: {
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User | null,
  id: ID,
  item: (p?: {
    orderBy?: ItemOrderInputArgument | null | undefined,
    where?: ItemWhereInputArgument | null | undefined
  }) => Item | null,
  itemId: ID | null,
  parent: (p?: {
    orderBy?: CommentOrderInputArgument | null | undefined,
    where?: CommentWhereInputArgument | null | undefined
  }) => Comment | null,
  parentId: ID | null,
  replies: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: CommentOrderInputArgument | null | undefined,
    where?: CommentWhereInputArgument | null | undefined
  }) => Comment[],
  resolved: Boolean,
  resolvedAt: DateTime | null,
  resolvedBy: String | null,
  resolvedByUser: (p?: {
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User | null,
  text: String,
  updatedAt: DateTime | null    
};
		
export type CommentOrderInputArgument = {
  container?: ContainerOrderInputArgument | null | undefined,
  containerId?: SortingParameter | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  createdBy?: SortingParameter | null | undefined,
  createdByUser?: UserOrderInputArgument | null | undefined,
  id?: SortingParameter | null | undefined,
  item?: ItemOrderInputArgument | null | undefined,
  itemId?: SortingParameter | null | undefined,
  parent?: CommentOrderInputArgument | null | undefined,
  parentId?: SortingParameter | null | undefined,
  replies?: CommentOrderInputArgument | null | undefined,
  resolved?: SortingParameter | null | undefined,
  resolvedAt?: SortingParameter | null | undefined,
  resolvedBy?: SortingParameter | null | undefined,
  resolvedByUser?: UserOrderInputArgument | null | undefined,
  text?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type CommentWhereInputArgument = {
  container?: ContainerWhereInputArgument | null | undefined,
  containerId?: ID | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  createdBy?: StringWhereInputArgument | null | undefined,
  createdByUser?: UserWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  item?: ItemWhereInputArgument | null | undefined,
  itemId?: ID | null | undefined,
  parent?: CommentWhereInputArgument | null | undefined,
  parentId?: ID | null | undefined,
  replies?: CommentWhereInputArgument | null | undefined,
  resolved?: Boolean | null | undefined,
  resolvedAt?: DateWhereInputArgument | null | undefined,
  resolvedBy?: StringWhereInputArgument | null | undefined,
  resolvedByUser?: UserWhereInputArgument | null | undefined,
  text?: StringWhereInputArgument | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type Container = {
  comments: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: CommentOrderInputArgument | null | undefined,
    where?: CommentWhereInputArgument | null | undefined
  }) => Comment[],
  createdAt: DateTime,
  createdBy: String | null,
  createdByUser: (p?: {
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User | null,
  customId: ID | null,
  description: String | null,
  id: ID,
  isTemporarilyMoved: Boolean,
  items: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ItemOrderInputArgument | null | undefined,
    where?: ItemWhereInputArgument | null | undefined
  }) => Item[],
  label: String | null,
  location: (p?: {
    orderBy?: LocationOrderInputArgument | null | undefined,
    where?: LocationWhereInputArgument | null | undefined
  }) => Location | null,
  locationDetail: String | null,
  locationId: ID | null,
  qrCode: String | null,
  temporaryLocation: String | null,
  type: (p?: {
    orderBy?: ContainertypeOrderInputArgument | null | undefined,
    where?: ContainertypeWhereInputArgument | null | undefined
  }) => Containertype | null,
  typeId: ID | null,
  updatedAt: DateTime | null    
};
		
export type ContainerOrderInputArgument = {
  comments?: CommentOrderInputArgument | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  createdBy?: SortingParameter | null | undefined,
  createdByUser?: UserOrderInputArgument | null | undefined,
  customId?: SortingParameter | null | undefined,
  description?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  isTemporarilyMoved?: SortingParameter | null | undefined,
  items?: ItemOrderInputArgument | null | undefined,
  label?: SortingParameter | null | undefined,
  location?: LocationOrderInputArgument | null | undefined,
  locationDetail?: SortingParameter | null | undefined,
  locationId?: SortingParameter | null | undefined,
  qrCode?: SortingParameter | null | undefined,
  temporaryLocation?: SortingParameter | null | undefined,
  type?: ContainertypeOrderInputArgument | null | undefined,
  typeId?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type ContainerWhereInputArgument = {
  comments?: CommentWhereInputArgument | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  createdBy?: StringWhereInputArgument | null | undefined,
  createdByUser?: UserWhereInputArgument | null | undefined,
  customId?: ID | null | undefined,
  description?: StringWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  isTemporarilyMoved?: Boolean | null | undefined,
  items?: ItemWhereInputArgument | null | undefined,
  label?: StringWhereInputArgument | null | undefined,
  location?: LocationWhereInputArgument | null | undefined,
  locationDetail?: StringWhereInputArgument | null | undefined,
  locationId?: ID | null | undefined,
  qrCode?: StringWhereInputArgument | null | undefined,
  temporaryLocation?: StringWhereInputArgument | null | undefined,
  type?: ContainertypeWhereInputArgument | null | undefined,
  typeId?: ID | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type Containertype = {
  containers: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ContainerOrderInputArgument | null | undefined,
    where?: ContainerWhereInputArgument | null | undefined
  }) => Container[],
  createdAt: DateTime,
  createdBy: String | null,
  description: String | null,
  id: ID,
  name: String,
  updatedAt: DateTime | null    
};
		
export type ContainertypeOrderInputArgument = {
  containers?: ContainerOrderInputArgument | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  createdBy?: SortingParameter | null | undefined,
  description?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  name?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type ContainertypeWhereInputArgument = {
  containers?: ContainerWhereInputArgument | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  createdBy?: StringWhereInputArgument | null | undefined,
  description?: StringWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  name?: StringWhereInputArgument | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type DateTime = Date;
		
export type DateWhereInputArgument = {
  AND?: DateWhereInputArgument[] | undefined,
  NOT?: DateWhereInputArgument | null | undefined,
  OR?: DateWhereInputArgument[] | undefined,
  arrayContained?: Date[] | undefined,
  arrayContains?: Date[] | undefined,
  arrayOverlaps?: Date[] | undefined,
  eq?: Date | null | undefined,
  gt?: Date | null | undefined,
  gte?: Date | null | undefined,
  ilike?: String | null | undefined,
  in?: Date[] | undefined,
  isNotNull?: Boolean | null | undefined,
  isNull?: Boolean | null | undefined,
  like?: String | null | undefined,
  lt?: Date | null | undefined,
  lte?: Date | null | undefined,
  ne?: Date | null | undefined,
  notIlike?: String | null | undefined,
  notIn?: Date[] | undefined,
  notLike?: String | null | undefined    
};
		
export type Flag = {
  checks: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: FlagcheckOrderInputArgument | null | undefined,
    where?: FlagcheckWhereInputArgument | null | undefined
  }) => Flagcheck[],
  container: (p?: {
    orderBy?: ContainerOrderInputArgument | null | undefined,
    where?: ContainerWhereInputArgument | null | undefined
  }) => Container | null,
  containerId: ID | null,
  countryCode: String,
  countryName: String,
  createdAt: DateTime,
  id: ID,
  notes: String | null,
  quantity: Int,
  updatedAt: DateTime | null    
};
		
export type FlagOrderInputArgument = {
  checks?: FlagcheckOrderInputArgument | null | undefined,
  container?: ContainerOrderInputArgument | null | undefined,
  containerId?: SortingParameter | null | undefined,
  countryCode?: SortingParameter | null | undefined,
  countryName?: SortingParameter | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  notes?: SortingParameter | null | undefined,
  quantity?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type FlagWhereInputArgument = {
  checks?: FlagcheckWhereInputArgument | null | undefined,
  container?: ContainerWhereInputArgument | null | undefined,
  containerId?: ID | null | undefined,
  countryCode?: StringWhereInputArgument | null | undefined,
  countryName?: StringWhereInputArgument | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  notes?: StringWhereInputArgument | null | undefined,
  quantity?: IntWhereInputArgument | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type Flagcheck = {
  checkedBy: String | null,
  checkedByUser: (p?: {
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User | null,
  condition: FlagconditionEnum | null,
  createdAt: DateTime,
  flag: (p?: {
    orderBy?: FlagOrderInputArgument | null | undefined,
    where?: FlagWhereInputArgument | null | undefined
  }) => Flag,
  flagId: ID,
  found: Boolean,
  id: ID,
  notes: String | null,
  session: (p?: {
    orderBy?: FlaginventorysessionOrderInputArgument | null | undefined,
    where?: FlaginventorysessionWhereInputArgument | null | undefined
  }) => Flaginventorysession,
  sessionId: ID,
  updatedAt: DateTime | null    
};
		
export type FlagcheckOrderInputArgument = {
  checkedBy?: SortingParameter | null | undefined,
  checkedByUser?: UserOrderInputArgument | null | undefined,
  condition?: SortingParameter | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  flag?: FlagOrderInputArgument | null | undefined,
  flagId?: SortingParameter | null | undefined,
  found?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  notes?: SortingParameter | null | undefined,
  session?: FlaginventorysessionOrderInputArgument | null | undefined,
  sessionId?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type FlagcheckWhereInputArgument = {
  checkedBy?: StringWhereInputArgument | null | undefined,
  checkedByUser?: UserWhereInputArgument | null | undefined,
  condition?: FlagconditionEnum | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  flag?: FlagWhereInputArgument | null | undefined,
  flagId?: ID | null | undefined,
  found?: Boolean | null | undefined,
  id?: ID | null | undefined,
  notes?: StringWhereInputArgument | null | undefined,
  session?: FlaginventorysessionWhereInputArgument | null | undefined,
  sessionId?: ID | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type FlagconditionEnum = "DAMAGED" | "GOOD" | "NEEDS_REPLACEMENT";
		
export type Flaginventorysession = {
  checks: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: FlagcheckOrderInputArgument | null | undefined,
    where?: FlagcheckWhereInputArgument | null | undefined
  }) => Flagcheck[],
  createdAt: DateTime,
  createdBy: String | null,
  createdByUser: (p?: {
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User | null,
  date: DateTime,
  id: ID,
  name: String,
  status: SessionstatusEnum,
  updatedAt: DateTime | null    
};
		
export type FlaginventorysessionOrderInputArgument = {
  checks?: FlagcheckOrderInputArgument | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  createdBy?: SortingParameter | null | undefined,
  createdByUser?: UserOrderInputArgument | null | undefined,
  date?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  name?: SortingParameter | null | undefined,
  status?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type FlaginventorysessionWhereInputArgument = {
  checks?: FlagcheckWhereInputArgument | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  createdBy?: StringWhereInputArgument | null | undefined,
  createdByUser?: UserWhereInputArgument | null | undefined,
  date?: DateWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  name?: StringWhereInputArgument | null | undefined,
  status?: SessionstatusEnum | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type Float = number;
		
export type FloatWhereInputArgument = {
  AND?: FloatWhereInputArgument[] | undefined,
  NOT?: FloatWhereInputArgument | null | undefined,
  OR?: FloatWhereInputArgument[] | undefined,
  arrayContained?: Float[] | undefined,
  arrayContains?: Float[] | undefined,
  arrayOverlaps?: Float[] | undefined,
  eq?: Float | null | undefined,
  gt?: Float | null | undefined,
  gte?: Float | null | undefined,
  ilike?: String | null | undefined,
  in?: Float[] | undefined,
  isNotNull?: Boolean | null | undefined,
  isNull?: Boolean | null | undefined,
  like?: String | null | undefined,
  lt?: Float | null | undefined,
  lte?: Float | null | undefined,
  ne?: Float | null | undefined,
  notIlike?: String | null | undefined,
  notIn?: Float[] | undefined,
  notLike?: String | null | undefined    
};
		
export type ID = string;
		
export type Int = number;
		
export type IntWhereInputArgument = {
  AND?: IntWhereInputArgument[] | undefined,
  NOT?: IntWhereInputArgument | null | undefined,
  OR?: IntWhereInputArgument[] | undefined,
  arrayContained?: Int[] | undefined,
  arrayContains?: Int[] | undefined,
  arrayOverlaps?: Int[] | undefined,
  eq?: Int | null | undefined,
  gt?: Int | null | undefined,
  gte?: Int | null | undefined,
  ilike?: String | null | undefined,
  in?: Int[] | undefined,
  isNotNull?: Boolean | null | undefined,
  isNull?: Boolean | null | undefined,
  like?: String | null | undefined,
  lt?: Int | null | undefined,
  lte?: Int | null | undefined,
  ne?: Int | null | undefined,
  notIlike?: String | null | undefined,
  notIn?: Int[] | undefined,
  notLike?: String | null | undefined    
};
		
export type Inventorycheck = {
  checkedBy: String | null,
  checkedByUser: (p?: {
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User | null,
  completedAt: DateTime | null,
  container: (p?: {
    orderBy?: ContainerOrderInputArgument | null | undefined,
    where?: ContainerWhereInputArgument | null | undefined
  }) => Container,
  containerId: ID,
  createdAt: DateTime,
  id: ID,
  items: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: InventorycheckitemOrderInputArgument | null | undefined,
    where?: InventorycheckitemWhereInputArgument | null | undefined
  }) => Inventorycheckitem[],
  session: (p?: {
    orderBy?: InventorysessionOrderInputArgument | null | undefined,
    where?: InventorysessionWhereInputArgument | null | undefined
  }) => Inventorysession,
  sessionId: ID,
  startedAt: DateTime | null,
  status: CheckstatusEnum,
  updatedAt: DateTime | null    
};
		
export type InventorycheckOrderInputArgument = {
  checkedBy?: SortingParameter | null | undefined,
  checkedByUser?: UserOrderInputArgument | null | undefined,
  completedAt?: SortingParameter | null | undefined,
  container?: ContainerOrderInputArgument | null | undefined,
  containerId?: SortingParameter | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  items?: InventorycheckitemOrderInputArgument | null | undefined,
  session?: InventorysessionOrderInputArgument | null | undefined,
  sessionId?: SortingParameter | null | undefined,
  startedAt?: SortingParameter | null | undefined,
  status?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type InventorycheckWhereInputArgument = {
  checkedBy?: StringWhereInputArgument | null | undefined,
  checkedByUser?: UserWhereInputArgument | null | undefined,
  completedAt?: DateWhereInputArgument | null | undefined,
  container?: ContainerWhereInputArgument | null | undefined,
  containerId?: ID | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  items?: InventorycheckitemWhereInputArgument | null | undefined,
  session?: InventorysessionWhereInputArgument | null | undefined,
  sessionId?: ID | null | undefined,
  startedAt?: DateWhereInputArgument | null | undefined,
  status?: CheckstatusEnum | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type Inventorycheckitem = {
  check: (p?: {
    orderBy?: InventorycheckOrderInputArgument | null | undefined,
    where?: InventorycheckWhereInputArgument | null | undefined
  }) => Inventorycheck,
  checkId: ID,
  createdAt: DateTime,
  found: Boolean,
  id: ID,
  item: (p?: {
    orderBy?: ItemOrderInputArgument | null | undefined,
    where?: ItemWhereInputArgument | null | undefined
  }) => Item,
  itemId: ID,
  movedToContainerId: ID | null,
  notes: String | null,
  updatedAt: DateTime | null    
};
		
export type InventorycheckitemOrderInputArgument = {
  check?: InventorycheckOrderInputArgument | null | undefined,
  checkId?: SortingParameter | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  found?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  item?: ItemOrderInputArgument | null | undefined,
  itemId?: SortingParameter | null | undefined,
  movedToContainerId?: SortingParameter | null | undefined,
  notes?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type InventorycheckitemWhereInputArgument = {
  check?: InventorycheckWhereInputArgument | null | undefined,
  checkId?: ID | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  found?: Boolean | null | undefined,
  id?: ID | null | undefined,
  item?: ItemWhereInputArgument | null | undefined,
  itemId?: ID | null | undefined,
  movedToContainerId?: ID | null | undefined,
  notes?: StringWhereInputArgument | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type Inventorysession = {
  checks: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: InventorycheckOrderInputArgument | null | undefined,
    where?: InventorycheckWhereInputArgument | null | undefined
  }) => Inventorycheck[],
  createdAt: DateTime,
  createdBy: String | null,
  createdByUser: (p?: {
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User | null,
  endDate: DateTime | null,
  id: ID,
  name: String,
  startDate: DateTime,
  status: SessionstatusEnum,
  updatedAt: DateTime | null    
};
		
export type InventorysessionOrderInputArgument = {
  checks?: InventorycheckOrderInputArgument | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  createdBy?: SortingParameter | null | undefined,
  createdByUser?: UserOrderInputArgument | null | undefined,
  endDate?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  name?: SortingParameter | null | undefined,
  startDate?: SortingParameter | null | undefined,
  status?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type InventorysessionWhereInputArgument = {
  checks?: InventorycheckWhereInputArgument | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  createdBy?: StringWhereInputArgument | null | undefined,
  createdByUser?: UserWhereInputArgument | null | undefined,
  endDate?: DateWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  name?: StringWhereInputArgument | null | undefined,
  startDate?: DateWhereInputArgument | null | undefined,
  status?: SessionstatusEnum | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type Item = {
  aliases: String[],
  comments: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: CommentOrderInputArgument | null | undefined,
    where?: CommentWhereInputArgument | null | undefined
  }) => Comment[],
  container: (p?: {
    orderBy?: ContainerOrderInputArgument | null | undefined,
    where?: ContainerWhereInputArgument | null | undefined
  }) => Container | null,
  containerId: ID | null,
  createdAt: DateTime,
  createdBy: String | null,
  createdByUser: (p?: {
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User | null,
  customId: ID | null,
  description: String | null,
  id: ID,
  isDamaged: Boolean,
  isMissing: Boolean,
  isTemporarilyMoved: Boolean,
  location: (p?: {
    orderBy?: LocationOrderInputArgument | null | undefined,
    where?: LocationWhereInputArgument | null | undefined
  }) => Location | null,
  locationDetail: String | null,
  locationId: ID | null,
  name: String,
  needsReview: Boolean,
  photo: String | null,
  qrCode: String | null,
  quantity: Int | null,
  serialNumber: String | null,
  temporaryLocation: String | null,
  type: (p?: {
    orderBy?: ItemtypeOrderInputArgument | null | undefined,
    where?: ItemtypeWhereInputArgument | null | undefined
  }) => Itemtype | null,
  typeId: ID | null,
  updatedAt: DateTime | null,
  updatedBy: String | null,
  value: Int | null    
};
		
export type ItemOrderInputArgument = {
  aliases?: SortingParameter | null | undefined,
  comments?: CommentOrderInputArgument | null | undefined,
  container?: ContainerOrderInputArgument | null | undefined,
  containerId?: SortingParameter | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  createdBy?: SortingParameter | null | undefined,
  createdByUser?: UserOrderInputArgument | null | undefined,
  customId?: SortingParameter | null | undefined,
  description?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  isDamaged?: SortingParameter | null | undefined,
  isMissing?: SortingParameter | null | undefined,
  isTemporarilyMoved?: SortingParameter | null | undefined,
  location?: LocationOrderInputArgument | null | undefined,
  locationDetail?: SortingParameter | null | undefined,
  locationId?: SortingParameter | null | undefined,
  name?: SortingParameter | null | undefined,
  needsReview?: SortingParameter | null | undefined,
  photo?: SortingParameter | null | undefined,
  qrCode?: SortingParameter | null | undefined,
  quantity?: SortingParameter | null | undefined,
  serialNumber?: SortingParameter | null | undefined,
  temporaryLocation?: SortingParameter | null | undefined,
  type?: ItemtypeOrderInputArgument | null | undefined,
  typeId?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined,
  updatedBy?: SortingParameter | null | undefined,
  value?: SortingParameter | null | undefined    
};
		
export type ItemWhereInputArgument = {
  aliases?: StringWhereInputArgument | null | undefined,
  comments?: CommentWhereInputArgument | null | undefined,
  container?: ContainerWhereInputArgument | null | undefined,
  containerId?: ID | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  createdBy?: StringWhereInputArgument | null | undefined,
  createdByUser?: UserWhereInputArgument | null | undefined,
  customId?: ID | null | undefined,
  description?: StringWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  isDamaged?: Boolean | null | undefined,
  isMissing?: Boolean | null | undefined,
  isTemporarilyMoved?: Boolean | null | undefined,
  location?: LocationWhereInputArgument | null | undefined,
  locationDetail?: StringWhereInputArgument | null | undefined,
  locationId?: ID | null | undefined,
  name?: StringWhereInputArgument | null | undefined,
  needsReview?: Boolean | null | undefined,
  photo?: StringWhereInputArgument | null | undefined,
  qrCode?: StringWhereInputArgument | null | undefined,
  quantity?: IntWhereInputArgument | null | undefined,
  serialNumber?: StringWhereInputArgument | null | undefined,
  temporaryLocation?: StringWhereInputArgument | null | undefined,
  type?: ItemtypeWhereInputArgument | null | undefined,
  typeId?: ID | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined,
  updatedBy?: StringWhereInputArgument | null | undefined,
  value?: IntWhereInputArgument | null | undefined    
};
		
export type Itemtype = {
  createdAt: DateTime,
  createdBy: String | null,
  description: String | null,
  id: ID,
  items: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ItemOrderInputArgument | null | undefined,
    where?: ItemWhereInputArgument | null | undefined
  }) => Item[],
  name: String,
  updatedAt: DateTime | null    
};
		
export type ItemtypeOrderInputArgument = {
  createdAt?: SortingParameter | null | undefined,
  createdBy?: SortingParameter | null | undefined,
  description?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  items?: ItemOrderInputArgument | null | undefined,
  name?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type ItemtypeWhereInputArgument = {
  createdAt?: DateWhereInputArgument | null | undefined,
  createdBy?: StringWhereInputArgument | null | undefined,
  description?: StringWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  items?: ItemWhereInputArgument | null | undefined,
  name?: StringWhereInputArgument | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type JSON = any;
		
export type Location = {
  containers: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ContainerOrderInputArgument | null | undefined,
    where?: ContainerWhereInputArgument | null | undefined
  }) => Container[],
  createdAt: DateTime,
  description: String | null,
  directItems: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ItemOrderInputArgument | null | undefined,
    where?: ItemWhereInputArgument | null | undefined
  }) => Item[],
  id: ID,
  name: String,
  updatedAt: DateTime | null    
};
		
export type LocationOrderInputArgument = {
  containers?: ContainerOrderInputArgument | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  description?: SortingParameter | null | undefined,
  directItems?: ItemOrderInputArgument | null | undefined,
  id?: SortingParameter | null | undefined,
  name?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type LocationWhereInputArgument = {
  containers?: ContainerWhereInputArgument | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  description?: StringWhereInputArgument | null | undefined,
  directItems?: ItemWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  name?: StringWhereInputArgument | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export type Mutation = {
  checkFlag: (p: {
    condition?: unknown | null | undefined,
    flagId: ID,
    found: Boolean,
    notes?: String | null | undefined,
    sessionId: ID
  }) => Flagcheck,
  checkInventoryItem: (p: {
    checkId: ID,
    found: Boolean,
    itemId: ID,
    movedToContainerId?: ID | null | undefined,
    notes?: String | null | undefined
  }) => Inventorycheckitem,
  completeInventoryCheck: (p: {
    id: ID
  }) => Inventorycheck,
  createComment: (p: {
    containerId?: ID | null | undefined,
    itemId?: ID | null | undefined,
    parentId?: ID | null | undefined,
    text: String
  }) => Comment,
  createContainer: (p?: {
    customId?: String | null | undefined,
    description?: String | null | undefined,
    isTemporarilyMoved?: Boolean | null | undefined,
    label?: String | null | undefined,
    locationDetail?: String | null | undefined,
    locationId?: ID | null | undefined,
    qrCode?: String | null | undefined,
    temporaryLocation?: String | null | undefined,
    typeId?: ID | null | undefined
  }) => Container,
  createContainerType: (p: {
    description?: String | null | undefined,
    name: String
  }) => Containertype,
  createFlag: (p: {
    containerId?: ID | null | undefined,
    countryCode: String,
    countryName: String,
    notes?: String | null | undefined,
    quantity?: Int | null | undefined
  }) => Flag,
  createFlagInventorySession: (p: {
    name: String
  }) => Flaginventorysession,
  createInventoryCheck: (p: {
    containerId: ID,
    sessionId: ID
  }) => Inventorycheck,
  createInventorySession: (p: {
    name: String
  }) => Inventorysession,
  createItem: (p: {
    aliases?: unknown | null | undefined,
    containerId?: ID | null | undefined,
    customId?: String | null | undefined,
    description?: String | null | undefined,
    isDamaged?: Boolean | null | undefined,
    isMissing?: Boolean | null | undefined,
    isTemporarilyMoved?: Boolean | null | undefined,
    locationDetail?: String | null | undefined,
    locationId?: ID | null | undefined,
    name: String,
    needsReview?: Boolean | null | undefined,
    photo?: String | null | undefined,
    qrCode?: String | null | undefined,
    quantity?: Int | null | undefined,
    serialNumber?: String | null | undefined,
    temporaryLocation?: String | null | undefined,
    typeId?: ID | null | undefined,
    value?: Int | null | undefined
  }) => Item,
  createItemType: (p: {
    description?: String | null | undefined,
    name: String
  }) => Itemtype,
  createLocation: (p: {
    description?: String | null | undefined,
    name: String
  }) => Location,
  deleteComment: Boolean,
  deleteContainer: Boolean,
  deleteContainerType: Boolean,
  deleteFlag: Boolean,
  deleteItem: Boolean,
  deleteItemType: Boolean,
  deleteLocation: Boolean,
  resolveComment: Boolean,
  unresolveComment: Boolean,
  updateComment: (p: {
    id: ID,
    text: String
  }) => Comment,
  updateContainer: (p: {
    customId?: String | null | undefined,
    description?: String | null | undefined,
    id: ID,
    isTemporarilyMoved?: Boolean | null | undefined,
    label?: String | null | undefined,
    locationDetail?: String | null | undefined,
    locationId?: ID | null | undefined,
    qrCode?: String | null | undefined,
    temporaryLocation?: String | null | undefined,
    typeId?: ID | null | undefined
  }) => Container,
  updateContainerType: (p: {
    description?: String | null | undefined,
    id: ID,
    name?: String | null | undefined
  }) => Containertype,
  updateFlag: (p: {
    containerId?: ID | null | undefined,
    countryCode?: String | null | undefined,
    countryName?: String | null | undefined,
    id: ID,
    notes?: String | null | undefined,
    quantity?: Int | null | undefined
  }) => Flag,
  updateFlagCheck: (p: {
    condition?: unknown | null | undefined,
    found?: Boolean | null | undefined,
    id: ID,
    notes?: String | null | undefined
  }) => Flagcheck,
  updateFlagInventorySessionStatus: (p: {
    id: ID,
    status: String
  }) => Flaginventorysession,
  updateInventoryCheckItem: (p: {
    found?: Boolean | null | undefined,
    id: ID,
    movedToContainerId?: ID | null | undefined,
    notes?: String | null | undefined
  }) => Inventorycheckitem,
  updateInventorySessionStatus: (p: {
    id: ID,
    status: String
  }) => Inventorysession,
  updateItem: (p: {
    aliases?: unknown | null | undefined,
    containerId?: ID | null | undefined,
    customId?: String | null | undefined,
    description?: String | null | undefined,
    id: ID,
    isDamaged?: Boolean | null | undefined,
    isMissing?: Boolean | null | undefined,
    isTemporarilyMoved?: Boolean | null | undefined,
    locationDetail?: String | null | undefined,
    locationId?: ID | null | undefined,
    name?: String | null | undefined,
    needsReview?: Boolean | null | undefined,
    photo?: String | null | undefined,
    qrCode?: String | null | undefined,
    quantity?: Int | null | undefined,
    serialNumber?: String | null | undefined,
    temporaryLocation?: String | null | undefined,
    typeId?: ID | null | undefined,
    value?: Int | null | undefined
  }) => Item,
  updateItemType: (p: {
    description?: String | null | undefined,
    id: ID,
    name?: String | null | undefined
  }) => Itemtype,
  updateLocation: (p: {
    description?: String | null | undefined,
    id: ID,
    name?: String | null | undefined
  }) => Location    
};
		
export type Query = {
  auditLog: (p: {
    id: ID
  }) => Auditlog,
  auditLogs: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: AuditlogOrderInputArgument | null | undefined,
    where?: AuditlogWhereInputArgument | null | undefined
  }) => Auditlog[],
  comment: (p: {
    id: ID
  }) => Comment,
  comments: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: CommentOrderInputArgument | null | undefined,
    where?: CommentWhereInputArgument | null | undefined
  }) => Comment[],
  container: (p: {
    id: ID
  }) => Container,
  containerByCustomId: String | null,
  containerType: (p: {
    id: ID
  }) => Containertype,
  containerTypes: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ContainertypeOrderInputArgument | null | undefined,
    where?: ContainertypeWhereInputArgument | null | undefined
  }) => Containertype[],
  containers: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ContainerOrderInputArgument | null | undefined,
    where?: ContainerWhereInputArgument | null | undefined
  }) => Container[],
  flag: (p: {
    id: ID
  }) => Flag,
  flagCheck: (p: {
    id: ID
  }) => Flagcheck,
  flagChecks: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: FlagcheckOrderInputArgument | null | undefined,
    where?: FlagcheckWhereInputArgument | null | undefined
  }) => Flagcheck[],
  flagInventorySession: (p: {
    id: ID
  }) => Flaginventorysession,
  flagInventorySessions: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: FlaginventorysessionOrderInputArgument | null | undefined,
    where?: FlaginventorysessionWhereInputArgument | null | undefined
  }) => Flaginventorysession[],
  flags: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: FlagOrderInputArgument | null | undefined,
    where?: FlagWhereInputArgument | null | undefined
  }) => Flag[],
  inventoryCheck: (p: {
    id: ID
  }) => Inventorycheck,
  inventoryCheckItem: (p: {
    id: ID
  }) => Inventorycheckitem,
  inventoryCheckItems: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: InventorycheckitemOrderInputArgument | null | undefined,
    where?: InventorycheckitemWhereInputArgument | null | undefined
  }) => Inventorycheckitem[],
  inventoryChecks: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: InventorycheckOrderInputArgument | null | undefined,
    where?: InventorycheckWhereInputArgument | null | undefined
  }) => Inventorycheck[],
  inventorySession: (p: {
    id: ID
  }) => Inventorysession,
  inventorySessions: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: InventorysessionOrderInputArgument | null | undefined,
    where?: InventorysessionWhereInputArgument | null | undefined
  }) => Inventorysession[],
  item: (p: {
    id: ID
  }) => Item,
  itemByCustomId: String | null,
  itemType: (p: {
    id: ID
  }) => Itemtype,
  itemTypes: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ItemtypeOrderInputArgument | null | undefined,
    where?: ItemtypeWhereInputArgument | null | undefined
  }) => Itemtype[],
  items: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ItemOrderInputArgument | null | undefined,
    where?: ItemWhereInputArgument | null | undefined
  }) => Item[],
  location: (p: {
    id: ID
  }) => Location,
  locations: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: LocationOrderInputArgument | null | undefined,
    where?: LocationWhereInputArgument | null | undefined
  }) => Location[],
  user: (p: {
    id: ID
  }) => User,
  users: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User[]    
};
		
export type SessionstatusEnum = "CANCELLED" | "COMPLETED" | "IN_PROGRESS" | "PLANNED";
		
export type SortingParameter = "asc" | "desc";
		
export type String = string;
		
export type StringWhereInputArgument = {
  AND?: StringWhereInputArgument[] | undefined,
  NOT?: StringWhereInputArgument | null | undefined,
  OR?: StringWhereInputArgument[] | undefined,
  arrayContained?: String[] | undefined,
  arrayContains?: String[] | undefined,
  arrayOverlaps?: String[] | undefined,
  eq?: String | null | undefined,
  gt?: String | null | undefined,
  gte?: String | null | undefined,
  ilike?: String | null | undefined,
  in?: String[] | undefined,
  isNotNull?: Boolean | null | undefined,
  isNull?: Boolean | null | undefined,
  like?: String | null | undefined,
  lt?: String | null | undefined,
  lte?: String | null | undefined,
  ne?: String | null | undefined,
  notIlike?: String | null | undefined,
  notIn?: String[] | undefined,
  notLike?: String | null | undefined    
};
		
export type Subscription = {
  auditLog: (p: {
    id: ID
  }) => Auditlog,
  auditLogs: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: AuditlogOrderInputArgument | null | undefined,
    where?: AuditlogWhereInputArgument | null | undefined
  }) => Auditlog[],
  comment: (p: {
    id: ID
  }) => Comment,
  comments: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: CommentOrderInputArgument | null | undefined,
    where?: CommentWhereInputArgument | null | undefined
  }) => Comment[],
  container: (p: {
    id: ID
  }) => Container,
  containerType: (p: {
    id: ID
  }) => Containertype,
  containerTypes: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ContainertypeOrderInputArgument | null | undefined,
    where?: ContainertypeWhereInputArgument | null | undefined
  }) => Containertype[],
  containers: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ContainerOrderInputArgument | null | undefined,
    where?: ContainerWhereInputArgument | null | undefined
  }) => Container[],
  flag: (p: {
    id: ID
  }) => Flag,
  flagCheck: (p: {
    id: ID
  }) => Flagcheck,
  flagChecks: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: FlagcheckOrderInputArgument | null | undefined,
    where?: FlagcheckWhereInputArgument | null | undefined
  }) => Flagcheck[],
  flagInventorySession: (p: {
    id: ID
  }) => Flaginventorysession,
  flagInventorySessions: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: FlaginventorysessionOrderInputArgument | null | undefined,
    where?: FlaginventorysessionWhereInputArgument | null | undefined
  }) => Flaginventorysession[],
  flags: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: FlagOrderInputArgument | null | undefined,
    where?: FlagWhereInputArgument | null | undefined
  }) => Flag[],
  inventoryCheck: (p: {
    id: ID
  }) => Inventorycheck,
  inventoryCheckItem: (p: {
    id: ID
  }) => Inventorycheckitem,
  inventoryCheckItems: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: InventorycheckitemOrderInputArgument | null | undefined,
    where?: InventorycheckitemWhereInputArgument | null | undefined
  }) => Inventorycheckitem[],
  inventoryChecks: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: InventorycheckOrderInputArgument | null | undefined,
    where?: InventorycheckWhereInputArgument | null | undefined
  }) => Inventorycheck[],
  inventorySession: (p: {
    id: ID
  }) => Inventorysession,
  inventorySessions: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: InventorysessionOrderInputArgument | null | undefined,
    where?: InventorysessionWhereInputArgument | null | undefined
  }) => Inventorysession[],
  item: (p: {
    id: ID
  }) => Item,
  itemType: (p: {
    id: ID
  }) => Itemtype,
  itemTypes: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ItemtypeOrderInputArgument | null | undefined,
    where?: ItemtypeWhereInputArgument | null | undefined
  }) => Itemtype[],
  items: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ItemOrderInputArgument | null | undefined,
    where?: ItemWhereInputArgument | null | undefined
  }) => Item[],
  location: (p: {
    id: ID
  }) => Location,
  locations: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: LocationOrderInputArgument | null | undefined,
    where?: LocationWhereInputArgument | null | undefined
  }) => Location[],
  user: (p: {
    id: ID
  }) => User,
  users: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: UserOrderInputArgument | null | undefined,
    where?: UserWhereInputArgument | null | undefined
  }) => User[]    
};
		
export type User = {
  comments: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: CommentOrderInputArgument | null | undefined,
    where?: CommentWhereInputArgument | null | undefined
  }) => Comment[],
  createdAt: DateTime,
  createdItems: (p?: {
    limit?: Int | null | undefined,
    offset?: Int | null | undefined,
    orderBy?: ItemOrderInputArgument | null | undefined,
    where?: ItemWhereInputArgument | null | undefined
  }) => Item[],
  email: String,
  familyName: String,
  givenName: String,
  id: ID,
  locale: String | null,
  preferredUsername: String,
  updatedAt: DateTime | null    
};
		
export type UserOrderInputArgument = {
  comments?: CommentOrderInputArgument | null | undefined,
  createdAt?: SortingParameter | null | undefined,
  createdItems?: ItemOrderInputArgument | null | undefined,
  email?: SortingParameter | null | undefined,
  familyName?: SortingParameter | null | undefined,
  givenName?: SortingParameter | null | undefined,
  id?: SortingParameter | null | undefined,
  locale?: SortingParameter | null | undefined,
  preferredUsername?: SortingParameter | null | undefined,
  updatedAt?: SortingParameter | null | undefined    
};
		
export type UserWhereInputArgument = {
  comments?: CommentWhereInputArgument | null | undefined,
  createdAt?: DateWhereInputArgument | null | undefined,
  createdItems?: ItemWhereInputArgument | null | undefined,
  email?: StringWhereInputArgument | null | undefined,
  familyName?: StringWhereInputArgument | null | undefined,
  givenName?: StringWhereInputArgument | null | undefined,
  id?: ID | null | undefined,
  locale?: StringWhereInputArgument | null | undefined,
  preferredUsername?: StringWhereInputArgument | null | undefined,
  updatedAt?: DateWhereInputArgument | null | undefined    
};
		
export const defaultOptions: ConstructorParameters<Client>[0] = {
  url: "/api/graphql",
  fetchSubscriptions: true,
  exchanges: [cacheExchange({ schema }), nativeDateExchange, fetchExchange],
  fetchOptions: {
    credentials: "include",
  },
  requestPolicy: "cache-and-network",
}

const urqlClient = new Client(defaultOptions);

export const client = {
  /**
   * A query and subscription combination. First queries and if exists, also subscribes to a subscription of the same name.
   * Combines the results of both, so the result is first the query result and then live updates from the subscription.
   * Assumes that the query and subscription return the same fields as per default when using the rumble query helpers.
   * If no subscription with the same name exists, this will just be a query.
   *
   * Internally, this does some magic to make the data reactive with Svelte's reactivity system. But it can be used with other frameworks as well.
   */
  liveQuery: makeLiveQuery<Query, true>({
	  urqlClient,
	  availableSubscriptions: new Set(["auditLog", "auditLogs", "comment", "comments", "container", "containerType", "containerTypes", "containers", "flag", "flagCheck", "flagChecks", "flagInventorySession", "flagInventorySessions", "flags", "inventoryCheck", "inventoryCheckItem", "inventoryCheckItems", "inventoryChecks", "inventorySession", "inventorySessions", "item", "itemType", "itemTypes", "items", "location", "locations", "user", "users"]),
		schema,
    forceReactivity: true
  }),
  /**
   * A mutation that can be used to e.g. create, update or delete data.
   */
  mutate: makeMutation<Mutation>({
	  urqlClient,
		schema,
  }),
  /**
   * A continuous stream of results that updates when the server sends new data.
   */
  subscribe: makeSubscription<Subscription>({
	  urqlClient,
		schema,
  }),
  /**
   * A one-time fetch of data.
   */
  query: makeQuery<Query, true>({
	  urqlClient,
		schema,
    forceReactivity: true
  }),
}