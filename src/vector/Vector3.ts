import { Vector2 } from './Vector2'

export class Vector3 extends Vector2 {

  constructor(
    x: number,
    public y: number,
    z: number
  ) {
    super(x, z)
  }

}
