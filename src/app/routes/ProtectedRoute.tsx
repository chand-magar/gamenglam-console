import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../core/hooks/useAppSelector';
import { selectIsAuthenticated } from '../../features/auth/store/authSelectors';

export const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};