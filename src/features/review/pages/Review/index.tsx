import { useState, useEffect, useRef } from 'react';
import { useReviews } from '../../hooks/useReviews';
import { ReviewTable } from '../../components/ReviewTable';
import type { Review } from '../../../../domain/entities/Review';

const RATING_OPTIONS = [
  { value: '',  label: 'All Ratings' },
  { value: '5', label: '★★★★★ (5)' },
  { value: '4', label: '★★★★☆ (4)' },
  { value: '3', label: '★★★☆☆ (3)' },
  { value: '2', label: '★★☆☆☆ (2)' },
  { value: '1', label: '★☆☆☆☆ (1)' },
];

const ReviewPage = () => {
  const {
    items, total, page, totalPages,
    isLoading, isSubmitting, error,
    fetch, remove, changePage, dismissError,
  } = useReviews();

  const [deleteItem, setDeleteItem] = useState<Review | null>(null);
  const [search,     setSearch]     = useState('');
  const [rating,     setRating]     = useState('');

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetch({ page: 1, limit: 10 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = (overrides: { search?: string; rating?: string }) => {
    const s = overrides.search  !== undefined ? overrides.search  : search;
    const r = overrides.rating  !== undefined ? overrides.rating  : rating;
    fetch({ page: 1, limit: 10, search: s || undefined, rating: r ? Number(r) : undefined });
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    applyFilters({ search: q });
  };

  const handleRating = (r: string) => {
    setRating(r);
    applyFilters({ rating: r });
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.review_id);
    setDeleteItem(null);
  };

  const avgRating = items.length
    ? (items.reduce((sum, r) => sum + r.rating, 0) / items.length).toFixed(1)
    : '—';

  const fiveStarCount = items.filter((r) => r.rating === 5).length;
  const lowRatingCount = items.filter((r) => r.rating <= 2).length;

  return (
    <div className="gng-page">

      {/* Breadcrumb */}
      <nav className="gng-breadcrumb">
        <span className="gng-crumb-link">Dashboard</span>
        <i className="fa-solid fa-chevron-right" />
        <span className="gng-crumb-active">Reviews</span>
      </nav>

      {/* Header */}
      <div className="gng-page-header">
        <div>
          <h1 className="gng-page-title">Customer Reviews</h1>
          <p className="gng-page-subtitle">
            Monitor and moderate customer product reviews.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="gng-stats-row">
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-purple">
            <i className="fa-solid fa-star" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Total Reviews</p>
            <p className="gng-stat-value">{isLoading ? '—' : total}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-green">
            <i className="fa-solid fa-star-half-stroke" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Avg. Rating</p>
            <p className="gng-stat-value">{isLoading ? '—' : avgRating}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-blue">
            <i className="fa-solid fa-face-smile" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">5-Star Reviews</p>
            <p className="gng-stat-value">{isLoading ? '—' : fiveStarCount}</p>
          </div>
        </div>
        <div className="gng-stat-card">
          <div className="gng-stat-icon gng-stat-icon-orange">
            <i className="fa-solid fa-face-frown" />
          </div>
          <div className="gng-stat-info">
            <p className="gng-stat-label">Low Ratings (≤2)</p>
            <p className="gng-stat-value">{isLoading ? '—' : lowRatingCount}</p>
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
              placeholder="Search by product, customer, or review text..."
              className="gng-search-input"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="gng-toolbar-right">
          <select
            className="gng-select"
            style={{ minWidth: 150 }}
            value={rating}
            onChange={(e) => handleRating(e.target.value)}
          >
            {RATING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button type="button" className="gng-btn-secondary" onClick={() => {
            setSearch(''); setRating('');
            fetch({ page: 1, limit: 10 });
          }}>
            <i className="fa-solid fa-rotate" /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <ReviewTable
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
            <p className="gng-confirm-title">Delete Review</p>
            <p className="gng-confirm-text">
              Are you sure you want to delete this review by{' '}
              <span className="gng-confirm-name">"{deleteItem.customer_name}"</span>?
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

export default ReviewPage;
