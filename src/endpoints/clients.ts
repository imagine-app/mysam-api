import { RESTClient } from "../client/RESTClient"
import { ClienBaseInfo, Client, ListResult, PagingOptions } from "../models"
import MySAMError, { isMySAMError } from "../client/MySAMError"

export type RegisterParams = ClienBaseInfo & {
  emailOptIn?: boolean
  password: string
}

export type UpdateParams = Partial<ClienBaseInfo> & {
  emailOptIn?: boolean
  password?: string
}

export default class ClientsAPIClient {
  constructor(private client: RESTClient) {}

  list(params?: PagingOptions) {
    return this.client.get<ListResult<Client>>("/clients", params)
  }

  register(params: RegisterParams) {
    return this.client.post<Client>("/clients/register", params)
  }

  update(userId: string, params: UpdateParams) {
    return this.client.put<Client>("/clients", {
      userId,
      ...params,
    })
  }
}

// ERROR HANDLING

type UpdateClientErrorType =
  | "PROFILE_UPDATE_FAILED"
  | "CLIENT_NOT_FOUND"
  | "EMAIL_ALREADY_EXISTS"
const updateClientErrorTypes = new Set([
  "PROFILE_UPDATE_FAILED",
  "CLIENT_NOT_FOUND",
  "EMAIL_ALREADY_EXISTS",
])

export function isClientUpdateError(
  error: Error,
): error is MySAMError<UpdateClientErrorType> {
  return isMySAMError(error) && updateClientErrorTypes.has(error.type)
}

type RegisterClientErrorType =
  | "REFERRAL_CODE_NOT_FOUND"
  | "EMAIL_ALREADY_EXISTS"
const registerClientErrorTypes = new Set([
  "REFERRAL_CODE_NOT_FOUND",
  "EMAIL_ALREADY_EXISTS",
])

export function isClientRegisterError(
  error: Error,
): error is MySAMError<RegisterClientErrorType> {
  return isMySAMError(error) && updateClientErrorTypes.has(error.type)
}

type ClientErrorType = UpdateClientErrorType | RegisterClientErrorType
export function isClientError(
  error: Error,
): error is MySAMError<ClientErrorType> {
  return isClientUpdateError(error) || isClientRegisterError(error)
}
