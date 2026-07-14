import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { Permission } from '../../core/constants/permissions';

interface Props {
  permission: Permission;
  children: React.ReactNode;
}

export const RoleGuard = ({ permission, children }: Props) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : <Navigate to="/403" replace />;
};