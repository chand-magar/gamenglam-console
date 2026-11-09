import axiosInstance from '../../core/api/axiosInstance';
import type { ICustomerRepository, CustomerFilters } from '../../domain/repositories/ICustomerRepository';
import type { Customer } from '../../domain/entities/Customer';
import type { ApiResponse, PaginatedResponse } from '../../core/types/common.types';

export class CustomerRepository implements ICustomerRepository {
  async getAll(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const { data } = await axiosInstance.get<ApiResponse<Customer[]>>(
      '/customers',
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

  async getById(id: string): Promise<Customer> {
    const { data } = await axiosInstance.get<ApiResponse<Customer>>(`/customers/${id}`);
    return data.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/customers/${id}`);
  }
}