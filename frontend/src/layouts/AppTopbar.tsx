import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Logo } from '@/components/branding/Logo';
import { MobileSidebar } from '@/components/sidebar/MobileSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar, NavbarActions } from '@/components/ui/navbar';
import { useNavigationConfig } from '@/hooks/useNavigationConfig';

/**
 * The authenticated top bar: the mobile navigation trigger and brand, page
 * breadcrumbs, and search/notification placeholders. Account and theme controls
 * live in the sidebar footer, so the bar stays focused on wayfinding.
 */
export function AppTopbar() {
  const config = useNavigationConfig();

  return (
    <Navbar>
      <MobileSidebar />

      <Link to={config.homeRoute} className="md:hidden" aria-label="Home">
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
      </NavbarActions>
    </Navbar>
  );
}
