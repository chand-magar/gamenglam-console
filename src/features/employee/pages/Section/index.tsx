import { useState, useEffect, useRef } from 'react';
import { useSections } from '../../hooks/useSections';
import { SectionTable } from '../../components/SectionTable';
import { SectionFormModal } from '../../components/SectionFormModal';
import type { Section } from '../../../../domain/entities/Section';
import type { SectionFormValues } from '../../schemas/section.schemas';

interface Props {
  embedded?: boolean;
}

export const SectionListPage = ({ embedded = false }: Props) => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage, dismissError,
  } = useSections();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<Section | null>(null);
  const [deleteItem, setDeleteItem] = useState<Section | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleOpenEdit   = (item: Section) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (values: SectionFormValues) => {
    if (editItem) {
      await update(editItem.section_id, {
        section_name:  values.section_name,
        section_path:  values.section_path,
        section_icon:  values.section_icon,
        section_order: values.section_order,
      });
    } else {
      await create({
        section_name:  values.section_name,
        section_path:  values.section_path,
        section_icon:  values.section_icon,
        section_order: values.section_order,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.section_id);
    setDeleteItem(null);
  };

  const activeCount = items.filter((s) => s.status === 'A').length;

  const inner = (
    <>
      {/* Header row */}
      <div className="gng-page-header" style={{ marginBottom: 0 }}>
        <div>
          {!embedded && <h1 className="gng-page-title">Section Management</h1>}
          {!embedded && (
            <p className="gng-page-subtitle">
              Manage navigation sections and access control for the admin panel.
            </p>
          )}
        </div>
        <button type="button" className="gng-btn-primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Add Section
        </button>
      </div>

      {/* Stat cards */}
      {!embedded && (
        <div className="gng-stats-row">
          <div className="gng-stat-card">
            <div className="gng-stat-icon gng-stat-icon-purple">
              <i className="fa-solid fa-rectangle-list" />
            </div>
            <div className="gng-stat-info">
              <p className="gng-stat-label">Total Sections</p>
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
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <div className="gng-stat-info">
              <p className="gng-stat-label">Inactive</p>
              <p className="gng-stat-value">
                {isLoading ? '—' : items.filter((s) => s.status === 'I').length}
              </p>
            </div>
          </div>
          <div className="gng-stat-card">
            <div className="gng-stat-icon gng-stat-icon-blue">
              <i className="fa-solid fa-arrows-up-down" />
            </div>
            <div className="gng-stat-info">
              <p className="gng-stat-label">Max Order</p>
              <p className="gng-stat-value">
                {isLoading ? '—' : items.length > 0 ? Math.max(...items.map((s) => s.section_order)) : 0}
              </p>
            </div>
          </div>
        </div>
      )}

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
            <input type="text" placeholder="Search sections..." className="gng-search-input" />
          </div>
        </div>
        <div className="gng-toolbar-right">
          <button type="button" className="gng-btn-secondary">
            <i className="fa-solid fa-filter" /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <SectionTable
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
      <SectionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editItem={editItem}
        isSubmitting={isSubmitting}
      />

      {/* Delete confirm */}
      {deleteItem && (
        <div className="gng-confirm-overlay">
          <div className="gng-confirm-box">
            <div className="gng-confirm-icon"><i className="fa-solid fa-trash-can" /></div>
            <p className="gng-confirm-title">Delete Section</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">"{deleteItem.section_name}"</span>?
              This may affect role permissions.
            </p>
            <div className="gng-confirm-actions">
              <button type="button" className="gng-confirm-cancel" onClick={() => setDeleteItem(null)}>
                Cancel
              </button>
              <button type="button" className="gng-btn-danger" onClick={handleDelete} disabled={isSubmitting}>
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Deleting…</>
                  : <><i className="fa-solid fa-trash-can" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{inner}</div>;

  return (
    <div className="gng-page">
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Sections</span>
      </nav>
      {inner}
    </div>
  );
};

export default SectionListPage;