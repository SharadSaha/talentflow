import { Suspense } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { Logo } from '@/components/branding/Logo';
import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/ui/mobile-nav';
import { Navbar, NavbarActions } from '@/components/ui/navbar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/ui/user-menu';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE_LABELS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { clearCredentials } from '@/reducers/authSlice';
import { selectSidebarCollapsed, toggleSidebar } from '@/reducers/uiSlice';
import { getNavItemsForRole, type NavItem } from '@/layouts/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Determines whether a nav destination matches the current location. */
function isActivePath(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

interface NavLinksProps {
  items: NavItem[];
  pathname: string;
  collapsed?: boolean;
}

/** Renders the primary nav links; shared by the sidebar and mobile drawer. */
function NavLinks({ items, pathname, collapsed = false }: NavLinksProps) {
  return (
    <SidebarNav>
      {items.map((item) => (
        <SidebarNavItem
          key={item.to}
          asChild
          icon={item.icon}
          label={item.label}
          active={isActivePath(pathname, item.to)}
          collapsed={collapsed}
        >
          <Link to={item.to} />
        </SidebarNavItem>
      ))}
    </SidebarNav>
  );
}

/**
 * Authenticated application shell: a collapsible sidebar (desktop), a top
 * navigation bar with a mobile drawer, theme toggle, and account menu, and a
 * suspense-wrapped content outlet ready for lazily loaded feature pages.
 */
export function AppLayout() {
  const { user, role } = useAuth();
  const collapsed = useAppSelector(selectSidebarCollapsed);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = getNavItemsForRole(role);
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} className="hidden md:flex">
        <SidebarHeader>
          <Link to={ROUTES.DASHBOARD} aria-label="Dashboard">
            <Logo iconOnly={collapsed} />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <NavLinks items={navItems} pathname={pathname} collapsed={collapsed} />
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar>
          <div className="md:hidden">
            <MobileNav title="Navigation">
              <NavLinks items={navItems} pathname={pathname} />
            </MobileNav>
          </div>
          <Link to={ROUTES.DASHBOARD} className="md:hidden" aria-label="Dashboard">
            <Logo />
          </Link>
          <NavbarActions>
            <ThemeToggle />
            {user ? (
              <UserMenu
                name={fullName}
                email={user.email}
                role={USER_ROLE_LABELS[user.role]}
                onLogout={handleLogout}
              />
            ) : null}
          </NavbarActions>
        </Navbar>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Suspense fallback={<FullPageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
