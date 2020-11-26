import {
  BinaryData as BData, DataLengths as DLengths, UUID,
} from '@strdst/utils.binary'
import { CompoundTag, IntTag } from '@strdst/utils.nbt'
import { Metadata } from './Metadata'
import { IItem, ItemIDs, ItemIsDurable, MAGIC, MetadataType, SkinData, SkinImage } from './types'

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
    this.writeVarInt(item.id)
    if(item.id === ItemIDs.AIR) return

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

    if(item.id === ItemIDs.SHIELD) {
      this.writeVarLong(0n) // blocking tick
    }
  }

  public readContainerItem(): IItem {
    const item: IItem = {
      id: this.readVarInt(),
      meta: 0,
      count: 1,
      [ItemIsDurable]: false,
      damage: 0,
    }

    if(item.id === ItemIDs.AIR) return item

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

    if(item.id === ItemIDs.SHIELD) {
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

}
