import { Role } from './roles';

export type Permission =
  | 'products:read' | 'products:write' | 'products:delete'
  | 'orders:read'   | 'orders:write'
  | 'customers:read'| 'customers:write'
  | 'reports:read'
  | 'settings:write';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    'products:read', 'products:write', 'products:delete',
    'orders:read', 'orders:write',
    'customers:read', 'customers:write',
    'reports:read', 'settings:write',
  ],
  [Role.ADMIN]: [
    'products:read', 'products:write',
    'orders:read', 'orders:write',
    'customers:read', 'reports:read',
  ],
  [Role.INVENTORY_MANAGER]: ['products:read', 'products:write'],
  [Role.CUSTOMER_SUPPORT]:  ['orders:read', 'customers:read', 'customers:write'],
  [Role.SELLER]:            ['products:read'],
};