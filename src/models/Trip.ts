import { Client, fromJSON as clientfromJSON } from "./Client"
import { Driver } from "./Driver"
import { Address } from "./Address"

export type TripStatus = Status["status"]
//  "WAITING" | "ASSIGNED" | "STARTED" | "CANCELED" | "FINISHED" | "PAYMENT_ISSUE" | "SOURCE_AUTHORIZATION" | "THREE_D_SECURE_PENDING" | "NO_DRIVER_AVAILABLE"

export type Trip = {
  id: number
  client: Client
  fromAddress: Address
  toAddress: Address
  startDate: Date
} &
  // the current satus + status-dependant fields
  Status &
  // the info on price (both actual and estimated)
  PricingInfo

type PricingInfo = {
  estimatedPrice: number
  eurosDiscountedPrice?: number,
}

type Status =
  | {
    status: "WAITING"
  }
  | {
    status: "NO_DRIVER_AVAILABLE",
    endDate: Date
  }
  | {
    status: "ASSIGNED" | "STARTED"
    driver: Driver
  }
  | {
    status: "CANCELED" | "FINISHED" // | PaymentStatus
    driver: Driver
    endDate: Date
  }

// not relevant anymore 
// type PaymentStatus = "PAYMENT_ISSUE" | "SOURCE_AUTHORIZATION" | "THREE_D_SECURE_PENDING"

export function fromJSON(trip: Trip): Trip {
  trip.client = clientfromJSON(trip.client)
  trip.startDate = new Date(trip.startDate)

  // optional end date !
  const tripWithEndDate = trip as { endDate?: Date }
  if ((tripWithEndDate).endDate) (tripWithEndDate).endDate = new Date((tripWithEndDate).endDate)

  return trip
}
