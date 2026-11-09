import dayjs from 'dayjs';
import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import type { Order, OrderStatus, OrderStatusHistory } from '../../../../domain/entities/Order';
import { ORDER_STATUS_MAP, ORDER_STATUS_FLOW } from '../../../../domain/entities/Order';
import styles from './index.module.css';

interface Props {
  open:          boolean;
  onClose:       () => void;
  order:         Order | null;
  history:       OrderStatusHistory[];
  isLoading:     boolean;
  isSubmitting:  boolean;
  error?:        string | null;
  onUpdateStatus:(orderId: string, status: OrderStatus, note?: string) => Promise<void>;
}

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
];

export const OrderDetailModal = ({
  open, onClose, order, history, isLoading, isSubmitting, error, onUpdateStatus,
}: Props) => {
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [note,      setNote]      = useState('');

  if (!order) return null;

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    try {
      await onUpdateStatus(order.order_id, newStatus, note || undefined);
      setNewStatus('');
      setNote('');
    } catch {
      // error surfaced via the `error` prop from Redux
    }
  };

  const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.order_status);
  const isFinal = order.order_status === 'cancelled' || order.order_status === 'refunded';
  const statusMeta = ORDER_STATUS_MAP[order.order_status];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Order ${order.order_ref}`}
      subtitle={`Placed on ${dayjs(order.created_at).format('MMM DD, YYYY HH:mm')}`}
      icon="fa-solid fa-bag-shopping"
      variant="default"
      size="lg"
      footer={{
        cancelLabel:  'Close',
        confirmLabel: 'Update Status',
        confirmIcon:  'fa-solid fa-rotate',
        isSubmitting,
        onConfirm:    handleUpdateStatus,
      }}
    >
      {isLoading ? (
        <div className={styles.loading}>
          <i className="fa-solid fa-spinner fa-spin" /> Loading order details…
        </div>
      ) : (
        <div className={styles.body}>

          {/* ── Status tracker or final state banner ─────── */}
          {isFinal ? (
            <div className={`${styles.finalBanner} ${order.order_status === 'cancelled' ? styles.finalBannerCancelled : styles.finalBannerRefunded}`}>
              <div className={styles.finalIcon}>
                <i className={`fa-solid ${statusMeta.icon}`} />
              </div>
              <div>
                <p className={styles.finalTitle}>Order {statusMeta.label}</p>
                <p className={styles.finalSub}>
                  {order.order_status === 'cancelled'
                    ? 'This order has been cancelled and is no longer active.'
                    : 'This order has been refunded.'}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.progressRow}>
              {ORDER_STATUS_FLOW.map((status, i) => {
                const done    = i <= currentStatusIndex;
                const current = i === currentStatusIndex;
                const s       = ORDER_STATUS_MAP[status];
                return (
                  <div key={status} className={styles.progressStep}>
                    <div className={`${styles.progressDot} ${done ? styles.progressDotDone : ''} ${current ? styles.progressDotCurrent : ''}`}>
                      <i className={`fa-solid ${s.icon}`} style={{ fontSize: 10 }} />
                    </div>
                    <span className={`${styles.progressLabel} ${done ? styles.progressLabelDone : ''}`}>
                      {s.label}
                    </span>
                    {i < ORDER_STATUS_FLOW.length - 1 && (
                      <div className={`${styles.progressLine} ${i < currentStatusIndex ? styles.progressLineDone : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Info strip ───────────────────────────────── */}
          <div className={styles.infoStrip}>
            <div className={styles.infoChip}>
              <span className={styles.infoLabel}>
                <i className="fa-solid fa-user" /> Customer
              </span>
              <span className={styles.infoValue}>{order.customer_name || '—'}</span>
            </div>
            <div className={styles.infoDivider} />
            <div className={styles.infoChip}>
              <span className={styles.infoLabel}>
                <i className="fa-solid fa-hashtag" /> Order Ref
              </span>
              <span className={`${styles.infoValue} ${styles.infoMono}`}>{order.order_ref}</span>
            </div>
            <div className={styles.infoDivider} />
            <div className={styles.infoChip}>
              <span className={styles.infoLabel}>
                <i className="fa-solid fa-calendar-days" /> Placed
              </span>
              <span className={styles.infoValue}>
                {dayjs(order.created_at).format('MMM D, YYYY')}
              </span>
            </div>
            <div className={styles.infoDivider} />
            <div className={styles.infoChip}>
              <span className={styles.infoLabel}>Status</span>
              <span className={`gng-badge ${statusMeta.cls}`} style={{ fontSize: 11 }}>
                <i className={`fa-solid ${statusMeta.icon}`} style={{ fontSize: 9 }} />
                {statusMeta.label}
              </span>
            </div>
            {order.notes && (
              <>
                <div className={styles.infoDivider} />
                <div className={`${styles.infoChip} ${styles.infoChipWide}`}>
                  <span className={styles.infoLabel}>
                    <i className="fa-solid fa-note-sticky" /> Notes
                  </span>
                  <span className={styles.infoValue}>{order.notes}</span>
                </div>
              </>
            )}
          </div>

          {/* ── Order items ──────────────────────────────── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <i className="fa-solid fa-box-open" />
              Items
              <span className={styles.sectionCount}>{(order.items ?? []).length}</span>
            </h3>
            <div className={styles.itemsList}>
              {(order.items ?? []).length === 0 ? (
                <div className={styles.itemsEmpty}>No item details available.</div>
              ) : (
                (order.items ?? []).map((item) => (
                  <div key={item.order_item_id} className={styles.itemRow}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className={styles.itemImage}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className={styles.itemImagePlaceholder}>
                        <i className="fa-regular fa-image" />
                      </div>
                    )}
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.product_name}</p>
                      <div className={styles.itemMeta}>
                        <span className="gng-code-tag">{item.sku}</span>
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <span className={styles.itemAttrs}>
                            {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <div className={styles.itemQtyBlock}>
                        <span className={styles.itemUnitPrice}>₹{item.unit_price.toFixed(2)}</span>
                        <span className={styles.itemQty}>× {item.quantity}</span>
                      </div>
                      <span className={styles.itemPrice}>₹{item.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Totals + Update status (side-by-side) ────── */}
          <div className={styles.bottomRow}>

            {/* Totals */}
            <div className={`${styles.section} ${styles.bottomSection}`}>
              <h3 className={styles.sectionTitle}>
                <i className="fa-solid fa-receipt" /> Totals
              </h3>
              <div className={styles.totalsBox}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Delivery Fee</span>
                  <span>{order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee.toFixed(2)}`}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Tax</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className={styles.totalRow}>
                    <span>Discount</span>
                    <span className={styles.totalDiscount}>−₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className={`${styles.totalRow} ${styles.totalRowFinal}`}>
                  <span>Total</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Update status */}
            {!isFinal && (
              <div className={`${styles.section} ${styles.bottomSection}`}>
                <h3 className={styles.sectionTitle}>
                  <i className="fa-solid fa-rotate" /> Update Status
                </h3>
                <div className={styles.updateForm}>
                  {error && (
                    <div className={styles.updateError}>
                      <i className="fa-solid fa-circle-exclamation" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div className={styles.updateField}>
                    <label className={styles.updateLabel}>New Status</label>
                    <select
                      className="gng-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    >
                      <option value="">Select status…</option>
                      {ALL_STATUSES.filter((s) => s !== order.order_status).map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_MAP[s].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.updateField}>
                    <label className={styles.updateLabel}>Note (optional)</label>
                    <input
                      type="text"
                      className="gng-input"
                      placeholder="Add a note…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Status history ───────────────────────────── */}
          {history.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <i className="fa-solid fa-timeline" /> History
                <span className={styles.sectionCount}>{history.length}</span>
              </h3>
              <div className={styles.historyList}>
                {history.map((h, i) => (
                  <div key={h.history_id} className={`${styles.historyRow} ${i === history.length - 1 ? styles.historyRowLast : ''}`}>
                    <div className={styles.historyDotWrap}>
                      <div className={styles.historyDot} />
                      {i < history.length - 1 && <div className={styles.historyLine} />}
                    </div>
                    <div className={styles.historyContent}>
                      <div className={styles.historyHeader}>
                        {h.from_status && (
                          <>
                            <span className={`gng-badge ${ORDER_STATUS_MAP[h.from_status].cls}`} style={{ fontSize: 11 }}>
                              {ORDER_STATUS_MAP[h.from_status].label}
                            </span>
                            <i className="fa-solid fa-arrow-right" style={{ fontSize: 9, color: '#9CA3AF' }} />
                          </>
                        )}
                        <span className={`gng-badge ${ORDER_STATUS_MAP[h.to_status].cls}`} style={{ fontSize: 11 }}>
                          {ORDER_STATUS_MAP[h.to_status].label}
                        </span>
                        <span className={styles.historyDate}>
                          {dayjs(h.changed_at).format('MMM D, YYYY · HH:mm')}
                        </span>
                      </div>
                      {h.note && <p className={styles.historyNote}>{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </Modal>
  );
};
