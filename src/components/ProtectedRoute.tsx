import { Navigate, Outlet } from 'react-router-dom';
import { protectedSessionGate } from '../lib/session.ts';
import { useAuthStore } from '../store/useAuthStore.ts';
import { routes } from '../routes.ts';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const gate = protectedSessionGate(isLoading, isAuthenticated);

  if (gate === 'loading') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-navy">
        <p className="font-body text-sm text-white/80">Loading…</p>
      </main>
    );
  }

  if (gate === 'redirect-login') return <Navigate to={routes.login} replace />;
  return <Outlet />;
}
