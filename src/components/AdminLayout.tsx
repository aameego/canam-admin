import { useEffect, useRef, useState, type Ref } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAdminLogout } from '../hooks/useAuth.ts';
import {
  ADMIN_CONTENT_CLASS,
  ADMIN_DRAWER_CLASS,
  ADMIN_MAIN_CLASS,
  ADMIN_NAV_ITEMS,
  ADMIN_SHELL_CLASS,
  ADMIN_SIDEBAR_CLASS,
  adminPageTitle,
} from '../lib/adminChrome.ts';
import { ADMIN_CONTENT_ID } from '../lib/pagination.ts';
import { useAuthStore } from '../store/useAuthStore.ts';
import {
  IconBox,
  IconChart,
  IconClose,
  IconDashboard,
  IconFile,
  IconLogout,
  IconMenu,
  IconTag,
  IconUsers,
  IconWallet,
} from './icons.tsx';

const NAV_ICONS = {
  Dashboard: IconDashboard,
  Customers: IconUsers,
  Products: IconTag,
  Orders: IconBox,
  Coupons: IconWallet,
  Content: IconFile,
  Reports: IconChart,
} as const;

export default function AdminLayout() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAdminLogout();
  const [navOpen, setNavOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const title = adminPageTitle(location.pathname, location.search);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [navOpen]);

  const onLogout = () => {
    if (logout.isPending) return;
    logout.mutate();
  };

  return (
    <div className={ADMIN_SHELL_CLASS}>
      <aside className={ADMIN_SIDEBAR_CLASS}>
        <BrandRow />
        <AdminNav />
        <SidebarLogout pending={logout.isPending} onLogout={onLogout} />
      </aside>

      {navOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-navy/50 lg:hidden"
            onClick={() => setNavOpen(false)}
          />
          <aside id="admin-mobile-nav" className={ADMIN_DRAWER_CLASS}>
            <BrandRow onClose={() => setNavOpen(false)} closeRef={closeRef} />
            <AdminNav onNavigate={() => setNavOpen(false)} />
            <SidebarLogout pending={logout.isPending} onLogout={onLogout} />
          </aside>
        </>
      )}

      <div className={ADMIN_MAIN_CLASS}>
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-3 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-navy hover:bg-canvas lg:hidden"
              aria-label="Open menu"
              aria-expanded={navOpen}
              aria-controls="admin-mobile-nav"
              onClick={() => setNavOpen(true)}
            >
              <IconMenu />
            </button>
            <h1 className="truncate font-display text-[18px] font-extrabold text-navy sm:text-[22px]">{title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <p className="hidden max-w-[160px] truncate font-display text-[13px] font-bold text-navy sm:block">
              {user?.contactName || user?.email}
            </p>
            <span className="flex size-8 items-center justify-center rounded-full bg-canvas font-display text-[13px] font-extrabold text-navy">
              {(user?.contactName || user?.email || 'A').slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <div id={ADMIN_CONTENT_ID} className={ADMIN_CONTENT_CLASS}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function BrandRow({
  onClose,
  closeRef,
}: {
  onClose?: () => void;
  closeRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-4">
      <img src="/logo.png" alt="CAN-AM" className="h-[26px] w-[43px] rounded object-cover" />
      {onClose ? (
        <button
          ref={closeRef}
          type="button"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded p-1 hover:bg-white/10"
          aria-label="Close menu"
          onClick={onClose}
        >
          <IconClose />
        </button>
      ) : (
        <span className="font-display text-[11px] font-bold uppercase tracking-wide text-white/70">Admin</span>
      )}
    </div>
  );
}

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-2">
      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = NAV_ICONS[item.label];
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 px-4 py-3 font-display text-[13px] ${
                isActive ? 'bg-white/15 font-semibold' : 'font-medium text-white'
              }`
            }
          >
            <Icon />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarLogout({ pending, onLogout }: { pending: boolean; onLogout: () => void }) {
  return (
    <button
      type="button"
      className="mt-2 flex min-h-11 shrink-0 cursor-pointer items-center gap-3 border-t border-white/10 px-4 py-3 font-display text-[13px] font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
      onClick={onLogout}
      disabled={pending}
    >
      <IconLogout />
      {pending ? 'Signing out…' : 'Logout'}
    </button>
  );
}
