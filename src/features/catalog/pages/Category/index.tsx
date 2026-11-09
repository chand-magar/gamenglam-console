import { useState, useEffect, useRef } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { CategoryTable } from '../../components/CategoryTable';
import { CategoryFormModal } from '../../components/CategoryFormModal';
import type { Category } from '../../../../domain/entities/Category';
import type { CategoryFormValues } from '../../schemas/category.schemas';

const CategoryListPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage, dismissError,
  } = useCategories();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<Category | null>(null);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleOpenEdit   = (item: Category) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (values: CategoryFormValues) => {
    if (editItem) {
      await update(editItem.category_no, {
        category_name: values.category_name,
        slug:          values.slug,
        details:       values.details,
        parent_id:     values.parent_id,
      });
    } else {
      await create({
        category_name: values.category_name,
        slug:          values.slug,
        details:       values.details,
        parent_id:     values.parent_id,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.category_no);
    setDeleteItem(null);
  };

  const activeCount = items.filter((c) => c.status === 'A').length;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Categories</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Category Management</h1>
          <p className="gng-page-subtitle">
            Organise your product catalogue with categories and subcategories.
          </p>
        </div>
        <button type="button" className="gng-btn-primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Add Category
        </button>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-sitemap" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Categories</p>
            <p className="gng-stat-value">{isLoading ? '—' : total}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-green">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Active</p>
            <p className="gng-stat-value">{isLoading ? '—' : activeCount}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-layer-group" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">With Parent</p>
            <p className="gng-stat-value">
              {isLoading ? '—' : items.filter((c) => c.parent_no).length}
            </p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-rotate" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Last Sync</p>
            <p className="gng-stat-value">2m ago</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="gng-error-alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button type="button" className="gng-error-dismiss" onClick={dismissError}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="gng-toolbar">
        <div className="gng-toolbar-left">
          <div className="gng-search-wrapper">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Search categories..."
              className="gng-search-input"
            />
          </div>
        </div>
        <div className="gng-toolbar-right">
          <button type="button" className="gng-btn-secondary">
            <i className="fa-solid fa-filter" /> Filter
          </button>
          <button type="button" className="gng-btn-secondary">
            <i className="fa-solid fa-file-export" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <CategoryTable
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteItem}
        onPageChange={changePage}
      />

      {/* Form Modal */}
      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        categories={items}
        editItem={editItem}
        isSubmitting={isSubmitting}
      />

      {/* Delete confirm */}
      {deleteItem && (
        <div className="gng-confirm-overlay">
          <div className="gng-confirm-box">
            <div className="gng-confirm-icon">
              <i className="fa-solid fa-trash-can" />
            </div>
            <p className="gng-confirm-title">Delete Category</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">"{deleteItem.category_name}"</span>?
              All subcategories will also be affected.
            </p>
            <div className="gng-confirm-actions">
              <button
                type="button"
                className="gng-confirm-cancel"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gng-btn-danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Deleting…</>
                  : <><i className="fa-solid fa-trash-can" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryListPage;