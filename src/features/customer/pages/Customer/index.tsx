import { useState, useEffect, useRef } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomerTable } from '../../components/CustomerTable';
import type { Customer } from '../../../../domain/entities/Customer';

const CustomerListPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, remove, changePage, dismissError,
  } = useCustomers();

  const [deleteItem,   setDeleteItem]   = useState<Customer | null>(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const hasFetched    = useRef(false);
  const isFirstFilter = useRef(true);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isFirstFilter.current) { isFirstFilter.current = false; return; }
    fetch({ page: 1, limit: 10, status: statusFilter || undefined });
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.customer_id);
    setDeleteItem(null);
  };

  const activeCount   = items.filter((c:any) => c.status === 'A').length;
  const inactiveCount = items.filter((c:any) => c.status === 'I').length;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Customers</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Customer Management</h1>
          <p className="gng-page-subtitle">
            View and manage all registered customers.
          </p>
        </div>
        <button type="button" className="gng-btn-secondary">
          <i className="fa-solid fa-file-export" /> Export
        </button>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-users" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Customers</p>
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
            <i className="fa-solid fa-circle-pause" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Inactive</p>
            <p className="gng-stat-value">{isLoading ? '—' : inactiveCount}</p>
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
              placeholder="Search customers..."
              className="gng-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="gng-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="A">Active</option>
            <option value="I">Inactive</option>
          </select>
        </div>
        <div className="gng-toolbar-right">
          <button type="button" className="gng-btn-secondary">
            <i className="fa-solid fa-filter" /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <CustomerTable
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onDelete={setDeleteItem}
        onPageChange={changePage}
      />

      {/* Delete confirm */}
      {deleteItem && (
        <div className="gng-confirm-overlay">
          <div className="gng-confirm-box">
            <div className="gng-confirm-icon">
              <i className="fa-solid fa-trash-can" />
            </div>
            <p className="gng-confirm-title">Delete Customer</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete{' '}
              <span className="gng-confirm-name">
                "{deleteItem.first_name} {deleteItem.last_name}"
              </span>?
              This action cannot be undone.
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

export default CustomerListPage;