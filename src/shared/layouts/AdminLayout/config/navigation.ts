export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
  bottom?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-gauge-high'                       },
  { label: 'Category',  path: '/category',  icon: 'fa-solid fa-sitemap'                          },
  { label: 'Attribute', path: '/attributes', icon: 'fa fa-cogs'                                  },
  { label: 'Product',   path: '/products',   icon: 'fa fa-gift'                                  },
  { label: 'Sections',  path: '/sections',   icon: 'fa-solid fa-rectangle-list'                  },
  { label: 'Pages',     path: '/pages',      icon: 'fa-solid fa-file-lines'                      },
  { label: 'Roles',     path: '/roles',      icon: 'fa-solid fa-id-badge'                        },
  { label: 'Orders',    path: '/orders',     icon: 'fa-solid fa-cart-shopping', badge: '12'       },
  { label: 'Customers', path: '/customers',  icon: 'fa-solid fa-users'                           },
  { label: 'Employees', path: '/employees',  icon: 'fa-solid fa-user-tie'                        },
  { label: 'Inventory', path: '/inventory',  icon: 'fa-solid fa-boxes-stacked'                   },
  { label: 'Reports',   path: '/reports',    icon: 'fa-solid fa-chart-line'                      },
  { label: 'Settings',  path: '/settings',   icon: 'fa-solid fa-gear',          bottom: true      },
];