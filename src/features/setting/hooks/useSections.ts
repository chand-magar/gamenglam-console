import { useCallback } from 'react';
import { useAppDispatch } from '../../../core/hooks/useAppDispatch';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import {
  fetchSectionsThunk, createSectionThunk,
  updateSectionThunk, deleteSectionThunk,
  clearSectionError, setSectionPage,
} from '../store/sectionSlice';
import {
  selectSections, selectSectionTotal, selectSectionPage,
  selectSectionLimit, selectSectionPages,
  selectSectionLoading, selectSectionSubmitting, selectSectionError,
} from '../store/sectionSelectors';
import type {
  SectionFilters, CreateSectionPayload, UpdateSectionPayload,
} from '../../../domain/repositories/ISectionRepository';

export const useSections = () => {
  const dispatch     = useAppDispatch();
  const items        = useAppSelector(selectSections);
  const total        = useAppSelector(selectSectionTotal);
  const page         = useAppSelector(selectSectionPage);
  const limit        = useAppSelector(selectSectionLimit);
  const totalPages   = useAppSelector(selectSectionPages);
  const isLoading    = useAppSelector(selectSectionLoading);
  const isSubmitting = useAppSelector(selectSectionSubmitting);
  const error        = useAppSelector(selectSectionError);

  const fetch = useCallback(
    (filters: SectionFilters = {}) => dispatch(fetchSectionsThunk(filters)),
    [dispatch],
  );

  const create = useCallback(
    (payload: CreateSectionPayload) => dispatch(createSectionThunk(payload)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, payload: UpdateSectionPayload) =>
      dispatch(updateSectionThunk({ id, payload })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteSectionThunk(id)),
    [dispatch],
  );

  const changePage = useCallback(
    (p: number) => {
      dispatch(setSectionPage(p));
      dispatch(fetchSectionsThunk({ page: p, limit }));
    },
    [dispatch, limit],
  );

  return {
    items, total, page, limit, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage,
    dismissError: () => dispatch(clearSectionError()),
  };
};