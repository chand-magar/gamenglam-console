import { useState, useEffect, useRef } from 'react';
import { useRoles } from '../../hooks/useRoles';
import { useSections } from '../../hooks/useSections';
import { usePages } from '../../hooks/usePages';
import { RoleTable } from '../../components/RoleTable';
import { RoleFormModal } from '../../components/RoleFormModal';
import type { Role } from '../../../../domain/entities/Role';
import type { RoleFormValues } from '../../schemas/role.schemas';

const RoleListPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage, dismissError,
  } = useRoles();

  const { items: sections, fetch: fetchSections } = useSections();
  const { items: allPages, fetch: fetchPages }    = usePages();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<Role | null>(null);
  const [deleteItem, setDeleteItem] = useState<Role | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
    fetchSections({ page: 1, limit: 100 });
    fetchPages({ page: 1, limit: 100 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleOpenEdit   = (item: Role) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (values: RoleFormValues) => {
    if (editItem) {
      await update(editItem.role_id, {
        role_name:    values.role_name,
        role_details: values.role_details,
      });
    } else {
      await create({
        role_name:    values.role_name,
        role_details: values.role_details,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.role_id);
    setDeleteItem(null);
  };

  const activeCount    = items.filter((r) => r.status === 'A').length;
  const totalSections  = new Set(items.flatMap((r) => (r.role_details ?? []).map((s) => s.section_id))).size;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Roles</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Role Management</h1>
          <p className="gng-page-subtitle">
            Define roles and assign section and page level permissions.
          </p>
        </div>
        <button type="button" className="gng-btn-primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Add Role
        </button>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-id-badge" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Roles</p>
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
            <p className="gng-stat-label">Sections Covered</p>
            <p className="gng-stat-value">{isLoading ? '—' : totalSections}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-file-lines" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Available Pages</p>
            <p className="gng-stat-value">{isLoading ? '—' : allPages.length}</p>
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
              placeholder="Search roles..."
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
      <RoleTable
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
      <RoleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        sections={sections}
        pages={allPages}
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
            <p className="gng-confirm-title">Delete Role</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">"{deleteItem.role_name}"</span>?
              Users assigned to this role will lose access.
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

export default RoleListPage;