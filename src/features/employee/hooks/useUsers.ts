import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchUsersThunk, createUserThunk,
  updateUserThunk, deleteUserThunk,
  clearUserError, setUserPage,
} from '../store/userSlice';
import {
  selectUsers, selectUserTotal, selectUserPage,
  selectUserLimit, selectUserPages,
  selectUserLoading, selectUserSubmitting, selectUserError,
} from '../store/userSelectors';
import type {
  UserFilters, CreateUserPayload, UpdateUserPayload,
} from '../../../domain/repositories/IUserRepository';

export const useUsers = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectUsers);
  const total        = useAppSelector(selectUserTotal);
  const page         = useAppSelector(selectUserPage);
  const limit        = useAppSelector(selectUserLimit);
  const totalPages   = useAppSelector(selectUserPages);
  const isLoading    = useAppSelector(selectUserLoading);
  const isSubmitting = useAppSelector(selectUserSubmitting);
  const error        = useAppSelector(selectUserError);

  const fetch = useCallback(
    (filters: UserFilters = {}) => dispatch(fetchUsersThunk(filters)),
    [dispatch],
  );

  const create = useCallback(
    (payload: CreateUserPayload) => dispatch(createUserThunk(payload)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, payload: UpdateUserPayload) =>
      dispatch(updateUserThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteUserThunk(id)),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setUserPage(p));
      dispatch(fetchUsersThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage,
    dismissError: () => dispatch(clearUserError()),
  };
};