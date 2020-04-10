export type ErrorInfo<T = string> = {
  error: string
  error_type: T
  error_code: number
  error_description: string
  extraParameters?: any
}