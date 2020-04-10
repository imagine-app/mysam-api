import { AxiosResponse } from "axios"
import { ErrorInfo } from "../models/ErrorInfo"

export default class MySAMError<T = string, RES = AxiosResponse<T>> extends Error {
  private info: ErrorInfo<T>
  request: any
  response: RES

  get error() { return this.message }
  get type() { return this.info.error_type }
  get code() { return this.info.error_code }
  get description() { return this.info.error_description }
  get extraPArameters() { return this.info.extraParameters }

  constructor(info: ErrorInfo<T>, request: any, response: RES) {
    super(info.error)
    this.info = info
    this.request = request
    this.response = response
  }
}

// ERROR HANDLING

export function isMySAMError(error: Error): error is MySAMError {
  return (error instanceof MySAMError)
}
