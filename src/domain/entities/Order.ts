export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  order_item_id: string;
  product_name:  string;
  sku:           string;
  attributes?:   Record<string, string> | null;
  quantity:      number;
  unit_price:    number;
  total_price:   number;
  image_url?:    string | null;
}

export interface Order {
  order_no:      number;
  order_id:      string;
  customer_name: string;
  item_count?:   number;
  order_ref:     string;
  subtotal:     number;
  discount:     number;
  tax:          number;
  delivery_fee: number;
  total:        number;
  order_status: OrderStatus;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
  items:        OrderItem[];
}

export interface OrderStatusHistory {
  history_no:  number;
  history_id:  string;
  order_no:    number;
  from_status: OrderStatus | null;
  to_status:   OrderStatus;
  changed_by:  number | null;
  note:        string | null;
  changed_at:  string;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; cls: string; icon: string }> = {
  pending:    { label: 'Pending',    cls: 'gng-badge-draft',    icon: 'fa-clock'          },
  confirmed:  { label: 'Confirmed',  cls: 'gng-badge-blue',     icon: 'fa-circle-check'   },
  processing: { label: 'Processing', cls: 'gng-badge-purple',   icon: 'fa-gear'           },
  shipped:    { label: 'Shipped',    cls: 'gng-badge-orange',   icon: 'fa-truck'          },
  delivered:  { label: 'Delivered',  cls: 'gng-badge-active',   icon: 'fa-box'            },
  cancelled:  { label: 'Cancelled',  cls: 'gng-badge-deleted',  icon: 'fa-circle-xmark'   },
  refunded:   { label: 'Refunded',   cls: 'gng-badge-inactive', icon: 'fa-rotate-left'    },
};