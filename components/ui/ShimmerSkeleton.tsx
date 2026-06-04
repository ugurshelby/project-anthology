import type { CSSProperties } from 'react';

interface ShimmerSkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function ShimmerSkeleton({ className = '', style }: ShimmerSkeletonProps) {
  return <div className={`shimmer ${className}`.trim()} style={style} aria-hidden />;
}

interface ShimmerGridProps {
  count?: number;
}

export function ShimmerGrid({ count = 6 }: ShimmerGridProps) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card shimmer" />
      ))}
    </div>
  );
}
