export type Client = ClienBaseInfo & {
  enabled: boolean;
  userId: string;
  created: Date;
}

export type ClienBaseInfo = {
  email: string;
  firstName: string;
  lastName: string;
  mobilePhoneNumber: string;
}

export function fromJSON(client: Client): Client {
  client.created = new Date(client.created)
  return client
}