import { Vector4 } from './Vector4'

export class Vector5 extends Vector4 {

  constructor(
    x: number,
    y: number,
    z: number,
    pitch: number,
    public yaw: number
  ) {
    super(x, y, z, pitch)
  }

}
