import { LogOut } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/utils/format';

/** An optional custom action rendered above the log-out item. */
export interface UserMenuItem {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onSelect: () => void;
}

export interface UserMenuProps {
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  onLogout: () => void;
  items?: UserMenuItem[];
  /** Custom trigger (e.g. a full-width sidebar row). Defaults to an avatar button. */
  trigger?: ReactNode;
  /** Alignment of the dropdown content relative to the trigger. */
  align?: 'start' | 'center' | 'end';
}

/** Account menu with the signed-in user's identity and a log-out action. */
export function UserMenu({
  name,
  email,
  role,
  avatarUrl,
  onLogout,
  items,
  trigger,
  align = 'end',
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={`Account menu for ${name}`}
          >
            <Avatar className="size-8">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">{name}</span>
          <span className="truncate text-xs font-normal text-foreground-muted">{email}</span>
          {role ? (
            <span className="truncate text-xs font-normal text-foreground-muted">{role}</span>
          ) : null}
        </DropdownMenuLabel>
        {items && items.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.label} onSelect={item.onSelect}>
                    {Icon ? <Icon className="size-4" /> : null}
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
