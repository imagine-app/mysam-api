import { Address } from "./Address";

export interface FlatFee {
  id: number;
  fromAddress: Address;
  toAddress: Address;
  zdPrice: number;
}