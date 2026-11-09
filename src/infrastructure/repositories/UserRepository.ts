import axiosInstance from '../../core/api/axiosInstance';
import type {
  IUserRepository,
  UserFilters,
  CreateUserPayload,
  UpdateUserPayload,
} from '../../domain/repositories/IUserRepository';
import type { User } from '../../domain/entities/User';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

export class UserRepository implements IUserRepository {
  async getAll(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const { data } = await axiosInstance.get<ApiResponse<User[]>>(
      '/users',
      { params: filters },
    );
    const items = Array.isArray(data.data) ? data.data : [];
    return {
      items,
      total:      items.length,
      page:       filters?.page  ?? 1,
      limit:      filters?.limit ?? 10,
      totalPages: Math.ceil(items.length / (filters?.limit ?? 10)),
    };
  }

  async getById(id: string): Promise<User> {
    const { data } = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  }

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await axiosInstance.post<ApiResponse<User>>('/users', payload);
    return data.data;
  }

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await axiosInstance.put<ApiResponse<User>>(`/users/${id}`, payload);
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/users/${id}`);
  }
}