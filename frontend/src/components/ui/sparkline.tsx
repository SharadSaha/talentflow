import { useId } from 'react';

import { cn } from '@/lib/utils';

export interface SparklineProps {
  /** Series of values plotted left-to-right. Rendered as `currentColor`. */
  data: number[];
  /** Draw a soft area fill beneath the line. */
  area?: boolean;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

const DEFAULT_WIDTH = 96;
const DEFAULT_HEIGHT = 32;

/**
 * A tiny, dependency-free trend line. Values are normalised into the viewBox and
 * stroked with `currentColor`, so the caller controls colour via text utilities.
 * Purely decorative — hidden from assistive technology.
 */
export function Sparkline({
  data,
  area = true,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  strokeWidth = 1.75,
  className,
}: SparklineProps) {
  const gradientId = useId();

  if (data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const padY = strokeWidth;

  const points = data.map((value, index) => {
    const x = index * stepX;
    const y = height - padY - ((value - min) / range) * (height - padY * 2);
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={cn('overflow-visible text-primary', className)}
    >
      {area ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        </>
      ) : null}
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
