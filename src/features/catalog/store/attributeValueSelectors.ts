import type { RootState } from '../../../app/store/index';

export const selectAttributeValues          = (s: RootState) => s.attributeValues.items;
export const selectAttributeValueTotal      = (s: RootState) => s.attributeValues.total;
export const selectAttributeValueLoading    = (s: RootState) => s.attributeValues.isLoading;
export const selectAttributeValueSubmitting = (s: RootState) => s.attributeValues.isSubmitting;
export const selectAttributeValueError      = (s: RootState) => s.attributeValues.error;