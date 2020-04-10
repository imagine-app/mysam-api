import { RESTClient } from "../client/RESTClient"
import { Address, Coordinate } from "../models"

export default class AddressesAPIClient {
  constructor(private client: RESTClient) { }

  search(query: string) {
    return this.client.get<Address>("/addresses/search", { query })
  }

  reverseGeocode(coordinate: Coordinate) {
    return this.client.get<Address>("/addresses/reverse-geocode", coordinate)
  }
}
