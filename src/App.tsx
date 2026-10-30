import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.tsx';
import GuestRoute from './components/GuestRoute.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { useCurrentAdmin } from './hooks/useAuth.ts';
import ComingNextPage from './pages/ComingNextPage.tsx';
import CategoriesPage from './pages/CategoriesPage.tsx';
import CustomerDetailPage from './pages/CustomerDetailPage.tsx';
import CustomerFormPage from './pages/CustomerFormPage.tsx';
import CustomersPage from './pages/CustomersPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import ProductFormPage from './pages/ProductFormPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
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
          <Route path={routes.root} element={<DashboardPage />} />
          <Route path={routes.customers} element={<CustomersPage />} />
          <Route path={routes.customerNew} element={<CustomerFormPage />} />
          <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path={routes.products} element={<ProductsPage />} />
          <Route path={routes.productNew} element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path={routes.categories} element={<CategoriesPage />} />
          <Route path={routes.orders} element={<ComingNextPage name="Orders" />} />
          <Route path={routes.coupons} element={<ComingNextPage name="Coupons" />} />
          <Route path="/content" element={<ComingNextPage name="Content" />} />
          <Route path="/reports" element={<ComingNextPage name="Reports" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={routes.root} replace />} />
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
