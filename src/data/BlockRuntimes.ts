import mapping from './block_mapping.json'

export class BlockRuntimes {

  public static getNID(rid: number): string {
    const map = mapping.toNamespaced[rid]

    if(!map) throw new Error(`Couldn't find NID for RID: ${rid}`)

    return map.nid
  }

  public static getRIDs(nid: string): number[] {
    return (mapping.toRuntime as any)[nid.toLowerCase()] || []
  }

  public static getRID(nid: string, meta = 0): number {
    let rids = BlockRuntimes.getRIDs(nid)
    let rid = rids[meta]

    // Default to meta=0 if we can't find the correct RID for the current meta
    if(typeof rid === 'undefined' && meta !== 0) rid = rids[0]

    return rid
  }

}
