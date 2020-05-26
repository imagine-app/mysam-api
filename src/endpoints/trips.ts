import { RESTClient } from "../client/RESTClient"
import { Trip, fromJSON } from "../models/Trip"
import { Address } from "../models/Address"
import { ListResult } from "../models/ListResult"
import MySAMError, { isMySAMError } from "../client/MySAMError"

export type SearchByDateParams = {
  startDate: Date
  endDate: Date
}

export type SearchOptions =
  | {
      filter: "all" | "mysam"
    }
  | {
      filter: "client"
      clientID: string
    }

export type CreateParams =
  // client + from/to addresses
  MandatoryParams &
    // how to pay: cash/in-app/deferred
    PaymentParams &
    // type of vehicle + num passengers (depends on type value)
    VehicleParams &
    // immediatre of schedules (+date) order
    TypeParams &
    // auto-assign OR force the driver
    AssignParams &
    // lots of additional info
    Partial<OptionalParams>

type MandatoryParams = {
  clientId?: string
  fromAddress: Address
  toAddress: Address
}

type PaymentParams =
  | {
      paymentMethod: "IN_APP" | "DEFERRED"
    }
  | {
      paymentMethod: "ON_BOARD"
      willBePaidInCash: boolean
    }

type VehicleParams =
  | {
      vehicleType: "CAR" | "LUXE"
      nbPassengers: 1 | 2 | 3 | 4
    }
  | {
      vehicleType: "VAN"
      nbPassengers: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    }

type TypeParams =
  | {
      type: "IMMEDIATE"
    }
  | {
      type: "RESERVATION"
      startDate: Date
    }

type AssignParams =
  | {
      autoAssignToDriver: false
      driverId: string
    }
  | {
      autoAssignToDriver: true
    }

type OptionalParams = {
  trainNumber: string
  zdForcedPrice: number
  shouldSendInEmailSummary: boolean
  startingFromAirport: boolean
  options: Options
  estimationId: number
  externalReference: string
  flatFeeMatrixId: number
  comment: string
  createdByAlfredUserId: string
  flightNumber: string
}

type Options = {
  animals?: "true"
  boosterSeat?: "true"
  carSeat?: "true"
  cumbersome?: "true"
  sign?: true
}

export default class TripsAPITrip {
  constructor(private client: RESTClient) {}

  async get(tripID: number) {
    const trip = await this.client.get<Trip>(`/trips/${tripID}`)
    return fromJSON(trip)
  }

  async cancel(tripID: number) {
    const trip = await this.client.put<Trip>(`/trips/${tripID}/cancel`)
    return fromJSON(trip)
  }

  estimateCancelationPrice(tripID: number) {
    return this.client.get<number>(`/trips/${tripID}/cancel/estimation`)
  }

  async createDiscount(tripID: number, createedPrice: number) {
    const trip = await this.client.put<Trip>(`/trips/${tripID}/create`, {
      zeroDecimalPriceAfterDiscount: createedPrice,
    })
    return fromJSON(trip)
  }

  async create(params: CreateParams) {
    const newTrip = await this.client.post<Trip>(`/trips/new`, params)
    return fromJSON(newTrip)
  }

  async search(
    params: SearchByDateParams,
    options: SearchOptions = { filter: "all" },
  ) {
    let trips: ListResult<Trip> = null
    switch (options.filter) {
      case "mysam":
        trips = await this.client.put<ListResult<Trip>>(
          `/trips/created-through-mysam`,
          params,
        )
        break
      case "all":
        trips = await this.client.post<ListResult<Trip>>(
          `/trips/summary`,
          params,
        )
        break
      case "client":
        trips = await this.client.post<ListResult<Trip>>(
          `/trips/summary/${options.clientID}`,
          params,
        )
        break
    }
    trips.content = trips.content.map(fromJSON)
    return trips
  }
}
// ERROR HANDLING

type CancelTripErrorType = "TRIP_UPDATE_FORBIDDEN" | "TROP_NOT_FOUND"
const cancelTripErrorTypes = new Set([
  "TRIP_UPDATE_FORBIDDEN",
  "TROP_NOT_FOUND",
])

export function isTripCancelError(
  error: Error,
): error is MySAMError<CancelTripErrorType> {
  return isMySAMError(error) && cancelTripErrorTypes.has(error.type)
}

type DiscountTripErrorType =
  | "PARTNER_DISCOUNT_NOT_APPLICABLE"
  | "TROP_NOT_FOUND"
const discountTripErrorTypes = new Set([
  "PARTNER_DISCOUNT_NOT_APPLICABLE",
  "TROP_NOT_FOUND",
])

export function isTripDiscountError(
  error: Error,
): error is MySAMError<DiscountTripErrorType> {
  return isMySAMError(error) && discountTripErrorTypes.has(error.type)
}

type CreateTripErrorType =
  | "TRIP_ESTIMATION_EMPTY"
  | "TRIP_STATUS_INVALID"
  | "TRIP_RESERVATION_TOO_EARLY"
  | "IMMEDIATE_TRIP_ALREADY_EXISTS"
  | "CLIENT_NOT_FOUND"
  | "DRIVER_NOT_FOUND"
  | "FLAT_FEE_NOT_FOUND"
  | "ADMINISTRATIVE_AREA_NOT_FOUND"
  | "TRIP_NUMBER_OF_PASSENGERS_OUT_OF_RANGE"
  | "TRIP_MUST_PROVIDE_EXTERNAL_REFERENCE"
  | "IMMEDIATE_TRIPS_NOT_ALLOWED"
const createTripErrorTypes = new Set([
  "TRIP_ESTIMATION_EMPTY",
  "TRIP_STATUS_INVALID",
  "TRIP_RESERVATION_TOO_EARLY",
  "IMMEDIATE_TRIP_ALREADY_EXISTS",
  "CLIENT_NOT_FOUND",
  "DRIVER_NOT_FOUND",
  "FLAT_FEE_NOT_FOUND",
  "ADMINISTRATIVE_AREA_NOT_FOUND",
  "TRIP_NUMBER_OF_PASSENGERS_OUT_OF_RANGE",
  "TRIP_MUST_PROVIDE_EXTERNAL_REFERENCE",
  "IMMEDIATE_TRIPS_NOT_ALLOWED",
])

export function isTripCreateError(
  error: Error,
): error is MySAMError<CreateTripErrorType> {
  return isMySAMError(error) && createTripErrorTypes.has(error.type)
}

type SummaryTripErrorType = "CLIENT_NOT_FOUND"

export function isTripSummaryError(
  error: Error,
): error is MySAMError<SummaryTripErrorType> {
  return isMySAMError(error) && error.type === "CLIENT_NOT_FOUND"
}

type TripErrorType =
  | CancelTripErrorType
  | DiscountTripErrorType
  | CreateTripErrorType
  | SummaryTripErrorType

export function isTripError(error: Error): error is MySAMError<TripErrorType> {
  return (
    isTripCancelError(error) ||
    isTripDiscountError(error) ||
    isTripCreateError(error) ||
    isTripSummaryError(error)
  )
}
