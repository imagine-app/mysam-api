import { RESTClient } from "../client/RESTClient"
import {
  DriverLocation,
  fromJSON as driverLocationFromJSON,
} from "../models/DriverLocation"
import {
  DriverArrivalTimeEstimate,
  fromJSON as driverArrivalTimeEstimateFromJSON,
} from "../models/DriverArrivalTimeEstimate"
import MySAMError from "../client/MySAMError"

export default class TripDriverAPIClient {
  constructor(private client: RESTClient) {}

  async getDriverLocation(tripID: string) {
    const driverLocation = await this.client.get<DriverLocation>(
      `/trip/${tripID}/driver/location`,
    )
    return driverLocationFromJSON(driverLocation)
  }

  async estimateTimeToPickUpLocation(tripID: string) {
    const driverArrivalTimeEstimate = await this.client.get<
      DriverArrivalTimeEstimate
    >(`/trip/${tripID}/driver/location`)
    return driverArrivalTimeEstimateFromJSON(driverArrivalTimeEstimate)
  }
}

// ERROR HANDLING

type GetDriverLocationErrorType = "TRIP_STATUS_INVALID" | "TRIP_NOT_FOUND"
const getDriverLocatoinErrorTypes = new Set([
  "TRIP_STATUS_INVALID",
  "TRIP_NOT_FOUND",
] as GetDriverLocationErrorType[])

export function isGetDriverLocationError(
  error: Error,
): error is MySAMError<GetDriverLocationErrorType> {
  return (
    error instanceof MySAMError && getDriverLocatoinErrorTypes.has(error.type)
  )
}

type EstimateTimeToPickUpLocationErrorType =
  | "NO_DRIVER_ASSIGNED_TO_TRIP"
  | "TRIP_NOT_FOUND"
  | "THIRD_PARTY_CALL_FAILED"
const estimateTimeToPickUpLocationErrorTypes = new Set([
  "NO_DRIVER_ASSIGNED_TO_TRIP",
  "TRIP_NOT_FOUND",
  "THIRD_PARTY_CALL_FAILED",
] as EstimateTimeToPickUpLocationErrorType[])

export function isEstimateTimeToPickUpLocationError(
  error: Error,
): error is MySAMError<EstimateTimeToPickUpLocationErrorType> {
  return (
    error instanceof MySAMError &&
    estimateTimeToPickUpLocationErrorTypes.has(error.type)
  )
}

type TripDriverErrorType =
  | GetDriverLocationErrorType
  | EstimateTimeToPickUpLocationErrorType

export function isTripDriverError(
  error: Error,
): error is MySAMError<TripDriverErrorType> {
  return (
    isGetDriverLocationError(error) ||
    isEstimateTimeToPickUpLocationError(error)
  )
}
