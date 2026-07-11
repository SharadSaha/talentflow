import * as SheetPrimitive from '@radix-ui/react-dialog';
import { type VariantProps, cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/** Root state container for a side sheet. */
export const Sheet = SheetPrimitive.Root;

/** The control that opens the sheet. */
export const SheetTrigger = SheetPrimitive.Trigger;

/** A control that closes the nearest open sheet. */
export const SheetClose = SheetPrimitive.Close;

const SheetOverlay = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(function SheetOverlay({ className, ...props }, ref) {
  return (
    <SheetPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-fade-in',
        className,
      )}
      {...props}
    />
  );
});

const sheetVariants = cva(
  cn(
    'fixed z-50 flex flex-col gap-4 bg-surface-elevated p-6 shadow-lg outline-none',
    'max-h-screen overflow-y-auto',
  ),
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b border-border data-[state=open]:animate-slide-in-top',
        bottom:
          'inset-x-0 bottom-0 border-t border-border data-[state=open]:animate-slide-in-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-border data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left',
        right:
          'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-border data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

export interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

/**
 * The sliding drawer surface anchored to a screen edge. Includes the overlay
 * and a built-in close button; scrolls internally on overflow.
 */
export const SheetContent = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(function SheetContent({ className, children, side = 'right', ...props }, ref) {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-sm text-foreground-muted transition-colors duration-fast ease-emphasized hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none',
          )}
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
});

/** Groups the title and description at the top of a sheet. */
export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 text-left', className)} {...props} />;
}

/** Groups action controls at the bottom of a sheet. */
export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export type SheetTitleProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>;

/** The accessible title of a sheet. */
export const SheetTitle = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  SheetTitleProps
>(function SheetTitle({ className, ...props }, ref) {
  return <SheetPrimitive.Title ref={ref} className={cn('text-h3', className)} {...props} />;
});

export type SheetDescriptionProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Description
>;

/** Supporting text describing the sheet's purpose. */
export const SheetDescription = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  SheetDescriptionProps
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <SheetPrimitive.Description
      ref={ref}
      className={cn('text-small text-foreground-muted', className)}
      {...props}
    />
  );
});
