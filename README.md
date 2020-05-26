# An API client for [MySAM]

This is a TypeScript/Javascript API client for the [MySAM] API.

It features:

- a simple yet exhaustive API mapping of the [MySAM] REST API
- strong static typing checks using [TypeScript] for security
- an easily composable structure, inspired from the Stripe client

### Installation

The library is available using NPM or `yarn`:

```sh
$ npm install --save mysam-api
# or
$ yarn add mysam-api
```

### Usage

You need to grab the adequate credentials to run the client, then pass your credentians and access the relevant methods:

```javascript
import MySAMAPIClient from "mysam-api"

// add your subdomain and API key
const mysam = new MySAMAPIClient({
  subdomain: "api.demo",
  apiKey: "<YOU_API_KEY>",
})

// and use it adequately
async function process() {
  const existingClients = await mysam.clients.list()
  console.log(
    "Found clients:",
    JSON.stringify(existingClients.content, null, 2),
  )

  const newClient = await mysam.clients.registerClient({
    email: "myname@example.com",
    firstName: "John",
    lastName: "Smith",
    mobilePhoneNumber: "555-5555-555",
    password: "somepassword",
  })
  console.log("Done creating new client with ID:", newClient.id)
}
process()
```

The library also offers a custom MySAMError type that wraps the error messages sent bu the API.
It also offers a series of test functions to detect the common cases of errors: this is especially useful with TypesScript to use smart completion and validate exhaustivity of `switch` cases:

```typescript
try {
  const newCoupon = await mysam.coupons.create({
    clientId: "<SOME_CLIENT_ID",
    couponCode: "TESTCOUPON",
  })
  console.log(newCoupon)
} catch (error) {
  // test if the error is a MySAMError with relevant .type values
  if (isCouponError(error)) {
    switch (error.type) {
      case "COUPON_ALREADY_ASSIGNED": // ⬅︎ completion works here !
        console.warn("Coupon is already assigned !")
        break
      case "COUPON_NOT_FOUND":
        console.warn("Coupon does not exist")
        break
    }
    console.warn("Unexpected error:", error)
  }
}
```

## Supported API endpoints

### `addresses`: geolocation search

Usage:

```javascript
// to search an address using a location string
let address = await mysam.addresses.search("22 rue du Pont Neuf, 75001 Paris")

// to search an address using a GPS coordinate
let address = await mysam.addresses.search({
  latitude: 48.86016845703125,
  longitude: 2.3441596031188965,
})
```

Returns: an `Address` object:

```javascript
{
  address: '22 Rue du Pont Neuf',
  zipCode: '75001',
  city: 'Paris',
  latitude: 48.860699,
  longitude: 2.34477
}
```

### `bills`: download PDF invoices

**NOTE**: this API requires a Trip ID

Usage:

```javascript
const pdfData = await mysam.bills.downloadInvoice(2199)
```

Returns: the RAW data as an `ArrayBuffer`

### `clients`: register and manage `Clients`

Usage:

```javascript
// register a new client into the system
let client = await mysam.clients.registerClient({
      email: "contact@imagine-app.fr",
      firstName: "James",
      lastName: "Smith",
      mobilePhoneNumber: "06050403302",
      password: "thisismypassword",
})

// update an existing client
let updatedClient = await mysam.clients.update(
  // the internal user ID for thie client
  "66c7b90b-7b10-4c22-b57f-4bb893157425",
  // the update parameters, typically a subset of the creation params
  {
    firstName: "John",
    mobilePhoneNumber: "0102030405,
    // ...

    // you can also change password and set opt-in for emails
    password: "mynewpassword",
    emailOptIn: false
  }
)

// list all the existing clients
let clients = await mysam.clients.list()
```

Returns: a (new or updated) `Client`

```typescript
{
  userId: "d77055fc-8a3d-44cc-8db2-f1ee1ed8c437",
  firstName: "John",
  lastName: "Smith",
  email: "contact@imagine-app.fr",
  created: "2020-04-14T13:38:53.586Z",
  mobilePhoneNumber: "0102030405"
}
```

or in the case of `list()` a list of client embedded in a "list Result" object:

```typescript
{
  size: 20, // ⬅︎ results per page
  number: 0, // ⬅︎ current page
  first: true, // ⬅︎ this is the first page
  totalPages: 1, // ⬅︎ results span 1 page
  totalElements: 2, // ⬅︎ the whole list (without paging) contains 2 elements
  last: true, // ⬅︎ this is the last page
  numberOfElements: 2, // ⬅︎ the "content" array holds 2 elements
  // the actual "Clients" are embedded into the "content" array:
  content: [
    {
      userId: 'd77055fc-8a3d-44cc-8db2-f1ee1ed8c437',
      firstName: 'Josn',
      lastName: 'Smith',
      email: 'contact@imagine-app.fr',
      created: "2020-04-14T13:38:53.586Z",
      mobilePhoneNumber: "0102030405",
    },
    {
      userId: '66c7b90b-7b10-4c22-b57f-4bb893157425',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'contact@imagine-app.fr',
      created: "2020-04-14T13:38:53.586Z",
      mobilePhoneNumber: "0102030405",
    }
  ]
}
```

**NOTE**: the `list()` methods offers options to control the paging:

```typescript
let clients = await mysam.clients.list({
  page: 2, // ⬅︎ shows results in page 2
  size: 50, // ⬅︎ no more than 50 results per page
})
```

### `coupons`: apply pre-registered `Coupon`s to a `Client`

Usage:

```javascript
// Apply the TESTCOUPON coupon to a given client
const appliedCoupon = await mysam.coupons.create({
  clientId: "d77055fc-8a3d-44cc-8db2-f1ee1ed8c437",
  couponCode: "TESTCOUPON",
})
```

Returns: a `Coupon` result

```typescript
{
  code: 'TESTCOUPON',
  unit: 'CURRENCY',
  zeroDecimalAmount: 500,
  active: true,
  combinable: false,
  used: false
}
```

### `estimation`: estimate the price of a `Trip`

Usage:

```javascript
// estimate approach time of the driver, in seconds
const approachTimeInSecs = await mysam.estimation.approachTime({
  // GPS location
  latitude: 48.880931,
  longitude: 2.355323,
  // type of vehicle
  vehicleType: "CAR", // ⬅︎ either CAR or VAN or LUXE
})
console.log(approachTimeInSecs) // for eg. 600 for 10 minute wait

// complete estimation of a trip
const estimation = await mysam.estimation.estimate({
  clientId: "d77055fc-8a3d-44cc-8db2-f1ee1ed8c437",
  // start location
  fromLatitude: 48.86016845703125,
  fromLongitude: 2.3441596031188965,
  // end location
  toLatitude: 48.880931,
  toLongitude: 2.355323,
  // type of vehicle
  vehicleType: "CAR", // ⬅︎ either CAR or VAN or LUXE
})
```

Returns: an `Estimation` object

```typescript
{
  id: 10730,
  distance: 3382, // ⬅ ︎distance in meters
  duration: 739, // ⬅︎ trip duration in seconds
  isPriceIncreased: false,
  tripType: 'IMMEDIATE',
  vehicleType: 'CAR',
  startDate: Date("2020-04-14T15:10:20.748Z")
  price: 8 // estimated price in €
}
```

### `flat-fees`: list the pre-defined fees.

Usage:

```javascript
const flatFees = await mysam.flatFees.list()
```

Returns: a list of `FlatFee` objects

**NOTE**: this method accepts the same paging options as the `clients.list()` method
**NOTE**: the returned `flatFeeId` can be provided to the `estimation` endpoint for pricing

### `trips`: manage `Trip`s

**NOTE**: these API are much easier to use with TypeScript, due to the checks the compiler is able to do on the arguments

#### Basic `Trip` management

Usage:

```javascript
// Create a new trip for this client
let trip = await mysam.trips.create({
  clientId: "d77055fc-8a3d-44cc-8db2-f1ee1ed8c437",
  fromAddress: {
    address: "22 rue du pont neuf",
    city: "Paris",
    country: "FR",
    zipCode: "75001",
    latitude: 48.86016845703125,
    longitude: 2.3441596031188965,
  },
  toAddress: {
    address: "93 avenue Denfert-Rochereau",
    city: "Paris",
    country: "FR",
    zipCode: "75014",
    latitude: 48.836177825927734,
    longitude: 2.3342578411102295,
  },
  type: "IMMEDIATE",
  vehicleType: "CAR",
  nbPassengers: 2,
  paymentMethod: "DEFERRED",
  autoAssignToDriver: true,
})

// retrieve trip info, by ID
let existingTrip = await mysam.trips.get(2199)

// cancel a trip
let canceledTrip = await mysam.trips.cancel(2199)

// compute the price due in case of a cancelation
let cancelationPrice = await mysam.trips.esimateCancelationPrice(2199)
console.log(cancelationPrice) // ⬅︎ eg. 5 for 5€

// update the price of the course (dicounted price must be < current price !)
let updatedTrip = await mysam.trips.createDiscount(
  2199, // ⬅ ︎the trip ID
  5, // ⬅︎ the new price in €
)
```

Returns: a `Trip` object

```typescript
{
  fromAddress: {
    address: '22 rue du pont neuf',
    zipCode: '75001',
    city: 'Paris',
    country: 'FR',
    latitude: 48.86016845703125,
    longitude: 2.3441596031188965
  },
  toAddress: {
    address: '93 avenue Denfert-Rochereau',
    zipCode: '75014',
    city: 'Paris',
    country: 'FR',
    latitude: 48.836177825927734,
    longitude: 2.3342578411102295
  },
  client: {
    userId: 'd77055fc-8a3d-44cc-8db2-f1ee1ed8c437',
    firstName: 'John',
    lastName: 'Smith',
    email: 'contact@imagine-app.fr',
    created: 2020-04-07T15:11:34.413Z,
    mobilePhoneNumber: '0102030405'
  },
  status: 'NO_DRIVER_AVAILABLE', // ⬅︎ ou "WAITING" ou "ASSIGNED" ou "STARTED" ou "CANCELED" ou "FINISHED"
  startDate: 2020-04-14T13:29:46.956Z,
  endDate: 2020-04-14T13:34:58.026Z, // ⬅︎ date de fin, non présent en "WAITING" ou "ASSIGNED"
  id: 2199,
  eurosDiscountedPrice: 12,
  estimatedPrice: 12 // ⬅︎ le prix à afficher au client
}
```

#### Trip lookup

Usage:

```javascript
// search all the trips between two dates
const trips = await mysam.trips.search({
  stardDate: new Date("2020-03-14T13:29:46.956Z"),
  endDate: new Date("2020-04-14T13:29:46.956Z"),
})

// search can be scoped to:
// • all the trips (default) with the "all" filter
// • only the trips created through the MySAM interface using the "mysam" filter
// • only a given client using the "client" filter
// ex:
const tripsCreatedInMySAM = await mysam.trips.search(
  {
    stardDate: new Date("2020-03-14T13:29:46.956Z"),
    endDate: new Date("2020-04-14T13:29:46.956Z"),
  },
  {
    filter: "mysam",
  },
)

const tripForJohn = await mysam.trips.search(
  {
    stardDate: new Date("2020-03-14T13:29:46.956Z"),
    endDate: new Date("2020-04-14T13:29:46.956Z"),
  },
  {
    filter: "client",
    clientID: "d77055fc-8a3d-44cc-8db2-f1ee1ed8c437",
  },
)
```

Returns: a "List Result" of `Trip`s

**NOTE**: this method accepts the same paging options as the `clients.list()` or `flatFees.list()` methods

### `trip-driver`: manage live info on `Driver`s

**NOTE**: these API only work then the underlying `Trip` is in `ASSIGNED` or `STARTED` state !

#### Get the current location (`DriverLocation`) of the vehicle

```javascript
const tripId = 1234 // ⬅︎ the active trip ID
const driverLocation = await mysam.tripDriver.getDriverLocation(tripId)
console.log(`Driver is at: ${driverLocation.latitude}, ${driverLocation.longitude})
```

#### Estimate the delay for the driver to arrive on site

```javascript
const tripId = 1234 // ⬅︎ the active trip ID
const timeToPickUp = await mysam.tripDriver.estimateTimeToPickUpLocation(tripId)
console.log(
  `Vehicle will arrive in: ${timeToPickUp.duration}s (${timeToPiclUp.distance}m)`,
)
```

## Contributing

PRs are welcomed 😀

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Additional tooling

The project written in [TypeScript], but it's also available to Javascript using NPM

## TODO

- [ ] Complete the API with the remaning calls
- [ ] Add comments & docs
- [ ] Add some testing

[mysam]: https://mysam.fr/
[rollup]: https://rollupjs.org/
[typescript]: https://www.typescriptlang.org/
