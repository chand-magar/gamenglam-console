import { useState, useEffect, useRef } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { OrderTable } from '../../components/OrderTable';
import { OrderDetailModal } from '../../components/OrderDetailModal';
import type { Order, OrderStatus } from '../../../../domain/entities/Order';
import { ORDER_STATUS_MAP } from '../../../../domain/entities/Order';
import axiosInstance from '../../../../core/api/axiosInstance';

interface OrderStats {
  total_orders:     number;
  total_revenue:    number;
  orders_by_status: { status: string; count: number }[];
}

const OrderListPage = () => {
  const {
    items, total, page, totalPages,
    selectedOrder, orderHistory,
    isLoading, isDetailLoading, isSubmitting, error,
    fetch, fetchDetail, updateStatus, clearSelected,
    changePage, dismissError,
  } = useOrders();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [stats,        setStats]        = useState<OrderStats | null>(null);

  const hasFetched    = useRef(false);
  const isFirstFilter = useRef(true);
  const searchTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load + stats
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
    axiosInstance.get<{ data: OrderStats }>('/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => {/* non-critical */});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when status filter changes
  useEffect(() => {
    if (isFirstFilter.current) { isFirstFilter.current = false; return; }
    fetch({ page: 1, limit: 10, order_status: statusFilter as OrderStatus | '', search });
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetch({ page: 1, limit: 10, order_status: statusFilter as OrderStatus | '', search: value });
    }, 300);
  };

  const handleView = async (order: Order) => {
    await fetchDetail(order.order_id);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    clearSelected();
  };

  const handleUpdateStatus = async (
    orderId: string,
    status: OrderStatus,
    note?: string,
  ): Promise<void> => {
    await updateStatus(orderId, {
      to_status:  status,
      note:       note ?? null,
      changed_by: null,
    }).unwrap();
  };

  const statPending  = stats?.orders_by_status.find((s) => s.status === 'pending')?.count  ?? 0;
  const statShipped  = stats?.orders_by_status.find((s) => s.status === 'shipped')?.count  ?? 0;
  const statRevenue  = stats?.total_revenue ?? 0;
  const statTotal    = stats?.total_orders  ?? total;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Orders</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Order Management</h1>
          <p className="gng-page-subtitle">
            Track, manage and update customer orders.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-bag-shopping" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Orders</p>
            <p className="gng-stat-value">{isLoading && !stats ? '—' : statTotal}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-clock" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Pending</p>
            <p className="gng-stat-value">{!stats ? '—' : statPending}</p>
          </div>
          {statPending > 0 && <span className="gng-stat-badge">Action needed</span>}
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-truck" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Shipped</p>
            <p className="gng-stat-value">{!stats ? '—' : statShipped}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-green">
            <i className="fa-solid fa-indian-rupee-sign" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Revenue</p>
            <p className="gng-stat-value">
              {!stats ? '—' : `₹${(statRevenue / 1000).toFixed(1)}K`}
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
              placeholder="Search by order ref..."
              className="gng-search-input"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <select
            className="gng-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {Object.entries(ORDER_STATUS_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          {(statusFilter || search) && (
            <button
              type="button"
              className="gng-btn-link"
              onClick={() => {
                setStatusFilter('');
                setSearch('');
                fetch({ page: 1, limit: 10 });
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <OrderTable
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onView={handleView}
        onPageChange={changePage}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        open={modalOpen}
        onClose={handleClose}
        order={selectedOrder}
        history={orderHistory}
        isLoading={isDetailLoading}
        isSubmitting={isSubmitting}
        error={error}
        onUpdateStatus={handleUpdateStatus}
      />

    </div>
  );
};

export default OrderListPage;
