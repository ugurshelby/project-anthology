interface TrioItem {
  value: string | number;
  label: string;
}

/** Three-up stat row (WINS / PODIUMS / POLES). Mono labels, condensed figures. */
export function StatTrio({ items }: { items: [TrioItem, TrioItem, TrioItem] }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-hairline">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1 px-2 text-center first:pl-0 last:pr-0">
          <span className="hero-number text-[clamp(32px,4vw,52px)] text-text-hi">{item.value}</span>
          <span className="label-caps text-text-mid">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
