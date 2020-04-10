import { RESTClient } from "../client/RESTClient";
import { FlatFee, ListResult, PagingOptions } from "../models";

export default class FlatFeesAPIClient {
  constructor(
    private client: RESTClient
  ) { }

  list(params?: PagingOptions) {
    return this.client.get<ListResult<FlatFee>>("/flat-fees", params)
  }
}