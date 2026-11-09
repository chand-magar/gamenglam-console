import type { Customer } from '../entities/Customer';
import type { PaginatedResponse } from '../../core/types/common.types';

export interface CustomerFilters {
  page?:   number;
  limit?:  number;
  status?: string;
  search?: string;
}

export interface ICustomerRepository {
  getAll(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>>;
  getById(id: string): Promise<Customer>;
  delete(id: string): Promise<void>;
}