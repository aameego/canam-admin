import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.tsx';
import GuestRoute from './components/GuestRoute.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import RequirePermission from './components/RequirePermission.tsx';
import { useCurrentAdmin } from './hooks/useAuth.ts';
import CategoriesPage from './pages/CategoriesPage.tsx';
import CouponDetailPage from './pages/CouponDetailPage.tsx';
import CouponFormPage from './pages/CouponFormPage.tsx';
import CouponsPage from './pages/CouponsPage.tsx';
import OrderDetailPage from './pages/OrderDetailPage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';
import CustomerDetailPage from './pages/CustomerDetailPage.tsx';
import CustomerFormPage from './pages/CustomerFormPage.tsx';
import CustomersPage from './pages/CustomersPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import ProductFormPage from './pages/ProductFormPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import RoleFormPage from './pages/RoleFormPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import { routes } from './routes.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

const Session = () => {
  useCurrentAdmin();
  return null;
};

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path={routes.login} element={<LoginPage />} />
        <Route path={routes.resetPassword} element={<ResetPasswordPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route element={<RequirePermission anyOf={['dashboard.view']} />}>
            <Route path={routes.root} element={<DashboardPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['customers.view']} />}>
            <Route path={routes.customers} element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['customers.edit']} />}>
            <Route path={routes.customerNew} element={<CustomerFormPage />} />
            <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['products.view']} />}>
            <Route path={routes.products} element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['products.create']} />}>
            <Route path={routes.productNew} element={<ProductFormPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['products.edit']} />}>
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path={routes.categories} element={<CategoriesPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['orders.view']} />}>
            <Route path={routes.orders} element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['coupons.view']} />}>
            <Route path={routes.coupons} element={<CouponsPage />} />
            <Route path="/coupons/:id" element={<CouponDetailPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['coupons.create']} />}>
            <Route path={routes.couponNew} element={<CouponFormPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['coupons.edit']} />}>
            <Route path="/coupons/:id/edit" element={<CouponFormPage />} />
          </Route>
          <Route element={<RequirePermission anyOf={['settings.manage']} />}>
            <Route path={routes.settings} element={<SettingsPage />} />
            <Route path={routes.roleNew} element={<RoleFormPage />} />
            <Route path="/settings/roles/:id" element={<RoleFormPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Session />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
