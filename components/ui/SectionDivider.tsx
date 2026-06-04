interface SectionDividerProps {
  title: string;
}

export function SectionDivider({ title }: SectionDividerProps) {
  return (
    <div className="mb-6">
      <h2 className="section-divider">{title}</h2>
      <div className="section-divider-bar" aria-hidden />
    </div>
  );
}
