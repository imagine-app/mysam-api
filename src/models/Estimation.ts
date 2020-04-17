import { VehicleType } from "./VehicleType";

export type Estimation = {
  id: number
  created: Date;
  distance: number;
  duration: number;
  isPriceIncreased: boolean;
  price: number;
  startDate: Date;
  tripType: string;
  vehicleType: VehicleType;
}

export function fromJSON(estimation: Estimation): Estimation {
  estimation.startDate = new Date(estimation.startDate)
  return estimation
}
