import type { AxiosInstance } from 'axios';
import axiosInstance from './axiosInstance';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';

export interface IBaseApiService<T> {
  getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<T>>;
  getById(id: string): Promise<T>;
  create(payload: Partial<T>): Promise<T>;
  update(id: string, payload: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export class BaseApiService<T> implements IBaseApiService<T> {
  protected readonly http: AxiosInstance;

  constructor(protected readonly basePath: string) {
    this.http = axiosInstance;
  }

  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<T>> {
    const { data } = await this.http.get<ApiResponse<PaginatedResponse<T>>>(this.basePath, { params });
    return data.data;
  }

  async getById(id: string): Promise<T> {
    const { data } = await this.http.get<ApiResponse<T>>(`${this.basePath}/${id}`);
    return data.data;
  }

  async create(payload: Partial<T>): Promise<T> {
    const { data } = await this.http.post<ApiResponse<T>>(this.basePath, payload);
    return data.data;
  }

  async update(id: string, payload: Partial<T>): Promise<T> {
    const { data } = await this.http.put<ApiResponse<T>>(`${this.basePath}/${id}`, payload);
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`${this.basePath}/${id}`);
  }
}