import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { type VariantProps, cva } from 'class-variance-authority';
import { Children, forwardRef, isValidElement } from 'react';

import { cn } from '@/lib/utils';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      sm: 'size-7',
      md: 'size-9',
      lg: 'size-11',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface AvatarProps
  extends
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

/**
 * Root avatar surface. Wraps a user image with graceful fallback rendering and
 * a fixed circular footprint governed by `size`.
 */
export const Avatar = forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  function Avatar({ className, size, ...props }, ref) {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      />
    );
  },
);

export type AvatarImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>;

/** The avatar photo; hidden automatically while loading or on error. */
export const AvatarImage = forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  );
});

export type AvatarFallbackProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>;

/** Text or icon fallback shown when the avatar image is unavailable. */
export const AvatarFallback = forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex size-full items-center justify-center bg-muted text-xs font-medium text-foreground-secondary',
        className,
      )}
      {...props}
    />
  );
});

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars to render before collapsing the remainder into a `+N`. */
  max?: number;
}

/**
 * Renders a stack of overlapping avatars. When `max` is set and exceeded, the
 * surplus collapses into a trailing `+N` count avatar.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { className, children, max, ...props },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement);
  const visible = typeof max === 'number' ? items.slice(0, max) : items;
  const overflow = items.length - visible.length;

  return (
    <div ref={ref} className={cn('flex items-center -space-x-2', className)} {...props}>
      {visible}
      {overflow > 0 && (
        <Avatar>
          <AvatarFallback>+{overflow}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});
