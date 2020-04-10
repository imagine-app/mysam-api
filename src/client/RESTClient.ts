export type RESTClient = {
  get<T>(path: string, params?: any): Promise<T>
  getBinary(path: string, params?: any): Promise<ArrayBuffer>
  post<T>(path: string, params?: any): Promise<T>
  put<T>(path: string, params?: any): Promise<T>
}

export function isRESTClient(some: any): some is RESTClient {
  if (typeof some["get"] !== "function") return false
  if (typeof some["getBinary"] !== "function") return false
  if (typeof some["post"] !== "function") return false
  if (typeof some["put"] !== "function") return false
  return true
}