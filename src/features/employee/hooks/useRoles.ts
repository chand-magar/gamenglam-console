import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchRolesThunk, createRoleThunk,
  updateRoleThunk, deleteRoleThunk,
  clearRoleError, setRolePage,
} from '../store/roleSlice';
import {
  selectRoles, selectRoleTotal, selectRolePage,
  selectRoleLimit, selectRolePages,
  selectRoleLoading, selectRoleSubmitting, selectRoleError,
} from '../store/roleSelectors';
import type {
  RoleFilters, CreateRolePayload, UpdateRolePayload,
} from '../../../domain/repositories/IRoleRepository';

export const useRoles = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectRoles);
  const total        = useAppSelector(selectRoleTotal);
  const page         = useAppSelector(selectRolePage);
  const limit        = useAppSelector(selectRoleLimit);
  const totalPages   = useAppSelector(selectRolePages);
  const isLoading    = useAppSelector(selectRoleLoading);
  const isSubmitting = useAppSelector(selectRoleSubmitting);
  const error        = useAppSelector(selectRoleError);

  const fetch = useCallback(
    (filters: RoleFilters = {}) => dispatch(fetchRolesThunk(filters)),
    [dispatch],
  );

  const create = useCallback(
    (payload: CreateRolePayload) => dispatch(createRoleThunk(payload)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, payload: UpdateRolePayload) =>
      dispatch(updateRoleThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteRoleThunk(id)),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setRolePage(p));
      dispatch(fetchRolesThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage,
    dismissError: () => dispatch(clearRoleError()),
  };
};