import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/** A single settings tab: its identity, trigger label/icon, and panel content. */
export interface SettingsTabItem {
  value: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

export interface SettingsTabsProps {
  items: SettingsTabItem[];
  defaultValue: string;
  /** Accessible name for the tab list. */
  ariaLabel: string;
}

/**
 * Config-driven wrapper around the design-system `Tabs`. Renders a horizontally
 * scrollable, keyboard-navigable tab list (Radix roving tabindex + arrow keys)
 * and the matching panel for each item. Shared by both settings pages.
 */
export function SettingsTabs({ items, defaultValue, ariaLabel }: SettingsTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList aria-label={ariaLabel} className="h-auto w-max flex-nowrap p-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={item.value} value={item.value} className="gap-2 px-3 py-1.5">
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} className="mt-6">
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
