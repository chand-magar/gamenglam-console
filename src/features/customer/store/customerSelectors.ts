import type { RootState } from '../../../app/store/index';

export const selectCustomers          = (s: RootState) => s.customers.items;
export const selectCustomerTotal      = (s: RootState) => s.customers.total;
export const selectCustomerPage       = (s: RootState) => s.customers.page;
export const selectCustomerLimit      = (s: RootState) => s.customers.limit;
export const selectCustomerPages      = (s: RootState) => s.customers.totalPages;
export const selectCustomerLoading    = (s: RootState) => s.customers.isLoading;
export const selectCustomerSubmitting = (s: RootState) => s.customers.isSubmitting;
export const selectCustomerError      = (s: RootState) => s.customers.error;