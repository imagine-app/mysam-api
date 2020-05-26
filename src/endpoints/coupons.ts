import { RESTClient } from "../client/RESTClient"
import { Coupon } from "../models"
import MySAMError, { isMySAMError } from "../client/MySAMError"

export interface CreateParams {
  clientId: string
  couponCode: string
}

export default class CouponsAPIClient {
  constructor(private client: RESTClient) {}

  create(params: CreateParams) {
    return this.client.post<Coupon>("/coupons", params)
  }
}

// ERROR HANDLING

type CouponErrorType =
  | "COUPON_ALREADY_ASSIGNED"
  | "COUPON_NOT_FOUND"
  | "COUPON_NOT_ACCEPTABLE"
const couponErrorTypes = new Set([
  "COUPON_ALREADY_ASSIGNED",
  "COUPON_NOT_FOUND",
  "COUPON_NOT_ACCEPTABLE",
])

export function isCouponError(
  error: Error,
): error is MySAMError<CouponErrorType> {
  return isMySAMError(error) && couponErrorTypes.has(error.type)
}
