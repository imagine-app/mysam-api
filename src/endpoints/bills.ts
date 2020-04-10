import { RESTClient } from "../client/RESTClient";

export default class BillsAPIClient {
  constructor(
    private client: RESTClient
  ) { }

  downloadInvoice(tripID: string) {
    return this.client.getBinary(`/bills/trip/${tripID}`)
  }
}