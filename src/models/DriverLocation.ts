import { Coordinate } from "./Coordinate"

export type DriverLocation = Coordinate & {
  locationDate: Date
}

export function fromJSON(driverLocation: DriverLocation): DriverLocation {
  driverLocation.locationDate = new Date(driverLocation.locationDate)
  return driverLocation
}
