import { useEffect, useState } from 'react';
import axiosInstance from '../../../core/api/axiosInstance';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderStatusCount {
  status: string;
  count:  number;
}

interface RecentOrder {
  order_id:     string;
  order_ref:    string;
  customer_name:string;
  total:        number;
  order_status: string;
  created_at:   string;
}

interface DashboardStats {
  total_orders:    number;
  total_revenue:   number;
  total_customers: number;
  low_stock_count: number;
  orders_by_status:OrderStatusCount[];
  recent_orders:   RecentOrder[];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

function useDashboardStats() {
  const [stats,     setStats]     = useState<DashboardStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    axiosInstance.get<{ data: DashboardStats }>('/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending:    '#F59E0B',
  confirmed:  '#3B82F6',
  processing: '#8B5CF6',
  shipped:    '#06B6D4',
  delivered:  '#10B981',
  cancelled:  '#EF4444',
  returned:   '#6B7280',
};

const STATUS_TOTAL = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="gng-card" style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ fontSize:12, color:'#6B7280', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color: accent ?? 'var(--gng-text-primary, #111827)', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#9CA3AF' }}>{sub}</div>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div style={{ padding:32, color:'#6B7280', fontSize:14 }}>Loading dashboard…</div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ padding:32, color:'#EF4444', fontSize:14 }}>{error || 'No data available.'}</div>
    );
  }

  const totalStatusOrders = stats.orders_by_status.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div>
        <h5 style={{ fontWeight:700, marginBottom:4 }}>Dashboard Overview</h5>
        <p style={{ color:'#6B7280', fontSize:14, margin:0 }}>Real-time store performance metrics.</p>
      </div>

      {/* Metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16 }}>
        <MetricCard
          label="Total Orders"
          value={stats.total_orders.toLocaleString()}
        />
        <MetricCard
          label="Total Revenue"
          value={`₹${Number(stats.total_revenue).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}`}
          accent="#10B981"
        />
        <MetricCard
          label="Customers"
          value={stats.total_customers.toLocaleString()}
        />
        <MetricCard
          label="Low Stock Variants"
          value={stats.low_stock_count.toLocaleString()}
          sub="stock_qty < 10"
          accent={stats.low_stock_count > 0 ? '#EF4444' : '#10B981'}
        />
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:16 }}>

        {/* Orders by status */}
        <div className="gng-card">
          <div style={{ fontWeight:600, fontSize:14, marginBottom:16 }}>Orders by Status</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {STATUS_TOTAL.map((status) => {
              const row   = stats.orders_by_status.find((r) => r.status === status);
              const count = row?.count ?? 0;
              const pct   = Math.round((count / totalStatusOrders) * 100);
              return (
                <div key={status}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                    <span style={{ textTransform:'capitalize', color:'#374151' }}>{status}</span>
                    <span style={{ fontWeight:600, color:'#111827' }}>{count}</span>
                  </div>
                  <div style={{ height:6, borderRadius:4, background:'#F3F4F6', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: STATUS_COLOR[status] ?? '#9CA3AF', borderRadius:4, transition:'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div className="gng-card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', fontWeight:600, fontSize:14, borderBottom:'1px solid #F3F4F6' }}>
            Recent Orders
          </div>
          {stats.recent_orders.length === 0 ? (
            <div style={{ padding:24, color:'#9CA3AF', fontSize:13, textAlign:'center' }}>No orders yet.</div>
          ) : (
            <table className="gng-table" style={{ margin:0 }}>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th style={{ textAlign:'right' }}>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((o) => (
                  <tr key={o.order_id}>
                    <td style={{ fontWeight:600, fontSize:13 }}>{o.order_ref}</td>
                    <td style={{ fontSize:13 }}>{o.customer_name}</td>
                    <td>
                      <span
                        style={{
                          display:'inline-block',
                          padding:'2px 8px',
                          borderRadius:999,
                          fontSize:11,
                          fontWeight:600,
                          textTransform:'capitalize',
                          background: (STATUS_COLOR[o.order_status] ?? '#9CA3AF') + '20',
                          color: STATUS_COLOR[o.order_status] ?? '#6B7280',
                        }}
                      >
                        {o.order_status}
                      </span>
                    </td>
                    <td style={{ textAlign:'right', fontWeight:600, fontSize:13 }}>
                      ₹{Number(o.total).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}
                    </td>
                    <td style={{ fontSize:12, color:'#9CA3AF' }}>
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
