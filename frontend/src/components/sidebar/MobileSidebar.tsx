import { Menu } from 'lucide-react';

import { SidebarBody } from '@/components/sidebar/SidebarBody';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/hooks/useSidebar';

/**
 * Mobile navigation: a hamburger trigger and a left slide-over drawer built on
 * the shared `Sheet` (focus trap, scroll lock, backdrop, and Escape handled by
 * the primitive). The drawer renders the full sidebar and auto-closes on
 * navigation via the sidebar provider.
 */
export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <Menu />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SidebarBody collapsed={false} collapsible={false} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
