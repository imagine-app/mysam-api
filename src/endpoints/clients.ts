import { RESTClient } from "../client/RESTClient"
import { ClienBaseInfo, Client, ListResult, PagingOptions } from "../models"

export type RegisterParams = ClienBaseInfo & {
  emailOptIn?: boolean
  password: string
}

export type UpdateParams = Partial<ClienBaseInfo> & {
  emailOptIn?: boolean
  password?: string
}

export default class ClientsAPIClient {
  constructor(
    private client: RESTClient
  ) { }

  list(params?: PagingOptions) {
    return this.client.get<ListResult<Client>>("/clients", params)
  }

  register(params: RegisterParams) {
    return this.client.post<Client>("/clients/register", params)
  }

  update(userId: string, params: UpdateParams) {
    return this.client.put<Client>("/clients", {
      userId,
      ...params
    })
  }
}
