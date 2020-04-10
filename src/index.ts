// all the sub-API endpoints
import ClientsAPIClient from "./endpoints/clients"
import AddressesAPIClient from "./endpoints/addresses"
import EstimationAPIClient from "./endpoints/estimation"
import FlatFeesAPIClient from "./endpoints/flat-fees"
import BillsAPIClient from "./endpoints/bills"
import CouponsAPIClient from "./endpoints/coupons"
import TripsAPIClient from "./endpoints/trips"

// Re-export all types for convenience
export * from "./models"
export { UpdateParams as ClientsUpdateParams, RegisterParams as ClientsRegisterParams } from "./endpoints/clients"
export { ApproachTimeParams, EstimateParams } from "./endpoints/estimation"
export { CreateParams as CouponsCreateParams } from "./endpoints/coupons"

// and error handling functions
export { default as MySAMError, isMySAMError } from "./client/MySAMError"
export { isCouponError } from "./endpoints/coupons"

// By default we use the bundled axios-based REST client
import { RESTClient, isRESTClient } from "./client/RESTClient"
import { AxiosClient } from "./client/AxiosClient"

type APIClientParams =
  | RESTClient
  | {
    subdomain: string,
    apiKey: string
  }

export default class APIClient {
  clients: ClientsAPIClient
  addresses: AddressesAPIClient
  estimation: EstimationAPIClient
  flatFees: FlatFeesAPIClient
  bills: BillsAPIClient
  coupons: CouponsAPIClient
  trips: TripsAPIClient

  constructor(params: APIClientParams) {
    const restClient = isRESTClient(params) ? params : new AxiosClient(params.subdomain, params.apiKey)
    this.clients = new ClientsAPIClient(restClient)
    this.addresses = new AddressesAPIClient(restClient)
    this.estimation = new EstimationAPIClient(restClient)
    this.flatFees = new FlatFeesAPIClient(restClient)
    this.bills = new BillsAPIClient(restClient)
    this.coupons = new CouponsAPIClient(restClient)
    this.trips = new TripsAPIClient(restClient)
  }
}
