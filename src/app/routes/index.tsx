import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthLayout }     from '../../shared/layouts/AuthLayout';
import { AdminLayout }    from '../../shared/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner/index';

const LoginPage           = lazy(() => import('../../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage  = lazy(() => import('../../features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage   = lazy(() => import('../../features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const DashboardPage       = lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const CategoryListPage    = lazy(() => import('../../features/catalog/pages/Category'));
const AttributeListPage   = lazy(() => import('../../features/catalog/pages/Attribute'));
const AttributeValuesPage = lazy(() => import('../../features/catalog/pages/AttributeValues'));
const ProductListPage     = lazy(() => import('../../features/catalog/pages/Product'));
const ProductVariantsPage = lazy(() => import('../../features/catalog/pages/ProductVariants'));
const SectionListPage     = lazy(() => import('../../features/employee/pages/Section'));
const PageListPage        = lazy(() => import('../../features/employee/pages/Page'));
const RoleListPage        = lazy(() => import('../../features/employee/pages/Role'));

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  {
    path: '/auth',
    element: <Suspense fallback={<LoadingSpinner />}><AuthLayout /></Suspense>,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: 'login',           element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password',  element: <ResetPasswordPage /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/dashboard',                        element: <Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense>       },
          { path: '/category',                          element: <Suspense fallback={<LoadingSpinner />}><CategoryListPage /></Suspense>    },
          { path: '/attributes',                        element: <Suspense fallback={<LoadingSpinner />}><AttributeListPage /></Suspense>   },
          { path: '/attributes/:attributeId/values',    element: <Suspense fallback={<LoadingSpinner />}><AttributeValuesPage /></Suspense> },
          { path: '/products',                          element: <Suspense fallback={<LoadingSpinner />}><ProductListPage /></Suspense>     },
          { path: '/products/:productId/variants',      element: <Suspense fallback={<LoadingSpinner />}><ProductVariantsPage /></Suspense> },
          { path: '/sections',                          element: <Suspense fallback={<LoadingSpinner />}><SectionListPage /></Suspense>     },
          { path: '/pages',                             element: <Suspense fallback={<LoadingSpinner />}><PageListPage /></Suspense>        },
          { path: '/roles',                             element: <Suspense fallback={<LoadingSpinner />}><RoleListPage /></Suspense>        },
          { path: '/orders',     element: <div>Orders — coming soon</div>     },
          { path: '/customers',  element: <div>Customers — coming soon</div>  },
          { path: '/employees',  element: <div>Employees — coming soon</div>  },
          { path: '/inventory',  element: <div>Inventory — coming soon</div>  },
          { path: '/reports',    element: <div>Reports — coming soon</div>    },
          { path: '/settings',   element: <div>Settings — coming soon</div>   },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;