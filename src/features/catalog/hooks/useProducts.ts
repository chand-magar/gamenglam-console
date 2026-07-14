import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchProductsThunk, createProductThunk,
  updateProductThunk, deleteProductThunk,
  clearProductError, setProductPage,
} from '../store/productSlice';
import {
  selectProducts, selectProductTotal, selectProductPage,
  selectProductLimit, selectProductPages,
  selectProductLoading, selectProductSubmitting, selectProductError,
} from '../store/productSelectors';
import type {
  ProductFilters, CreateProductPayload, UpdateProductPayload,
} from '../../../domain/repositories/IProductRepository';

export const useProducts = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectProducts);
  const total        = useAppSelector(selectProductTotal);
  const page         = useAppSelector(selectProductPage);
  const limit        = useAppSelector(selectProductLimit);
  const totalPages   = useAppSelector(selectProductPages);
  const isLoading    = useAppSelector(selectProductLoading);
  const isSubmitting = useAppSelector(selectProductSubmitting);
  const error        = useAppSelector(selectProductError);

  const fetch = useCallback(
    (filters: ProductFilters = {}) => dispatch(fetchProductsThunk(filters)),
    [dispatch],
  );

  const create = useCallback(
    (payload: CreateProductPayload) => dispatch(createProductThunk(payload)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, payload: UpdateProductPayload) =>
      dispatch(updateProductThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteProductThunk(id)),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setProductPage(p));
      dispatch(fetchProductsThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage,
    dismissError: () => dispatch(clearProductError()),
  };
};