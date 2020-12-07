import {
  BinaryData as BData, DataLengths as DLengths, UUID, Vector3,
} from '@strdst/utils.binary'
import { CompoundTag, IntTag } from '@strdst/utils.nbt'
import { ItemRuntimes } from './data/ItemRuntimes'
import { Metadata } from './Metadata'
import { IChunk, IExperiments, IItem, ISubChunk, ItemIsDurable, MAGIC, MetadataType, Namespaced, SkinData, SkinImage, TileIsSpawnable, TileTag } from './types'

export const DataLengthsMc = {
  ...DLengths,
  SECURITY: 2,
  MAGIC: 16,
}

export class BinaryData extends BData {

  public writeMagic(): void {
    const buf = Buffer.from(MAGIC, 'binary')

    this.append(buf)
  }

  public readMagic(): (typeof MAGIC) {
    const buf = this.buf.slice(this.pos, this.pos + 16)
    this.pos += DataLengthsMc.MAGIC

    return buf.toString('binary') as (typeof MAGIC)
  }

  public readSecuity(): void {
    this.pos += DataLengthsMc.SECURITY
  }

  public writeContainerItem(item: IItem): void {
    this.writeVarInt(ItemRuntimes.getRID(item.nid))
    if(item.nid === Namespaced.AIR) return

    const auxValue = ((item.meta & 0x7fff) << 8) | item.count
    this.writeVarInt(auxValue)

    let tag = item.nbt ? item.nbt.clone() : null

    if(item[ItemIsDurable] && item.damage > 0) {
      if(tag) {
        const existing = tag.get('Damage')

        if(existing) {
          tag.add(new IntTag().assign('___Damage_ProtocolCollisionResolution___', existing.value))
        }
      } else {
        tag = new CompoundTag()
      }

      tag.add(new IntTag().assign('Damage', item.damage))
    }

    if(tag) {
      this.writeLShort(0xffff)
      this.writeByte(1)
      this.writeTag(tag)
    } else {
      this.writeLShort(0)
    }

    this.writeVarInt(0) // CanPlaceOn
    this.writeVarInt(0) // CanDestroy

    if(item.nid === Namespaced.SHIELD) {
      this.writeVarLong(0n) // blocking tick
    }
  }

  public readContainerItem(): IItem {
    const rid = this.readVarInt()

    const item: IItem = {
      nid: ItemRuntimes.getNID(rid),
      rid,
      meta: 0,
      count: 1,
      [ItemIsDurable]: false,
      damage: 0,
    }

    if(item.nid === Namespaced.AIR) return item

    const auxValue = this.readVarInt()
    item.meta = auxValue >> 8
    item.count = auxValue & 0xff

    if(this.readLShort() === -1) {
      const nbtVersion = this.readByte()

      item.nbt = this.readTag<CompoundTag>(nbtVersion)
    }

    for(let i = 0, c = this.readVarInt(); i < c; i++) {
      this.readString() // CanPlaceOn
    }

    for(let i = 0, c = this.readVarInt(); i < c; i++) {
      this.readString() // CanDestroy
    }

    if(item.nid === Namespaced.SHIELD) {
      this.readVarLong() // blocking tick
    }

    return item
  }

  public writeEntityMetadata(metadata: Metadata): void {
    this.writeUnsignedVarInt(metadata.size)

    for(const { flag, type, value } of metadata.all()) {
      this.writeUnsignedVarInt(flag)
      this.writeUnsignedVarInt(type)
      switch(type) {
        case MetadataType.BYTE:
          this.writeByte(value)
          break
        case MetadataType.FLOAT:
          this.writeFloat(value)
          break
        case MetadataType.LONG:
          this.writeVarLong(value)
          break
        case MetadataType.STRING:
          this.writeString(value)
          break
        case MetadataType.SHORT:
          this.writeSignedLShort(value)
          break
        default:
          throw new Error(`Unknown MetadataType: ${type}`)
      }
    }
  }

  public readEntityMetadata(): Metadata {
    const metadata = new Metadata()

    const count = this.readUnsignedVarInt()
    for(let i = 0; i < count; i++) {
      const flag = this.readUnsignedVarInt()
      const type = this.readUnsignedVarInt()

      switch(type) {
        case MetadataType.BYTE:
          metadata.add(flag, type, this.readByte())
          break
        case MetadataType.FLOAT:
          metadata.add(flag, type, this.readLFloat())
          break
        case MetadataType.LONG:
          metadata.add(flag, type, this.readVarLong())
          break
        case MetadataType.STRING:
          metadata.add(flag, type, this.readString())
          break
        case MetadataType.SHORT:
          metadata.add(flag, type, this.readSignedLShort())
          break
        default:
          throw new Error(`Unknown MetadataType: ${type}`)
      }
    }

    return metadata
  }

  public writeSkinImage(image: SkinImage): void {
    this.writeLInt(image.width)
    this.writeLInt(image.height)
    // this.writeString(image.data)
    this.appendWithLength(image.data)
  }

  public writeSkin(skin: SkinData): void {
    this.writeString(skin.id)
    // this.writeString(skin.resourcePatch)
    this.appendWithLength(skin.resourcePatch)
    this.writeSkinImage(skin.image)
    this.writeLInt(skin.animations.length)
    for(const animation of skin.animations) {
      this.writeSkinImage(animation.image)
      this.writeLInt(animation.type)
      this.writeFloat(animation.frames)
      this.writeLInt(animation.expression)
    }
    this.writeSkinImage(skin.cape.image)
    // this.writeString(skin.geometryData)
    this.appendWithLength(skin.geometryData)
    // this.writeString(skin.animationData)
    this.appendWithLength(skin.animationData)
    this.writeBoolean(skin.premium)
    this.writeBoolean(skin.persona)
    this.writeBoolean(skin.personaCapeOnClassic)
    this.writeString(skin.cape.id)
    this.writeString(UUID.randomStr())
    this.writeString(skin.armSize)
    this.writeString(skin.color)
    this.writeLInt(skin.personaPieces.length)
    for(const piece of skin.personaPieces) {
      this.writeString(piece.id)
      this.writeString(piece.type)
      this.writeString(piece.packId)
      this.writeBoolean(piece.defaultPiece)
      this.writeString(piece.productId)
    }
    this.writeLInt(skin.personaPieceTints.length)
    for(const tint of skin.personaPieceTints) {
      this.writeString(tint.type)
      this.writeLInt(tint.colors.length)
      for(const color of tint.colors) {
        this.writeString(color)
      }
    }
  }

  public subChunkEmpty(subChunk: ISubChunk): boolean {
    return subChunk.blockIds.every(v => v === 0) &&
      subChunk.skyLightData.every(v => v === 255) &&
      subChunk.blockLightData.every(v => v === 0)
  }

  public getLastNonEmtptySubChunk(chunk: IChunk): number {
    for(let y = chunk.subChunks.length - 1; y >= 0; y--) {
      if(this.subChunkEmpty(chunk.subChunks[y])) continue

      return y
    }

    return -1
  }

  public writeChunkData(chunk: IChunk): void {
    const data = new BinaryData()

    const nonEmptyCount = this.getLastNonEmtptySubChunk(chunk) + 1
    for(let y = 0; y < nonEmptyCount; y++) {
      const subChunk = chunk.subChunks[y]

      data.writeByte(0) // Anvil version
      data.append(new Uint8Array(subChunk.blockIds))
      data.append(new Uint8Array(subChunk.metadata))
    }

    data.append(new Uint8Array(chunk.biomeData))
    data.writeByte(0) // Border block count - unused

    this.writeUnsignedVarInt(data.length)
    this.append(data)

    for(const tile of chunk.tiles) {
      if(tile[TileIsSpawnable]) {
        this.writeTag(tile.tag)
      }
    }
  }

  public readChunkData(chunk: IChunk, numSubChunks: number): void {
    for(let y = 0; y < numSubChunks; y++) {
      const version = this.readByte()

      if(version === 0) {
        chunk.subChunks[y] = {
          blockIds: Array.from(this.read(4096)),
          metadata: Array.from(this.read(2048)),
          skyLightData: [],
          blockLightData: [],
        }
      } else {
        throw new Error(`Unsupported Anvil version: ${version}`)
      }
    }

    chunk.biomeData = Array.from(this.read(256))
    this.readByte() // Border block count - unused

    while(!this.feof) {
      const tag = this.readTag<TileTag>()
      chunk.tiles.push({
        [TileIsSpawnable]: true,
        nid: tag.val('id'),
        pos: new Vector3(tag.val('x'), tag.val('y'), tag.val('z')),
        tag,
      })
    }
  }

  public writeExperiments(container: IExperiments): void {
    this.writeLInt(container.experiments.length)
    for(const { name, enabled } of container.experiments) {
      this.writeString(name)
      this.writeBoolean(enabled)
    }

    this.writeBoolean(container.previouslyEnabled)
  }

  public readExperiments(): IExperiments {
    const count = this.readLInt()
    const container: IExperiments = {
      experiments: [],
      previouslyEnabled: false,
    }
    for(let i = 0; i < count; i++) {
      container.experiments.push({
        name: this.readString(),
        enabled: this.readBoolean()
      })
    }

    container.previouslyEnabled = this.readBoolean()

    return container
  }

}
