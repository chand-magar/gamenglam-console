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
const SystemSettingsPage  = lazy(() => import('../../features/employee/pages/Settings'));
const EmployeesPage       = lazy(() => import('../../features/employee/pages/Employees'));
const CustomerListPage = lazy(() => import('../../features/customer/pages/Customer'));
const InventoryPage = lazy(() => import('../../features/inventory/pages/Inventory'));
const OrderListPage  = lazy(() => import('../../features/order/pages/Order'));
const CouponListPage  = lazy(() => import('../../features/coupon/pages/Coupon'));
const ReviewListPage      = lazy(() => import('../../features/review/pages/Review'));
const NewsletterListPage  = lazy(() => import('../../features/newsletter/pages/Newsletter'));

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
          { path: '/dashboard',                       element: <Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense>       },
          { path: '/category',                         element: <Suspense fallback={<LoadingSpinner />}><CategoryListPage /></Suspense>    },
          { path: '/attributes',                       element: <Suspense fallback={<LoadingSpinner />}><AttributeListPage /></Suspense>   },
          { path: '/attributes/:attributeId/values',   element: <Suspense fallback={<LoadingSpinner />}><AttributeValuesPage /></Suspense> },
          { path: '/products',                         element: <Suspense fallback={<LoadingSpinner />}><ProductListPage /></Suspense>     },
          { path: '/products/:productId/variants',     element: <Suspense fallback={<LoadingSpinner />}><ProductVariantsPage /></Suspense> },
          { path: '/employees',                        element: <Suspense fallback={<LoadingSpinner />}><EmployeesPage /></Suspense>       },
          { path: '/settings',                         element: <Suspense fallback={<LoadingSpinner />}><SystemSettingsPage /></Suspense>  },
          { path: '/customers', element: <Suspense fallback={<LoadingSpinner />}><CustomerListPage /></Suspense> },
          { path: '/inventory', element: <Suspense fallback={<LoadingSpinner />}><InventoryPage /></Suspense> },
          { path: '/orders',   element: <Suspense fallback={<LoadingSpinner />}><OrderListPage /></Suspense>  },
          { path: '/coupons',  element: <Suspense fallback={<LoadingSpinner />}><CouponListPage /></Suspense>  },
          { path: '/reviews',    element: <Suspense fallback={<LoadingSpinner />}><ReviewListPage /></Suspense>     },
          { path: '/newsletter', element: <Suspense fallback={<LoadingSpinner />}><NewsletterListPage /></Suspense> },
          { path: '/customers', element: <div>Customers — coming soon</div> },
          { path: '/reports',   element: <div>Reports — coming soon</div>   },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;