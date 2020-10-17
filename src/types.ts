export enum DataLengthBigInt {
  LONG = 8,
}

export enum DataLengthNumber {
  BYTE = 1,
  SHORT = 2,
  L_SHORT = 2,
  L_TRIAD = 3,
  INT = 4,
  L_INT = 4,
  FLOAT = 4,
  DOUBLE = 8,
}

export const DataLengths = { ...DataLengthNumber, ...DataLengthBigInt }
export type DataLengths = typeof DataLengths

export interface IAddress {
  ip: string,
  port: number,
  family: AddressFamily,
}

export enum AddressFamily {
  IPV4 = 4,
  IPV6 = 6,
}
