import type { User } from '../entities/User';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface UserFilters {
  page?:    number;
  limit?:   number;
  status?:  string;
  role_no?: number;
  search?:  string;
}

export interface CreateUserPayload {
  user_fullname: string;
  email_id:      string;
  mobile_no?:    string | null;
  gender?:       string | null;
  role_no:       number;
  password:      string;
}

export interface UpdateUserPayload {
  user_fullname?: string;
  email_id?:      string;
  gender?:        string | null;
  mobile_no?:     string | null;
  address?:       string | null;
}

export interface IUserRepository {
  getAll(filters?: UserFilters): Promise<PaginatedResponse<User>>;
  getById(id: string): Promise<User>;
  create(payload: CreateUserPayload): Promise<User>;
  update(id: string, payload: UpdateUserPayload): Promise<User>;
  delete(id: string): Promise<void>;
}