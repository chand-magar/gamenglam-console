import type { RootState } from '../../../app/store/index';

export const selectInventory          = (s: RootState) => s.inventory.items;
export const selectInventoryTotal     = (s: RootState) => s.inventory.total;
export const selectInventoryPage      = (s: RootState) => s.inventory.page;
export const selectInventoryLimit     = (s: RootState) => s.inventory.limit;
export const selectInventoryPages     = (s: RootState) => s.inventory.totalPages;
export const selectInventoryLoading   = (s: RootState) => s.inventory.isLoading;
export const selectInventorySubmitting = (s: RootState) => s.inventory.isSubmitting;
export const selectInventoryError     = (s: RootState) => s.inventory.error;