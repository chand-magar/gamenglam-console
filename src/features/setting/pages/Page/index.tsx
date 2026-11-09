import { useState, useEffect, useRef } from 'react';
import { usePages } from '../../hooks/usePages';
import { useSections } from '../../hooks/useSections';
import { PageTable } from '../../components/PageTable';
import { PageFormModal } from '../../components/PageFormModal';
import type { Page } from '../../../../domain/entities/Page';
import type { PageFormValues } from '../../schemas/page.schemas';

const PageListPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage, dismissError,
  } = usePages();

  const { items: sections, fetch: fetchSections } = useSections();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<Page | null>(null);
  const [deleteItem, setDeleteItem] = useState<Page | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
    fetchSections({ page: 1, limit: 100 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleOpenEdit   = (item: Page) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (values: PageFormValues) => {
    if (editItem) {
      await update(editItem.page_id, {
        section_no: values.section_no,
        page_name:  values.page_name,
        page_path:  values.page_path,
        page_order: values.page_order,
      });
    } else {
      await create({
        section_no: values.section_no,
        page_name:  values.page_name,
        page_path:  values.page_path,
        page_order: values.page_order,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.page_id);
    setDeleteItem(null);
  };

  const activeCount = items.filter((p:any) => p.status === 'A').length;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Pages</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Page Management</h1>
          <p className="gng-page-subtitle">
            Manage navigation pages and their section assignments.
          </p>
        </div>
        <button type="button" className="gng-btn-primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Add Page
        </button>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-file-lines" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Pages</p>
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
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-rectangle-list" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Sections</p>
            <p className="gng-stat-value">{isLoading ? '—' : sections.length}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Inactive</p>
            <p className="gng-stat-value">
              {isLoading ? '—' : items.filter((p:any) => p.status === 'I').length}
            </p>
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
              placeholder="Search pages..."
              className="gng-search-input"
            />
          </div>
          <select className="gng-filter-select">
            <option value="">All Sections</option>
            {sections.map((s:any) => (
              <option key={s.section_no} value={s.section_no}>
                {s.section_name}
              </option>
            ))}
          </select>
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
      <PageTable
        items={items}
        sections={sections}
        total={total}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteItem}
        onPageChange={changePage}
      />

      {/* Form Modal */}
      <PageFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        sections={sections}
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
            <p className="gng-confirm-title">Delete Page</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">"{deleteItem.page_name}"</span>?
              This may affect role permissions.
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

export default PageListPage;