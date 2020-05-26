import { RESTClient } from "../client/RESTClient"
import { Coordinate, VehicleType } from "../models"
import { Estimation, fromJSON } from "../models/Estimation"
import MySAMError, { isMySAMError } from "../client/MySAMError"

export type ApproachTimeParams = Coordinate & {
  vehicleType: VehicleType
}

export interface EstimateParams {
  clientId?: string
  flatFeeId?: number
  fromLatitude: number
  fromLongitude: number
  significantDisability?: boolean
  startDate?: Date
  toLatitude: number
  toLongitude: number
  vehicleType: VehicleType
}

export default class EstimationAPIClient {
  constructor(private client: RESTClient) {}

  approachTime(request: ApproachTimeParams) {
    return this.client.get<number>("/estimation/approach-time", request)
  }

  async estimate(request: EstimateParams) {
    const estimation = await this.client.post<Estimation>(
      "/estimation/estimate",
      request,
    )
    return fromJSON(estimation)
  }
}

// ERROR HANDLING

type EstimationErrorType =
  | "BAD_REQUEST_PARAMETER"
  | "FLAT_FEE_NOT_FOUND"
  | "ADMINISTRATIVE_AREA_NOT_SUPPORTED"
  | "THIRD_PARTY_CALL_FAILED"
  | "NO_DRIVER_AVAILABLE"
const estimationErrorTypes = new Set([
  "BAD_REQUEST_PARAMETER",
  "FLAT_FEE_NOT_FOUND",
  "ADMINISTRATIVE_AREA_NOT_SUPPORTED",
  "THIRD_PARTY_CALL_FAILED",
  "NO_DRIVER_AVAILABLE",
])

export function isEstimationError(
  error: Error,
): error is MySAMError<EstimationErrorType> {
  return isMySAMError(error) && estimationErrorTypes.has(error.type)
}
