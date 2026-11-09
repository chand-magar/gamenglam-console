import { useState, useEffect, useRef } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { UserTable } from '../../components/UserTable';
import { UserFormModal } from '../../components/UserFormModal';
import type { User } from '../../../../domain/entities/User';
import type { CreateUserFormValues, UpdateUserFormValues } from '../../schemas/user.schemas';

interface Props {
  embedded?: boolean;
}

export const UserListPage = ({ embedded = false }: Props) => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage, dismissError,
  } = useUsers();

  const { items: roles, fetch: fetchRoles } = useRoles();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<User | null>(null);
  const [deleteItem, setDeleteItem] = useState<User | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
    fetchRoles({ page: 1, limit: 100 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleOpenEdit   = (item: User) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (values: CreateUserFormValues | UpdateUserFormValues) => {
    if (editItem) {
      const v = values as UpdateUserFormValues;
      await update(editItem.profile_id, {
        user_fullname: v.user_fullname,
        email_id:      v.email_id,
        gender:        v.gender || null,
        mobile_no:     v.mobile_no,
        address:       v.address,
      });
    } else {
      const v = values as CreateUserFormValues;
      await create({
        user_fullname: v.user_fullname,
        email_id:      v.email_id,
        mobile_no:     v.mobile_no,
        gender:        v.gender || null,
        role_no:       v.role_no,
        password:      v.password,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.profile_id);
    setDeleteItem(null);
  };

  const activeCount = items.filter((u) => u.status === 'A').length;

  const inner = (
    <>
      <div className="gng-page-header" style={{ marginBottom: 0 }}>
        <div>
          {!embedded && <h1 className="gng-page-title">User Management</h1>}
        </div>
        <button type="button" className="gng-btn-primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Add User
        </button>
      </div>

      {!embedded && (
        <div className="gng-stats-row">
          <div className="gng-stat-card">
            <div className="gng-stat-icon gng-stat-icon-purple">
              <i className="fa-solid fa-users" />
            </div>
            <div className="gng-stat-info">
              <p className="gng-stat-label">Total Users</p>
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
              <i className="fa-solid fa-id-badge" />
            </div>
            <div className="gng-stat-info">
              <p className="gng-stat-label">Roles</p>
              <p className="gng-stat-value">{isLoading ? '—' : roles.length}</p>
            </div>
          </div>
          <div className="gng-stat-card">
            <div className="gng-stat-icon gng-stat-icon-orange">
              <i className="fa-solid fa-user-xmark" />
            </div>
            <div className="gng-stat-info">
              <p className="gng-stat-label">Inactive</p>
              <p className="gng-stat-value">
                {isLoading ? '—' : items.filter((u) => u.status === 'I').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="gng-error-alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button type="button" className="gng-error-dismiss" onClick={dismissError}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      <div className="gng-toolbar">
        <div className="gng-toolbar-left">
          <div className="gng-search-wrapper">
            <i className="fa-solid fa-magnifying-glass" />
            <input type="text" placeholder="Search users..." className="gng-search-input" />
          </div>
          <select className="gng-filter-select">
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.role_no} value={r.role_no}>{r.role_name}</option>
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

      <UserTable
        items={items}
        roles={roles}
        total={total}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteItem}
        onPageChange={changePage}
      />

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        roles={roles}
        editItem={editItem}
        isSubmitting={isSubmitting}
      />

      {deleteItem && (
        <div className="gng-confirm-overlay">
          <div className="gng-confirm-box">
            <div className="gng-confirm-icon"><i className="fa-solid fa-trash-can" /></div>
            <p className="gng-confirm-title">Delete User</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">"{deleteItem.user_fullname}"</span>?
              This action cannot be undone.
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
        <span className="gng-crumb-active">Users</span>
      </nav>
      {inner}
    </div>
  );
};

export default UserListPage;