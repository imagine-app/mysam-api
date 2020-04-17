import { VehicleType } from "./VehicleType"

export type Bank = {
  id: number
  active: boolean
  bic: string
  created: Date
  iban: string
}

export type DriverDetails = {
  vehicleBrand: string
  vehicleColor: string
  vehicleModel: string
  vehicleType: VehicleType
  vehicleYear: number
}

export type Driver = {
  id: number
  email: string
  enabled: boolean
  firstName: string
  lastName: string
  highQuality: boolean
  mobilePhoneNumber: string
  userID: number
  driverDetails: DriverDetails
}
