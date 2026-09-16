export function SeasonTicker({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="overflow-hidden border-y border-hairline bg-white/[0.02] py-2.5">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-mid">
        {items.join('  ·  ')}
      </p>
    </div>
  );
}
