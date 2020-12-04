import { Vector3 } from '@strdst/utils.binary'
import { CompoundTag } from '@strdst/utils.nbt'

export const MAGIC = '\x00\xff\xff\x00\xfe\xfe\xfe\xfe\xfd\xfd\xfd\xfd\x12\x34\x56\x78'

export const ItemIsDurable = '__durable'

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
  AIR          = 0,
  UPDATE_BLOCK = 248,
  SHIELD       = 513,
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

export interface SkinImage {
  height: number,
  width: number,
  data: Buffer,
}

export enum SkinAnimationType {
  HEAD    = 1,
  BODY_32 = 2,
  BODY_64 = 3,
}

export interface SkinAnimation {
  image: SkinImage,
  type: SkinAnimationType,
  frames: number,
  expression: number,
}

export interface Cape {
  id: string,
  image: SkinImage,
}

export enum PersonaTintablePieceType {
  EYES  = 'persona_eyes',
  HAIR  = 'persona_hair',
  MOUTH = 'persona_mouth',
}

export enum PersonaPieceType {
  BODY        = 'persona_body',
  BOTTOM      = 'persona_bottom',
  EYES        = 'persona_eyes',
  FACIAL_HAIR = 'persona_facial_hair',
  FEET        = 'persona_feet',
  HAIR        = 'persona_hair',
  MOUTH       = 'persona_mouth',
  SKELETON    = 'persona_skeleton',
  SKIN        = 'persona_skin',
  TOP         = 'persona_top',
}

export interface PersonaPiece {
  id: string,
  type: PersonaPieceType,
  packId: string,
  defaultPiece: boolean,
  productId: string,
}

export interface PersonaPieceTint {
  type: PersonaTintablePieceType,
  colors: string[],
}

export interface SkinCape {
  id: string,
  image: SkinImage,
}

export interface SkinData {
  id: string,
  color: string,
  resourcePatch: Buffer,
  image: SkinImage,
  animations: SkinAnimation[],
  cape: SkinCape,
  geometryData: Buffer,
  animationData: Buffer,
  persona: boolean,
  premium: boolean,
  personaCapeOnClassic: boolean,
  armSize: string, // TODO: Parse into number?
  personaPieces: PersonaPiece[],
  personaPieceTints: PersonaPieceTint[],
  verified: boolean,
}

export const TileIsSpawnable = '__spawnable'

export interface ITile {
  [TileIsSpawnable]: boolean,
  id: number,
  nid: string,
  pos: Vector3,
}

export interface ISubChunk {
  metadata: number[],
  blockIds: number[],
  skyLightData: number[],
  blockLightData: number[],
}

export interface IChunk {
  x: number,
  z: number,
  subChunks: ISubChunk[],
  tiles: ITile[],
  biomeData: number[],
}
