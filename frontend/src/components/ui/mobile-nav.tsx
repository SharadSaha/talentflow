import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export interface MobileNavProps {
  /** Navigation content rendered inside the drawer. */
  children: ReactNode;
  /** Accessible drawer title (defaults to "Menu"). */
  title?: string;
}

/**
 * A hamburger trigger that opens a left-slide navigation drawer. Intended for
 * compact viewports where the persistent sidebar is hidden.
 */
export function MobileNav({ children, title = 'Menu' }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
