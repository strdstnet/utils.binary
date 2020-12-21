import mapping from './item_mapping.json'

export class ItemRuntimes {

  public static toRuntime = mapping.toRuntime
  public static toNamespaced = mapping.toNamespaced

  public static getNID(rid: number): string {
    const map = mapping.toNamespaced[rid]

    if(!map) throw new Error(`Couldn't find NID for RID: ${rid}`)

    return map
  }

  public static getRID(nid: string): number {
    return (mapping.toRuntime as any)[nid]
  }

}
