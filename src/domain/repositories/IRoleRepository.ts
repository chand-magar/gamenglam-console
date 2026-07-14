import type { Role, RoleSectionPermission } from '../entities/Role';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface RoleFilters {
  page?:   number;
  limit?:  number;
  status?: string;
  search?: string;
}

export interface CreateRolePayload {
  role_name:    string;
  role_details: RoleSectionPermission[];
}

export interface UpdateRolePayload {
  role_name?:    string;
  role_details?: RoleSectionPermission[];
}

export interface IRoleRepository {
  getAll(filters?: RoleFilters): Promise<PaginatedResponse<Role>>;
  getById(id: string): Promise<Role>;
  create(payload: CreateRolePayload): Promise<Role>;
  update(id: string, payload: UpdateRolePayload): Promise<Role>;
  delete(id: string): Promise<void>;
}