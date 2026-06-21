import type { ReactNode } from 'react';

/**
 * Hero number block (design.md §2.2). The figure is the visual hero; the label
 * sits quietly in low-contrast mono. Used for points, championship lead, counts.
 */
export function StatBlock({
  value,
  label,
  sublabel,
  size = 'lg',
  accent = false,
}: {
  value: ReactNode;
  label: string;
  sublabel?: string;
  size?: 'md' | 'lg' | 'xl';
  accent?: boolean;
}) {
  const sizeClass =
    size === 'xl'
      ? 'text-[clamp(72px,10vw,140px)]'
      : size === 'lg'
        ? 'text-[clamp(48px,7vw,96px)]'
        : 'text-[clamp(36px,5vw,64px)]';

  return (
    <div className="flex flex-col gap-2">
      <span className="label-caps text-text-mid">{label}</span>
      <span
        className={['hero-number', sizeClass, accent ? 'text-accent' : 'text-text-hi'].join(' ')}
      >
        {value}
      </span>
      {sublabel ? <span className="data-tabular text-text-low">{sublabel}</span> : null}
    </div>
  );
}
