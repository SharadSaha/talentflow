import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RESET_DELAY_MS = 1500;

export interface CopyButtonProps {
  /** The text written to the clipboard when pressed. */
  value: string;
  className?: string;
  /** Button size (defaults to `icon`). */
  size?: ButtonProps['size'];
}

/** Copies a value to the clipboard, briefly confirming with a check icon. */
export function CopyButton({ value, className, size = 'icon' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), RESET_DELAY_MS);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy'}
      className={cn(className)}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
    </Button>
  );
}
