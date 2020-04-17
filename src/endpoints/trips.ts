import { RESTClient } from "../client/RESTClient"
import { Trip, fromJSON } from "../models/Trip"
import { Address } from "../models/Address"
import { ListResult } from "../models/ListResult"

export type SearchByDateParams = {
  startDate: Date
  endDate: Date
}

export type SearchOptions = {
  filter: "all" | "mysam"
} |
{
  filter: "client",
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
  clientId?: string;
  fromAddress: Address;
  toAddress: Address;
}

type PaymentParams = {
  paymentMethod: "IN_APP" | "DEFERRED",
} | {
  paymentMethod: "ON_BOARD",
  willBePaidInCash: boolean
}

type VehicleParams =
  | {
    vehicleType: "CAR" | "LUXE",
    nbPassengers: 1 | 2 | 3 | 4
  }
  | {
    vehicleType: "VAN",
    nbPassengers: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  }

type TypeParams =
  | {
    type: "IMMEDIATE"
  }
  | {
    type: "RESERVATION",
    startDate: Date;
  }


type AssignParams = {
  autoAssignToDriver: false;
  driverId: string;
} | {
  autoAssignToDriver: true;
}

type OptionalParams = {
  trainNumber: string;
  zdForcedPrice: number;
  shouldSendInEmailSummary: boolean;
  startingFromAirport: boolean;
  options: Options;
  estimationId: number;
  externalReference: string;
  flatFeeMatrixId: number;
  comment: string;
  createdByAlfredUserId: string;
  flightNumber: string;
}

type Options = {
  animals?: "true"
  boosterSeat?: "true"
  carSeat?: "true"
  cumbersome?: "true"
  sign?: true
}

export default class TripsAPIClient {
  constructor(private client: RESTClient) { }

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

  async createDiscount(tripID: number, discountedPrice: number) {
    const trip = await this.client.put<Trip>(`/trips/${tripID}/discount`, {
      zeroDecimalPriceAfterDiscount: discountedPrice
    })
    return fromJSON(trip)
  }

  async create(params: CreateParams) {
    const newTrip = await this.client.post<Trip>(`/trips/new`, params)
    return fromJSON(newTrip)
  }

  async search(params: SearchByDateParams, options: SearchOptions = { filter: "all" }) {
    let trips: ListResult<Trip> = null
    switch (options.filter) {
      case "mysam":
        trips = await this.client.put<ListResult<Trip>>(`/trips/created-through-mysam`, params)
        break
      case "all":
        trips = await this.client.post<ListResult<Trip>>(`/trips/summary`, params)
        break
      case "client":
        trips = await this.client.post<ListResult<Trip>>(`/trips/summary/${options.clientID}`, params)
        break
    }
    trips.content = trips.content.map(fromJSON)
    return trips
  }

}
