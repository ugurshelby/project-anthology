interface ShimmerGridProps {
  count?: number;
}

export function ShimmerGrid({ count = 6 }: ShimmerGridProps) {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card shimmer" />
      ))}
    </div>
  );
}
