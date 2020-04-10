import { RESTClient } from "../client/RESTClient"
import { Coordinate, VehicleType } from "../models"
import { Estimation, fromJSON } from "../models/Estimation"

export type ApproachTimeParams = Coordinate & {
  vehicleType: VehicleType
}

export interface EstimateParams {
  clientId: string;
  flatFeeId?: number;
  fromLatitude: number;
  fromLongitude: number;
  significantDisability?: boolean;
  startDate?: Date;
  toLatitude: number;
  toLongitude: number;
  vehicleType: VehicleType;
}

export default class EstimationAPIClient {
  constructor(private client: RESTClient) { }

  approachTime(request: ApproachTimeParams) {
    return this.client.get<number>("/estimation/approach-time", request)
  }

  async estimate(request: EstimateParams) {
    const estimation = await this.client.post<Estimation>("/estimation/estimate", request)
    return fromJSON(estimation)
  }
}
