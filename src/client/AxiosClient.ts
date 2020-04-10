import axios, { AxiosInstance, AxiosError } from "axios"
import { RESTClient } from "./RESTClient"
import MySAMError from "./MySAMError"
import { ErrorInfo } from "../models/ErrorInfo"

export class AxiosClient implements RESTClient {
  private client: AxiosInstance

  constructor(subdomain: string, apiKey: string) {
    this.client = axios.create({
      baseURL: `https://${subdomain}.mysam.fr/api`,
      headers: {
        "X-Api-Key": apiKey,
      }
    })
  }

  async getBinary(path: string, params?: any): Promise<ArrayBuffer> {
    try {
      const response = await this.client.get<ArrayBuffer>(path, {
        params:
          params,
        responseType: "arraybuffer"
      })
      return response.data
    } catch (error) {
      return this.wrapErrorInfoAndRethrow(error)
    }
  }

  async get<T = any>(path: string, params?: any): Promise<T> {
    try {
      const res = await this.client.get<T>(path, { params })
      return res.data
    } catch (error) {
      return this.wrapErrorInfoAndRethrow(error)
    }
  }

  async post<T = any>(path: string, params?: any): Promise<T> {
    try {
      const res = await this.client.post<T>(path, params)
      return res.data
    } catch (error) {
      return this.wrapErrorInfoAndRethrow(error)
    }
  }

  async put<T = any>(path: string, params?: any): Promise<T> {
    try {
      const res = await this.client.put<T>(path, params)
      return res.data
    } catch (error) {
      return this.wrapErrorInfoAndRethrow(error)
    }
  }

  private wrapErrorInfoAndRethrow(error: any): any {
    if (error.isAxiosError) {
      const axiosError = error as AxiosError<ErrorInfo>
      if (axiosError.request && axiosError.response?.data?.error) {
        const info = axiosError.response.data
        throw new MySAMError(info, axiosError.request, axiosError.response)
      }
    }
    throw error;
  }
}