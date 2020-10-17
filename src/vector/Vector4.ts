import { Vector3 } from './Vector3'

export class Vector4 extends Vector3 {

  constructor(
    x: number,
    y: number,
    z: number,
    public pitch: number
  ) {
    super(x, y, z)
  }

}
