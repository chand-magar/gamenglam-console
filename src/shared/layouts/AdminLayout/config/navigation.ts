export interface NavItem {
  label:   string;
  path:    string;
  icon:    string;
  badge?:  string;
  bottom?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-gauge-high'                  },
  { label: 'Reports',   path: '/reports',    icon: 'fa-solid fa-chart-line'                 },
  { label: 'Category',  path: '/category',  icon: 'fa-solid fa-sitemap'                     },
  { label: 'Attribute', path: '/attributes', icon: 'fa fa-cogs'                             },
  { label: 'Product',   path: '/products',   icon: 'fa fa-gift'                             },
  { label: 'Inventory', path: '/inventory',  icon: 'fa-solid fa-boxes-stacked'              },
  { label: 'Customers', path: '/customers', icon: 'fa-solid fa-users' },
  { label: 'Orders',    path: '/orders',     icon: 'fa-solid fa-cart-shopping', badge: '12' },
  { label: 'Coupons',   path: '/coupons',    icon: 'fa-solid fa-ticket'                     },
  { label: 'Reviews',    path: '/reviews',    icon: 'fa-solid fa-star'                       },
  { label: 'Newsletter', path: '/newsletter', icon: 'fa-solid fa-envelope'                   },
  { label: 'Employees', path: '/employees',  icon: 'fa-solid fa-user-tie'                   },
  { label: 'Settings',  path: '/settings',   icon: 'fa-solid fa-gear', bottom: true         },
];