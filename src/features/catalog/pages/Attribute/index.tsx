import { useState, useEffect, useRef } from 'react';
import { useAttributes } from '../../hooks/useAttributes';
import { useCategories } from '../../hooks/useCategories';
import { AttributeTable } from '../../components/AttributeTable';
import { AttributeFormModal } from '../../components/AttributeFormModal';
import type { Attribute } from '../../../../domain/entities/Attribute';
import type { AttributeFormValues } from '../../schemas/attribute.schemas';

const AttributeListPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage, dismissError,
  } = useAttributes();

  const { items: categories, fetch: fetchCategories } = useCategories();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<Attribute | null>(null);
  const [deleteItem, setDeleteItem] = useState<Attribute | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
    fetchCategories({ page: 1, limit: 100 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleOpenEdit   = (item: Attribute) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (values: AttributeFormValues) => {
    if (editItem) {
      await update(editItem.attribute_id, {
        category_no:    values.category_no,
        attribute_name: values.attribute_name,
        code:           values.code,
        type:           values.type,
        is_required:    values.is_required,
        is_variant:     values.is_variant,
        sort_order:     values.sort_order,
      });
    } else {
      await create({
        category_no:    values.category_no,
        attribute_name: values.attribute_name,
        code:           values.code,
        type:           values.type,
        is_required:    values.is_required,
        is_variant:     values.is_variant,
        sort_order:     values.sort_order,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.attribute_id);
    setDeleteItem(null);
  };

  const requiredCount = items.filter((a) => a.is_required).length;
  const variantCount  = items.filter((a) => a.is_variant).length;
  const activeCount   = items.filter((a) => a.status === 'A').length;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Attributes</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Attribute Management</h1>
          <p className="gng-page-subtitle">
            Configure product variations, specifications, and dynamic fields.
          </p>
        </div>
        <button type="button" className="gng-btn-primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Add Attribute
        </button>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-sliders" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Attributes</p>
            <p className="gng-stat-value">{isLoading ? '—' : total}</p>
          </div>
          <span className="gng-stat-badge">+4 this month</span>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-amber">
            <i className="fa-solid fa-asterisk" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Required Fields</p>
            <p className="gng-stat-value">{isLoading ? '—' : requiredCount}</p>
          </div>
          <span className="gng-stat-badge">Essential</span>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-layer-group" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Variants</p>
            <p className="gng-stat-value">{isLoading ? '—' : variantCount}</p>
          </div>
          <span className="gng-stat-badge">High Usage</span>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-green">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Sync Status</p>
            <p className="gng-stat-value">
              {isLoading ? '—' : activeCount === total && total > 0 ? 'Active' : 'Partial'}
            </p>
          </div>
          <span className="gng-stat-badge">100% Active</span>
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
              placeholder="Search attributes..."
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
      <AttributeTable
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
      <AttributeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        categories={categories}
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
            <p className="gng-confirm-title">Delete Attribute</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">"{deleteItem.attribute_name}"</span>?
              This will also remove all associated values.
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

export default AttributeListPage;