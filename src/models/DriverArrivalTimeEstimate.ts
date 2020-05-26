import {
  DriverLocation,
  fromJSON as driverLocationFromJSON,
} from "./DriverLocation"
import { TripStatus } from "./Trip"

export type DriverArrivalTimeEstimate = {
  distance: number
  driverLocation: DriverLocation
  duration: number
  tripId: number
  tripStatus: TripStatus
}

export function fromJSON(
  driverArrivalTimeEstimate: DriverArrivalTimeEstimate,
): DriverArrivalTimeEstimate {
  driverArrivalTimeEstimate.driverLocation = driverLocationFromJSON(
    driverArrivalTimeEstimate.driverLocation,
  )
  return driverArrivalTimeEstimate
}
