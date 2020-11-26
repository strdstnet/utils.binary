import { CompoundTag } from '@strdst/utils.nbt'

export const MAGIC = '\x00\xff\xff\x00\xfe\xfe\xfe\xfe\xfd\xfd\xfd\xfd\x12\x34\x56\x78'

export const ItemIsDurable = Symbol('is durable')

export interface IItem {
  [ItemIsDurable]: boolean,
  id: number,
  meta: number,
  count: number,
  nbt?: CompoundTag,
  damage: number,
}

/**
  @description This is not a full set of IDs but
    only those that are required for BinaryData methods
*/
export enum ItemIDs {
  AIR    = 0,
  SHIELD = 513,
}

export enum MetadataType {
  BYTE     = 0,
  SHORT    = 1,
  INT      = 2,
  FLOAT    = 3,
  STRING   = 4,
  ITEM     = 5,
  POSITION = 6,
  LONG     = 7,
  VECTOR   = 8,
}

export enum MetadataFlag {
  FLAGS                 = 0,
  HEALTH                = 1,
  VARIANT               = 2,
  COLOR                 = 3,
  NAMETAG               = 4,
  ENTITY_OWNER_ID       = 5,
  ENTITY_TARGET_ID      = 6,
  AIR                   = 7,
  BREATHING             = 35,
  ENTITY_LEAD_HOLDER_ID = 37,
  SCALE                 = 38,
  MAX_AIR               = 42,
  BOUNDING_BOX_WIDTH    = 53,
  BOUNDING_BOX_HEIGHT   = 54,
  FLAGS_EXTENDED        = 91,
}

export enum MetadataGeneric {
  ON_FIRE             = 0,
  SNEAKING            = 1,
  SPRINTING           = 3,
  IMMOBILE            = 16,
  CAN_FLY             = 21,
  HAS_COLLISION       = 47,
  AFFECTED_BY_GRAVITY = 48,
  SWIMMING            = 56,
  EATING              = 62
}
