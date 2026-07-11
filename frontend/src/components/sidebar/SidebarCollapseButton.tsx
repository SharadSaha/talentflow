import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarCollapseButtonProps {
  collapsed: boolean;
  onToggle: () => void;
}

/** Toggles the desktop sidebar between expanded and mini (collapsed) modes. */
export function SidebarCollapseButton({ collapsed, onToggle }: SidebarCollapseButtonProps) {
  return (
    <Button
      variant="ghost"
      size={collapsed ? 'icon' : 'sm'}
      onClick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-pressed={collapsed}
      className={cn(!collapsed && 'gap-2 text-foreground-muted')}
    >
      {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      {!collapsed ? <span>Collapse</span> : null}
    </Button>
  );
}
