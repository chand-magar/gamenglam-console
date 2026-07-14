import axiosInstance from '../../core/api/axiosInstance';
import type {
  IRoleRepository,
  RoleFilters,
  CreateRolePayload,
  UpdateRolePayload,
} from '../../domain/repositories/IRoleRepository';
import type { Role } from '../../domain/entities/Role';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

export class RoleRepository implements IRoleRepository {
  async getAll(filters?: RoleFilters): Promise<PaginatedResponse<Role>> {
    const { data } = await axiosInstance.get<ApiResponse<Role[]>>(
      '/roles',
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

  async getById(id: string): Promise<Role> {
    const { data } = await axiosInstance.get<ApiResponse<Role>>(`/roles/${id}`);
    return data.data;
  }

  async create(payload: CreateRolePayload): Promise<Role> {
    const { data } = await axiosInstance.post<ApiResponse<Role>>('/roles', payload);
    return data.data;
  }

  async update(id: string, payload: UpdateRolePayload): Promise<Role> {
    const { data } = await axiosInstance.put<ApiResponse<Role>>(`/roles/${id}`, payload);
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/roles/${id}`);
  }
}