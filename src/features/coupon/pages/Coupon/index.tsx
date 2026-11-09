import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useCoupons } from '../../hooks/useCoupons';
import { CouponTable } from '../../components/CouponTable';
import { CouponFormModal } from '../../components/CouponFormModal';
import type { Coupon } from '../../../../domain/entities/Coupon';
import type { CouponFormValues } from '../../schemas/coupon.schemas';

const CouponPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, create, update, remove, changePage, dismissError,
  } = useCoupons();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState<Coupon | null>(null);
  const [deleteItem, setDeleteItem] = useState<Coupon | null>(null);
  const [search,     setSearch]     = useState('');

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (q: string) => {
    setSearch(q);
    fetch({ page: 1, limit: 10, search: q });
  };

  const handleOpenCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleOpenEdit   = (item: Coupon) => { setEditItem(item); setModalOpen(true); };

  const handleSubmit = async (values: CouponFormValues) => {
    const validFrom  = values.valid_from  ? dayjs(values.valid_from).toISOString()  : new Date().toISOString();
    const validUntil = values.valid_until ? dayjs(values.valid_until).toISOString() : null;

    if (editItem) {
      await update(editItem.coupon_id, {
        description:      values.description,
        discount_type:    values.discount_type,
        discount_value:   values.discount_value,
        min_order_amount: values.min_order_amount,
        max_uses:         values.max_uses ?? null,
        valid_from:       validFrom,
        valid_until:      validUntil,
      });
    } else {
      await create({
        code:             values.code.toUpperCase(),
        description:      values.description,
        discount_type:    values.discount_type,
        discount_value:   values.discount_value,
        min_order_amount: values.min_order_amount,
        max_uses:         values.max_uses ?? null,
        valid_from:       validFrom,
        valid_until:      validUntil,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.coupon_id);
    setDeleteItem(null);
  };

  const activeCount  = items.filter((c) => c.status === 'A').length;
  const expiredCount = items.filter((c) => c.valid_until && dayjs(c.valid_until).isBefore(dayjs())).length;
  const totalUses    = items.reduce((sum, c) => sum + c.used_count, 0);

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Coupons</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Coupon Management</h1>
          <p className="gng-page-subtitle">
            Create and manage discount coupons for your customers.
          </p>
        </div>
        <button type="button" className="gng-btn-primary" onClick={handleOpenCreate}>
          <i className="fa-solid fa-plus" /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-ticket" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Coupons</p>
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
            <i className="fa-solid fa-clock-rotate-left" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Expired</p>
            <p className="gng-stat-value">{isLoading ? '—' : expiredCount}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-arrow-pointer" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Uses</p>
            <p className="gng-stat-value">{isLoading ? '—' : totalUses}</p>
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
              placeholder="Search by code or description..."
              className="gng-search-input"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="gng-toolbar-right">
          <button type="button" className="gng-btn-secondary" onClick={() => fetch({ page: 1, limit: 10, status: 'A' })}>
            <i className="fa-solid fa-filter" /> Active Only
          </button>
          <button type="button" className="gng-btn-secondary" onClick={() => fetch({ page: 1, limit: 10 })}>
            <i className="fa-solid fa-rotate" /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <CouponTable
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
      <CouponFormModal
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
            <div className="gng-confirm-icon">
              <i className="fa-solid fa-trash-can" />
            </div>
            <p className="gng-confirm-title">Delete Coupon</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete coupon{' '}
              <span className="gng-confirm-name">"{deleteItem.code}"</span>?
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
    </div>
  );
};

export default CouponPage;
