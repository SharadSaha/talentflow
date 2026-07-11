import { Suspense } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, PanelLeftClose, PanelLeftOpen, Search, UserCircle } from 'lucide-react';

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Logo } from '@/components/branding/Logo';
import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { USER_ROLE_LABELS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import type { NavItem } from '@/layouts/navigation';
import { selectSidebarCollapsed, toggleSidebar } from '@/reducers/uiSlice';
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

export interface AppShellProps {
  /** Primary navigation for the active role. */
  navItems: NavItem[];
  /** Destination for the "Profile" account-menu entry. */
  profileRoute: string;
  /** Landing route for the brand/logo link (the role dashboard). */
  homeRoute: string;
}

/**
 * The reusable authenticated application shell: a collapsible, role-agnostic
 * sidebar, a top navigation bar (breadcrumbs, search + notification
 * placeholders, theme toggle, account menu), and a suspense-wrapped content
 * outlet for lazily loaded feature pages. Role-specific layouts supply the nav
 * and routes; this component holds no feature logic.
 */
export function AppShell({ navItems, profileRoute, homeRoute }: AppShellProps) {
  const { user, role } = useAuth();
  const collapsed = useAppSelector(selectSidebarCollapsed);
  const dispatch = useAppDispatch();
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} className="hidden md:flex">
        <SidebarHeader>
          <Link to={homeRoute} aria-label="Home">
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
          <Link to={homeRoute} className="md:hidden" aria-label="Home">
            <Logo iconOnly />
          </Link>

          <div className="hidden md:block">
            <Breadcrumbs />
          </div>

          <div className="ml-auto hidden max-w-xs flex-1 lg:block">
            <Input
              type="search"
              placeholder="Search…"
              aria-label="Search"
              disabled
              startIcon={<Search />}
              title="Search is coming soon"
            />
          </div>

          <NavbarActions className="ml-auto lg:ml-0">
            <Button
              variant="ghost"
              size="icon"
              disabled
              aria-label="Notifications"
              title="Notifications are coming soon"
            >
              <Bell />
            </Button>
            <ThemeToggle />
            {user ? (
              <UserMenu
                name={fullName}
                email={user.email}
                role={role ? USER_ROLE_LABELS[role] : undefined}
                onLogout={logout}
                items={[
                  {
                    label: 'Profile',
                    icon: UserCircle,
                    onSelect: () => navigate(profileRoute),
                  },
                ]}
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
