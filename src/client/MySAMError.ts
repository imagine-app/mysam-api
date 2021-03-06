import { AxiosResponse } from "axios"
import { ErrorInfo } from "../models/ErrorInfo"

export default class MySAMError<
  T = string,
  RES = AxiosResponse<T>
> extends Error {
  readonly isMySAMError: true = true

  // MyMove-specific fields:
  readonly type: T
  readonly code: number
  readonly description: string
  readonly extraParameters?: any
  // Attach raw request & response
  readonly request: any
  readonly response: RES

  constructor(info: ErrorInfo<T>, request: any, response: RES) {
    super(info.error)
    this.isMySAMError = true
    this.type = info.error_type
    this.code = info.error_code
    this.description = info.error_description
    this.extraParameters = info.extraParameters
    this.request = request
    this.response = response
  }
}

// ERROR HANDLING

export function isMySAMError(error: any): error is MySAMError {
  return Boolean(error.isMySAMError)
}
